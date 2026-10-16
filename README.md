# Daily Unsplash 4K Wallpapers 🖼️

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-blue?style=flat&logo=github)](https://reedtang666.github.io/daily-unsplash-4k-wallpapers/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue 3](https://img.shields.io/badge/Vue-3.x-brightgreen?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

An automated 4K wallpaper curation and static website that **crawls top-tier 4K wallpapers from Unsplash daily** (20 desktop + 20 mobile, total 40 wallpapers/day). 

Powered by **GitHub Actions** (auto-crawling & deployment) and **GitHub Pages**.

🔗 **Live Website**: [https://reedtang666.github.io/daily-unsplash-4k-wallpapers/](https://reedtang666.github.io/daily-unsplash-4k-wallpapers/)

---

## 🌟 Key Features

* **⚡ Lightweight CDN Architecture (Zero Git Bloat)**:
  * No bulky image binaries stored in Git! The crawler stores Unsplash high-speed global CDN links and metadata in a compact JSON file (`~8 KB`).
  * Your Git repository stays lightweight forever, with instantaneous clones and pushes.
* **🖼️ 40 High-Res Wallpapers Daily**:
  * **20 Desktop 4K** (3840 × 2160) landscape wallpapers
  * **20 Mobile 4K** (1440 × 2960) portrait wallpapers
* **🎨 15 Curated Photography Themes**:
  * Covers aurora borealis, deep space galaxies, snowy alpine peaks, serene emerald lakes, aerial coastlines, misty golden forests, desert dunes, and cyberpunk cities.
* **⚡ Instant UI & Zero API Limits**:
  * Built with Vue 3 and Tailwind CSS.
  * Wallpapers render in milliseconds with optimized preview thumbnails.
  * Real-time live sync with cloud data, eliminating GitHub REST API rate limits.
* **📥 One-Click 4K Download**:
  * Streamed Blob download preserving full 3840×2160 resolution without browser interception.
  * Photographer credit and Unsplash profile attributions included.
* **🤖 Fully Automated Workflow**:
  * Scheduled crawl runs daily at 05:23 AM (Asia/Shanghai) via GitHub Actions.
  * Automatically commits new wallpaper metadata and triggers GitHub Pages re-deployment.

---

## 📸 Preview

### Desktop & Mobile Responsive UI
* **Dark / Light Theme Switcher**
* **Calendar Date Picker**
* **Desktop / Mobile Orientation Filter**
* **Full-Screen 4K Modal Preview with Zoom & Download**

---

## 📁 Project Structure

```text
daily-unsplash-4k-wallpapers/
├── .github/
│   └── workflows/
│       ├── auto-crawl.yml       # Daily automated crawl & commit workflow
│       └── deploy.yml           # GitHub Pages Vite build & deploy workflow
├── data/
│   └── wallpapers.json          # Core wallpaper metadata database (~8 KB)
├── public/
│   └── data/                    # Static asset copy for Vite production builds
├── scripts/
│   └── crawl_wallpapers.py      # Python Unsplash crawler script
├── src/                         # Vue 3 frontend application
│   ├── components/              # UI components (DateSelector, Preview, etc.)
│   ├── composables/             # State & data fetching logic (useWallpapers.js)
│   ├── App.vue
│   └── main.js
├── .env                         # Local environment variables (ignored by Git)
├── package.json                 # Node.js dependencies & scripts
├── requirements.txt             # Python crawler dependencies
└── vite.config.js               # Vite build configuration
```

---

## 🎯 15 Curated Photography Themes

Every day, the crawler randomly selects 1–2 themes from this curated photography pool:

| Category | Themes | Visual Description |
| :--- | :--- | :--- |
| **Mountains & Lakes** | `snowy mountain`, `serene lake`, `foggy forest` | Majestic alpine reflections, misty woodland rays |
| **Autumn & Water** | `autumn golden forest`, `iceland waterfall`, `calm ocean` | Golden red foliage, Icelandic volcanic waterfalls, turquoise sea |
| **Skies & Sunset** | `aerial coastline`, `twilight sky`, `golden sunset` | Drone coastline view, dusk gradients, golden hour oceans |
| **Night & Cosmos** | `aurora borealis`, `milky way galaxy`, `starry meadow` | Vibrant green auroras, high-contrast galaxy trails, night meadows |
| **Architecture & Land** | `desert dunes sunset`, `cyberpunk city`, `ethereal architecture` | Sand dune curves, futuristic neon nightscape, minimal lines |

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** 18+ & **npm**
* **Python** 3.10+ (for local crawler execution)
* **Unsplash Developer Key** (free at [Unsplash Developers](https://unsplash.com/developers))

### 1. Clone the Repository
```bash
git clone https://github.com/reedtang666/daily-unsplash-4k-wallpapers.git
cd daily-unsplash-4k-wallpapers
```

### 2. Configure Unsplash API Key

#### For Local Crawling:
Create a `.env` file in the root directory:
```env
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

#### For GitHub Actions Automation:
1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Name: `UNSPLASH_ACCESS_KEY`
4. Value: Paste your Unsplash Access Key.

### 3. Local Development

#### Start Frontend:
```bash
npm install
npm run dev
```

#### Run Crawler Manually:
```bash
pip install -r requirements.txt
python scripts/crawl_wallpapers.py
```

#### Build for Production:
```bash
npm run build
```

---

## 🌐 GitHub Pages Deployment Guide

1. Ensure the repository's Pages settings use **GitHub Actions**:
   * Navigate to: **Settings → Pages**
   * Under **Build and deployment → Source**, select **`GitHub Actions`**.
2. Push your changes to the `main` branch:
   ```bash
   git push origin main
   ```
3. GitHub Actions will automatically build Vite and deploy the artifacts to GitHub Pages within ~1 minute.

---

## ⚙️ Customization

### 1. Changing Crawl Schedule
Modify the cron schedule in `.github/workflows/auto-crawl.yml`:
```yaml
on:
  schedule:
    - cron: '23 21 * * *'  # UTC 21:23 = 05:23 AM Asia/Shanghai (next day)
  workflow_dispatch:       # Enables manual one-click trigger from GitHub Actions tab
```

### 2. Adjusting Wallpaper Counts
Edit `PER_PAGE` in `scripts/crawl_wallpapers.py`:
```python
PER_PAGE = 20  # Number of wallpapers per type (20 desktop + 20 mobile = 40/day)
```

---

## ⚖️ Copyright & License

* All photos are powered by the **[Unsplash API](https://unsplash.com/)** under the [Unsplash License](https://unsplash.com/license) (free for personal and commercial use with attribution).
* Source code is licensed under the **[MIT License](LICENSE)**.

---

Made with ❤️ by [reedtang666](https://github.com/reedtang666)
