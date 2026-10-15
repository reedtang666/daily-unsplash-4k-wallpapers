import { ref } from 'vue'

const CONFIG = {
  GITHUB_USER: 'reedtang666',
  REPO_NAME: 'daily-unsplash-4k-wallpapers',
  BRANCH: 'main',
  // 静态 JSON 文件路径（跟随 Vite 打包 base 路径）
  STATIC_DATA_URL: `${import.meta.env.BASE_URL}data/wallpapers.json`,
  // GitHub Raw 备选路径
  RAW_DATA_URL: 'https://raw.githubusercontent.com/reedtang666/daily-unsplash-4k-wallpapers/main/data/wallpapers.json'
}

export function useWallpapers() {
  const dates = ref([])
  const wallpapers = ref([])
  const currentDate = ref('')
  const currentType = ref('desktop')
  const loading = ref(false)
  const error = ref(null)
  const theme = ref('')

  // 内部缓存完整的 JSON 数据
  const cachedData = ref(null)

  // 获取所有壁纸数据（一次请求获取全部日期与直链，零 API 限制）
  async function loadAllData() {
    if (cachedData.value) {
      return cachedData.value
    }

    loading.value = true
    error.value = null

    try {
      let response
      // 1. 优先从站点自带的静态数据加载
      try {
        response = await fetch(CONFIG.STATIC_DATA_URL, { cache: 'no-cache' })
        if (!response.ok) throw new Error('Static data not found')
      } catch (err) {
        // 2. 备选方案：从 GitHub Raw 加载最新数据
        console.warn('Fallback to GitHub Raw data:', err.message)
        response = await fetch(CONFIG.RAW_DATA_URL, { cache: 'no-cache' })
      }

      if (!response.ok) {
        throw new Error(`Failed to load wallpaper database (HTTP ${response.status})`)
      }

      const data = await response.json()
      cachedData.value = data
      return data
    } catch (err) {
      console.error('Error fetching wallpapers JSON:', err)
      error.value = 'Failed to load wallpapers. Please check back later.'
      return null
    } finally {
      loading.value = false
    }
  }

  // 初始化日期列表
  async function fetchDates() {
    const data = await loadAllData()
    if (!data || !data.dates || data.dates.length === 0) {
      dates.value = []
      currentDate.value = ''
      return
    }

    // 格式化为组件需要的 [{ name: '2026-03-24' }, ...]
    dates.value = data.dates.map(dateStr => ({ name: dateStr }))

    // 默认选中最新的日期
    if (!currentDate.value || !data.dates.includes(currentDate.value)) {
      currentDate.value = data.dates[0]
    }
  }

  // 根据当前选择的日期和类型过滤壁纸
  async function fetchWallpapers() {
    loading.value = true
    error.value = null

    try {
      const data = await loadAllData()
      if (!data || !data.wallpapers) {
        wallpapers.value = []
        return
      }

      // 如果选了 "all" 类型，汇总该日期的所有横屏和竖屏，或者汇总所有日期的壁纸
      if (currentType.value === 'all') {
        const allList = []
        // 如果有指定日期，展示该日期的所有类型
        if (currentDate.value && data.wallpapers[currentDate.value]) {
          const dayData = data.wallpapers[currentDate.value]
          allList.push(...(dayData.desktop || []))
          allList.push(...(dayData.mobile || []))
          if (dayData.theme) {
            theme.value = dayData.theme
          }
        } else {
          // 否则汇总全部日期的壁纸
          for (const d of data.dates) {
            const dayData = data.wallpapers[d]
            if (dayData) {
              allList.push(...(dayData.desktop || []))
              allList.push(...(dayData.mobile || []))
            }
          }
        }
        wallpapers.value = allList
        return
      }

      // 单一类型 (desktop 或 mobile)
      const dayData = data.wallpapers[currentDate.value]
      if (!dayData) {
        wallpapers.value = []
        return
      }

      // 设置当前主题
      if (dayData.theme) {
        theme.value = dayData.theme
      } else {
        generateTheme()
      }

      const list = dayData[currentType.value] || []
      wallpapers.value = list
    } catch (err) {
      console.error('Error in fetchWallpapers:', err)
      error.value = 'Failed to load wallpapers.'
    } finally {
      loading.value = false
    }
  }

  function generateTheme() {
    const themes = [
      'Serene Nature Landscapes',
      'Vibrant City Skylines',
      'Mystical Night Skies',
      'Lush Forest Trails',
      'Calm Ocean Waves',
      'Majestic Mountain Peaks',
      'Minimalist Architecture',
      'Colorful Sunset Horizons',
      'Starry Galaxies'
    ]
    theme.value = themes[Math.floor(Math.random() * themes.length)]
  }

  function setDate(date) {
    currentDate.value = date
    fetchWallpapers()
  }

  function setType(type) {
    currentType.value = type
    fetchWallpapers()
  }

  // Format date for display
  function formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return {
    dates,
    wallpapers,
    currentDate,
    currentType,
    loading,
    error,
    theme,
    fetchDates,
    fetchWallpapers,
    setDate,
    setType,
    formatDate
  }
}