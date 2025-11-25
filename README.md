# Daily Unsplash 4K Wallpapers 🖼️

An open-source project that **automatically crawls 4K wallpapers from Unsplash** (10 desktop + 10 mobile wallpapers daily) and provides an English static website for browsing & downloading by date.

Powered by GitHub Actions (auto-run at 7:00 AM Shanghai Time) and GitHub Pages.

## 🌟 Features

- **Auto-Crawling**: Daily 7:00 AM (Asia/Shanghai) automatic crawl via GitHub Actions
- **High Quality**: 4K resolution (3840x2160 for desktop, 1440x2960 for mobile)
- **Random Themes**: Daily random themes (nature, city, galaxy, etc.)
- **English Website**: Responsive UI for browsing/downloading wallpapers by date
- **Open Source**: Full code transparency, easy to fork and customize
- **Secure**: API Key stored in GitHub Secrets (no hardcoding)

## 📸 Preview

### Website Screenshot
![Website Preview](https://via.placeholder.com/1200x600?text=Daily+Unsplash+4K+Wallpapers+Preview)
*(Replace with your actual website screenshot after deployment)*

### Project Structure
```
daily-unsplash-4k-wallpapers/
├── .github/workflows/       # GitHub Actions auto-crawl config
├── scripts/                 # Crawler scripts
├── wallpapers/              # Auto-generated wallpaper storage (by date)
├── docs/                    # Static website (GitHub Pages)
├── .env                     # Local development config (not tracked by Git)
└── requirements.txt         # Python dependencies
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+ (for local development)
- Git
- Unsplash Developer Account & API Key (free: [Unsplash Developers](https://unsplash.com/developers))

### 1. Fork & Clone the Repository
```bash
# Fork this repo first, then clone your forked version
git clone https://github.com/your-username/daily-unsplash-4k-wallpapers.git
cd daily-unsplash-4k-wallpapers
```

### 2. Configure Unsplash API Key
#### Option A: Local Development
1. Create a `.env` file in the project root:
   ```env
   UNSPLASH_ACCESS_KEY=your-unsplash-api-key-here
   ```
2. Add `.env` to `.gitignore` (already included in this project)

#### Option B: GitHub Actions (Auto-Crawl)
1. Go to your forked repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `UNSPLASH_ACCESS_KEY`
4. Value: Your Unsplash API Key
5. Click **Add secret**

### 3. Install Dependencies (macOS/Linux/Windows)
Use a Python virtual environment (required for macOS to avoid `externally-managed-environment` error):
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux
source venv/bin/activate
# Windows (CMD)
venv\Scripts\activate.bat
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 4. Run Locally
```bash
# Run crawler manually (will generate wallpapers in ./wallpapers/[today-date]/)
python scripts/crawl_wallpapers.py

# Preview website (open docs/index.html in your browser)
open docs/index.html  # macOS
start docs/index.html # Windows
```

## 🌐 Website Deployment (GitHub Pages)
1. Push all code to your forked GitHub repository
2. Go to repo → **Settings** → **Pages**
3. Under "Source":
   - Select "Deploy from a branch"
   - Branch: `main` → `/docs`
   - Click **Save**
4. Wait 1-2 minutes for deployment
5. Access your website at: `https://your-username.github.io/daily-unsplash-4k-wallpapers`

## ⚙️ Configuration Customization
### 1. Change Crawl Time
Modify the `cron` expression in `.github/workflows/auto-crawl.yml`:
```yaml
on:
  schedule:
    - cron: '0 7 * * *'  # Change to your desired time (Shanghai Time)
      timezone: 'Asia/Shanghai'
```

### 2. Adjust Wallpaper Quantity/Resolution
Edit `scripts/crawl_wallpapers.py`:
```python
DESKTOP_RES = (3840, 2160)  # 4K desktop resolution
MOBILE_RES = (1440, 2960)   # 4K mobile resolution
PER_PAGE = 10               # Number of wallpapers per type (desktop/mobile)
```

### 3. Add Custom Themes
Update the `THEMES` list in `scripts/crawl_wallpapers.py`:
```python
THEMES = [
    "nature", "mountain", "ocean", "forest", "city", 
    "night", "sunset", "galaxy", "your-custom-theme"  # Add your own
]
```

## 📋 Usage
### Browse Wallpapers
- Visit the deployed website
- Select a date from the dropdown menu
- Toggle between "Desktop" and "Mobile" wallpapers
- Click the download icon (bottom-right of each image) to save to local

### Auto-Crawl Logic
- GitHub Actions runs daily at 7:00 AM Shanghai Time
- Crawls 10 desktop (landscape) + 10 mobile (portrait) 4K wallpapers
- Saves wallpapers to `wallpapers/YYYY-MM-DD/desktop/` and `wallpapers/YYYY-MM-DD/mobile/`
- Auto-commits and pushes new wallpapers to the repository
- Website automatically loads the latest wallpapers via GitHub API

## 🚨 Important Notes
### Unsplash API Limits
- Free plan: 50 requests per hour
- This project uses ~2 requests per crawl (safe for free plan)

### Copyright Compliance
- All wallpapers are sourced from [Unsplash](https://unsplash.com/)
- Free for **personal & commercial use** (requires attribution to the original photographer)
- See [Unsplash License](https://unsplash.com/license) for details

### Storage Considerations
- 4K wallpapers are ~10-20MB each → 20 wallpapers/day ≈ 200-400MB/month
- To avoid excessive storage usage:
  - Add a cleanup script to delete wallpapers older than 30 days (see [Wiki](https://github.com/your-username/daily-unsplash-4k-wallpapers/wiki/Cleanup-Old-Wallpapers))
  - Enable GitHub LFS (Large File Storage) for wallpaper files

## 🤝 Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -m "feat: add your feature"`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for more details (optional, add this file if you want to expand).

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgements
- [Unsplash](https://unsplash.com/) for providing high-quality free wallpapers
- [GitHub Actions](https://github.com/features/actions) for automation
- [GitHub Pages](https://pages.github.com/) for free website hosting
- [Tailwind CSS](https://tailwindcss.com/) for responsive UI

---

Made with ❤️ by [your-name](https://github.com/your-username)

If you like this project, please give it a ⭐ on GitHub!