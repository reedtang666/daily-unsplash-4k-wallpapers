// 配置项：仓库用户名和分支（替换为你的信息）
const CONFIG = {
    GITHUB_USER: "你的GitHub用户名",
    REPO_NAME: "daily-unsplash-4k-wallpapers",
    BRANCH: "main"
};

// 全局状态
let currentDate = "";
let currentType = "desktop"; // 默认显示电脑壁纸

// DOM 元素
const dateSelect = document.getElementById("dateSelect");
const desktopBtn = document.getElementById("desktopBtn");
const mobileBtn = document.getElementById("mobileBtn");
const wallpaperGrid = document.getElementById("wallpaperGrid");
const themeInfo = document.getElementById("themeInfo");
const themeText = document.getElementById("themeText");
const themeToggle = document.getElementById("themeToggle");

// 初始化：加载日期列表 + 最新壁纸
document.addEventListener("DOMContentLoaded", async () => {
    await loadDateList();
    loadWallpapers(currentDate, currentType);
    initEventListeners();
});

// 1. 加载日期列表（从 GitHub 仓库的 wallpapers 目录获取所有日期文件夹）
async function loadDateList() {
    try {
        const url = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/contents/wallpapers?ref=${CONFIG.BRANCH}`;
        const response = await fetch(url);
        const data = await response.json();

        // 筛选文件夹，提取日期（按时间倒序排序）
        const dateFolders = data
            .filter(item => item.type === "dir" && /^\d{4}-\d{2}-\d{2}$/.test(item.name))
            .sort((a, b) => new Date(b.name) - new Date(a.name));

        if (dateFolders.length === 0) {
            dateSelect.innerHTML = "<option value=''>No wallpapers found</option>";
            return;
        }

        // 生成日期选项
        dateFolders.forEach(folder => {
            const option = document.createElement("option");
            option.value = folder.name;
            option.textContent = formatDate(folder.name); // 格式化日期显示（如：Nov 25, 2025）
            dateSelect.appendChild(option);
        });

        // 默认选中最新日期
        currentDate = dateFolders[0].name;
        dateSelect.value = currentDate;

    } catch (error) {
        console.error("Failed to load date list:", error);
        wallpaperGrid.innerHTML = "<div class='col-span-full text-center py-12 text-red-500'><i class='fa fa-exclamation-circle text-2xl mb-3'></i><p>Failed to load date list</p></div>";
    }
}

// 2. 加载指定日期和类型的壁纸
async function loadWallpapers(date, type) {
    if (!date || !type) return;

    // 显示加载中
    wallpaperGrid.innerHTML = "<div class='col-span-full text-center py-12 text-gray-500'><i class='fa fa-spinner fa-spin text-2xl mb-3'></i><p>Loading wallpapers...</p></div>";

    try {
        // 1. 获取该日期下对应类型的所有图片
        const url = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/contents/wallpapers/${date}/${type}?ref=${CONFIG.BRANCH}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.message === "Not Found") {
            wallpaperGrid.innerHTML = "<div class='col-span-full text-center py-12 text-gray-500'><i class='fa fa-folder-open text-2xl mb-3'></i><p>No wallpapers found for this date</p></div>";
            return;
        }

        // 2. 生成图片 HTML（按文件名排序）
        const sortedImages = data
            .filter(item => item.type === "file" && item.name.endsWith(".jpg"))
            .sort((a, b) => a.name.localeCompare(b.name));

        let html = "";
        sortedImages.forEach(img => {
            // 图片原始链接（GitHub Raw 地址）
            const imgUrl = `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${img.path}`;
            // 下载链接（同原始链接，浏览器会触发下载）
            const downloadUrl = imgUrl;

            html += `
                <div class="wallpaper-card bg-white rounded-lg overflow-hidden shadow-md">
                    <div class="relative">
                        <img src="${imgUrl}" alt="${type} wallpaper - ${date}" class="w-full h-64 object-cover">
                        <a href="${downloadUrl}" download="${date}_${img.name}" class="download-btn absolute bottom-3 right-3 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition">
                            <i class="fa fa-download"></i>
                        </a>
                    </div>
                    <div class="p-3">
                        <p class="text-sm">${img.name}</p>
                        <p class="text-xs text-gray-500 mt-1">4K ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                    </div>
                </div>
            `;
        });

        wallpaperGrid.innerHTML = html;

        // 显示主题信息（随机生成，实际可存储在爬虫脚本的主题文件中）
        const randomTheme = getRandomThemeText();
        themeText.textContent = randomTheme;
        themeInfo.classList.remove("hidden");

    } catch (error) {
        console.error("Failed to load wallpapers:", error);
        wallpaperGrid.innerHTML = "<div class='col-span-full text-center py-12 text-red-500'><i class='fa fa-exclamation-circle text-2xl mb-3'></i><p>Failed to load wallpapers</p></div>";
    }
}

// 3. 初始化事件监听
function initEventListeners() {
    // 日期选择变更
    dateSelect.addEventListener("change", (e) => {
        currentDate = e.target.value;
        loadWallpapers(currentDate, currentType);
    });

    // 壁纸类型切换
    desktopBtn.addEventListener("click", () => {
        currentType = "desktop";
        desktopBtn.classList.add("bg-blue-600", "text-white");
        desktopBtn.classList.remove("bg-gray-200");
        mobileBtn.classList.add("bg-gray-200");
        mobileBtn.classList.remove("bg-blue-600", "text-white");
        loadWallpapers(currentDate, currentType);
    });

    mobileBtn.addEventListener("click", () => {
        currentType = "mobile";
        mobileBtn.classList.add("bg-blue-600", "text-white");
        mobileBtn.classList.remove("bg-gray-200");
        desktopBtn.classList.add("bg-gray-200");
        desktopBtn.classList.remove("bg-blue-600", "text-white");
        loadWallpapers(currentDate, currentType);
    });

    // 暗黑模式切换
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        themeToggle.innerHTML = isDark 
            ? "<i class='fa fa-sun-o mr-1'></i>Light Mode" 
            : "<i class='fa fa-moon-o mr-1'></i>Dark Mode";
    });
}

// 工具函数：格式化日期（yyyy-mm-dd → Mmm dd, yyyy）
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

// 工具函数：随机生成主题文本（实际可从爬虫脚本中存储的主题文件读取）
function getRandomThemeText() {
    const themes = [
        "Serene Nature Landscapes", "Vibrant City Skylines", "Mystical Night Skies",
        "Lush Forest Trails", "Calm Ocean Waves", "Majestic Mountain Peaks",
        "Minimalist Architecture", "Colorful Sunset Horizons", "Starry Galaxies"
    ];
    return themes[Math.floor(Math.random() * themes.length)];
}