import os
import requests
from datetime import datetime
import random
from dotenv import load_dotenv  # 加载 .env 文件（本地开发用）

# -------------------------- 配置项 --------------------------
# 优先从环境变量读取 API Key，本地开发时从 .env 文件加载
load_dotenv()  # 加载项目根目录的 .env 文件（仅本地开发需要）
ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")  # 环境变量名：UNSPLASH_ACCESS_KEY

if not ACCESS_KEY:
    raise ValueError("❌ 未找到 Unsplash API Key！请配置环境变量 UNSPLASH_ACCESS_KEY")

DESKTOP_RES = (3840, 2160)  # 电脑 4K 分辨率（横屏）
MOBILE_RES = (1440, 2960)   # 手机 4K 分辨率（竖屏，适配主流旗舰机）
PER_PAGE = 10               # 每种类型抓取数量
# 随机主题列表（每次选1-2个，实现主题随机）
WALLPAPER_THEMES = [
    "serene lake",    # 静谧湖泊（治愈系，浅色调适配白天桌面）
    "snowy mountain", # 雪山（壮阔感，高对比度不挡图标）
    "twilight sky",   # 暮色天空（渐变色彩，适配锁屏/深色模式）
    "soft minimalist",# 柔和简约（低饱和度，不干扰桌面操作）
    "starry meadow",  # 星空草甸（意境感，夜间使用不刺眼）
    "ethereal architecture" # 空灵建筑（线条感强，适配图标排版）
]
# ------------------------------------------------------------

def get_random_theme():
    """随机选择1-2个主题"""
    num_themes = random.randint(1, 2)
    return ", ".join(random.sample(WALLPAPER_THEMES, num_themes))

def crawl_wallpapers(orientation, res_width, res_height, save_dir):
    """
    抓取指定方向和分辨率的壁纸
    :param orientation: 方向（landscape=横屏/desktop，portrait=竖屏/mobile）
    :param res_width: 宽度
    :param res_height: 高度
    :param save_dir: 保存目录
    """
    # 创建保存目录（不存在则创建）
    os.makedirs(save_dir, exist_ok=True)
    
    # 构造 API 请求参数
    theme = get_random_theme()
    url = "https://api.unsplash.com/search/photos"
    params = {
        "query": theme,
        "orientation": orientation,
        "per_page": PER_PAGE,
        "w": res_width,
        "h": res_height,
        "order_by": "latest"  # 按主题相关性排序
    }
    headers = {
        "Authorization": f"Client-ID {ACCESS_KEY}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=30)
        response.raise_for_status()  # 抛出 HTTP 错误
        data = response.json()["results"]
        
        if not data:
            print(f"⚠️  未获取到 {orientation} 壁纸（主题：{theme}）")
            return

        # 下载并保存图片
        for idx, photo in enumerate(data, 1):
            # 筛选免费图片（排除 Unsplash+ 付费图）
            if photo.get("premium", False):
                print(f"❌ 跳过付费图片：{photo['id']}")
                continue
            
            # 获取 4K 分辨率图片直链（crop=fill 保证尺寸精准）
            img_url = photo["urls"]["raw"] + f"&w={res_width}&h={res_height}&crop=fill"
            img_name = f"{orientation}_{idx:02d}.jpg"  # 命名：desktop_01.jpg
            save_path = os.path.join(save_dir, img_name)

            # 下载图片
            img_response = requests.get(img_url, timeout=20)
            with open(save_path, "wb") as f:
                f.write(img_response.content)
            
            print(f"✅ 保存成功：{save_path}（作者：{photo['user']['name']}）")

    except Exception as e:
        print(f"❌ 抓取失败：{str(e)}")

if __name__ == "__main__":
    # 获取当前日期（格式：yyyy-mm-dd）
    today = datetime.now().strftime("%Y-%m-%d")
    base_dir = os.path.join(os.getcwd(), "wallpapers", today)

    # 1. 抓取电脑 4K 壁纸（横屏）
    desktop_dir = os.path.join(base_dir, "desktop")
    print(f"📥 开始抓取电脑 4K 壁纸（主题：{get_random_theme()}）")
    crawl_wallpapers("landscape", DESKTOP_RES[0], DESKTOP_RES[1], desktop_dir)

    # 2. 抓取手机 4K 壁纸（竖屏）
    mobile_dir = os.path.join(base_dir, "mobile")
    print(f"\n📥 开始抓取手机 4K 壁纸（主题：{get_random_theme()}）")
    crawl_wallpapers("portrait", MOBILE_RES[0], MOBILE_RES[1], mobile_dir)

    print(f"\n🎉 抓取完成！所有壁纸已保存至：{base_dir}")