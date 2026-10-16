import os
import json
from datetime import datetime, timezone, timedelta
import random
import requests
from dotenv import load_dotenv

# -------------------------- 配置项 --------------------------
load_dotenv()
ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")

if not ACCESS_KEY:
    raise ValueError("❌ 未找到 Unsplash API Key！请配置环境变量 UNSPLASH_ACCESS_KEY")

DESKTOP_RES = (3840, 2160)  # 电脑 4K 分辨率（横屏）
MOBILE_RES = (1440, 2960)   # 手机 4K 分辨率（竖屏）
PER_PAGE = 20               # 每种类型抓取数量（电脑 20 张 + 手机 20 张 = 每天 40 张）

WALLPAPER_THEMES = [
    # 🏔️ 壮丽山湖与森林
    "snowy mountain",         # 壮美雪山
    "serene lake",            # 静谧湖泊倒影
    "foggy forest",           # 晨雾森林
    "autumn golden forest",   # 金秋红叶森林
    "iceland waterfall",      # 冰岛瀑布奇观

    # 🌊 海洋与落日晚霞
    "calm ocean",             # 平静蔚蓝海洋
    "aerial coastline",       # 航拍俯瞰海岸线
    "twilight sky",           # 暮色渐变天空
    "golden sunset",          # 金色夕阳晚霞

    # 🌌 夜空与极光宇宙
    "aurora borealis",        # 绚丽北极光
    "milky way galaxy",       # 深空银河宇宙
    "starry meadow",          # 星空草甸

    # 🏙️ 建筑与大漠奇观
    "desert dunes sunset",    # 沙漠沙丘光影
    "cyberpunk city",         # 赛博朋克夜城
    "ethereal architecture"   # 空灵现代建筑线条
]

def get_random_theme():
    """随机选择 1-2 个主题"""
    num_themes = random.randint(1, 2)
    return ", ".join(random.sample(WALLPAPER_THEMES, num_themes))

def fetch_unsplash_wallpapers(theme, orientation, res_width, res_height, type_name):
    """
    通过 Unsplash API 获取壁纸元数据与 4K 直链
    """
    url = "https://api.unsplash.com/search/photos"
    params = {
        "query": theme,
        "orientation": orientation,
        "per_page": PER_PAGE,
        "order_by": "latest"
    }
    headers = {
        "Authorization": f"Client-ID {ACCESS_KEY}",
        "User-Agent": "DailyUnsplash4K/2.0"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()
        data = response.json().get("results", [])

        wallpapers = []
        idx = 1
        for photo in data:
            if photo.get("premium", False):
                continue

            raw_url = photo.get("urls", {}).get("raw", "")
            if not raw_url:
                continue

            # 4K 高清原图下载链接（裁剪为目标 4K 比例，质量 100%）
            download_url = f"{raw_url}&w={res_width}&h={res_height}&crop=fill&q=100"
            # 网页流畅预览图链接（轻量化 1920/1080 宽度，保证加载速度）
            preview_width = 1920 if type_name == "desktop" else 1080
            preview_url = photo.get("urls", {}).get("regular") or f"{raw_url}&w={preview_width}&q=80"

            title = (
                photo.get("description")
                or photo.get("alt_description")
                or f"{theme.capitalize()} 4K Wallpaper"
            )

            wallpapers.append({
                "id": photo.get("id"),
                "name": f"{type_name}_{idx:02d}.jpg",
                "title": title,
                "author": photo.get("user", {}).get("name", "Unknown Artist"),
                "authorUrl": photo.get("user", {}).get("links", {}).get("html", "https://unsplash.com"),
                "url": preview_url,
                "downloadUrl": download_url,
                "rawUrl": raw_url,
                "width": res_width,
                "height": res_height,
                "type": type_name
            })
            idx += 1

        print(f"✅ 获取到 {len(wallpapers)} 张 {type_name} 壁纸（主题：{theme}）")
        return wallpapers

    except Exception as e:
        print(f"❌ 抓取 {type_name} 失败: {str(e)}")
        return []

def update_wallpapers_data(today_date, theme, desktop_list, mobile_list):
    """
    更新并持久化到 data/wallpapers.json 以及 public/data/wallpapers.json
    保持历史日期不被覆盖，新日期插入最前
    """
    target_files = [
        os.path.join(os.getcwd(), "data", "wallpapers.json"),
        os.path.join(os.getcwd(), "public", "data", "wallpapers.json")
    ]

    # 读取已有数据
    existing_data = {"dates": [], "wallpapers": {}}
    for fpath in target_files:
        if os.path.exists(fpath):
            try:
                with open(fpath, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
                    if "dates" in existing_data and "wallpapers" in existing_data:
                        break
            except Exception:
                pass

    dates = existing_data.get("dates", [])
    wallpapers_map = existing_data.get("wallpapers", {})

    # 更新今天的壁纸数据
    for item in desktop_list:
        item["date"] = today_date
    for item in mobile_list:
        item["date"] = today_date

    wallpapers_map[today_date] = {
        "theme": theme,
        "date": today_date,
        "desktop": desktop_list,
        "mobile": mobile_list
    }

    if today_date not in dates:
        dates.insert(0, today_date)
    else:
        # 确保按时间降序排列
        dates.sort(reverse=True)

    result_data = {
        "updatedAt": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "dates": dates,
        "wallpapers": wallpapers_map
    }

    # 写入各目标路径
    for fpath in target_files:
        os.makedirs(os.path.dirname(fpath), exist_ok=True)
        with open(fpath, "w", encoding="utf-8") as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)
        print(f"📁 数据已同步保存至: {fpath}")

if __name__ == "__main__":
    beijing_tz = timezone(timedelta(hours=8))
    today = datetime.now(beijing_tz).strftime("%Y-%m-%d")
    current_theme = get_random_theme()
    print(f"🚀 开始抓取 {today} Unsplash 4K 壁纸（主题: {current_theme}）")

    # 1. 获取电脑横屏 4K 壁纸
    desktops = fetch_unsplash_wallpapers(current_theme, "landscape", DESKTOP_RES[0], DESKTOP_RES[1], "desktop")

    # 2. 获取手机竖屏 4K 壁纸
    mobiles = fetch_unsplash_wallpapers(current_theme, "portrait", MOBILE_RES[0], MOBILE_RES[1], "mobile")

    # 3. 写入 JSON 数据源（无需下载任何庞大图片文件）
    if desktops or mobiles:
        update_wallpapers_data(today, current_theme, desktops, mobiles)
        print(f"🎉 抓取成功！全部壁纸直链已保存，体积仅几 KB，无 Git 仓库膨胀困扰！")
    else:
        print("⚠️ 未获取到有效壁纸数据，保留原有数据不变。")