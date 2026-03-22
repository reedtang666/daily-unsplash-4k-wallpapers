import { ref } from 'vue'

const CONFIG = {
  GITHUB_USER: 'reedtang666',
  REPO_NAME: 'daily-unsplash-4k-wallpapers',
  BRANCH: 'main',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  GITHUB_TOKEN: import.meta.env.VITE_GITHUB_TOKEN || ''
}

// Build headers with optional token
function buildHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  }
  if (CONFIG.GITHUB_TOKEN) {
    headers['Authorization'] = `token ${CONFIG.GITHUB_TOKEN}`
  }
  return headers
}

// Simple in-memory cache
const cache = new Map()

function getCache(key) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() })
}

// Helper function for retry with delay
async function fetchWithRetry(url, options = {}, retries = CONFIG.MAX_RETRIES) {
  let lastError
  
  for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...buildHeaders(),
            ...options.headers
          }
        })
      
      if (!response.ok) {
        if (response.status === 404) {
          return { ok: true, status: 404, json: () => Promise.resolve([]) }
        }
        if (response.status === 403) {
          throw new Error('API rate limit exceeded. Please try again later.')
        }
        throw new Error(`HTTP ${response.status}`)
      }
      
      return response
    } catch (error) {
      lastError = error
      console.warn(`Fetch attempt ${i + 1} failed:`, error.message)
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * (i + 1)))
      }
    }
  }
  
  throw lastError
}

export function useWallpapers() {
  const dates = ref([])
  const wallpapers = ref([])
  const currentDate = ref('')
  const currentType = ref('desktop')
  const loading = ref(false)
  const error = ref(null)
  const theme = ref('')

  // Fetch all date folders from GitHub
  async function fetchDates() {
    try {
      error.value = null
      
      // Check cache first
      const cacheKey = 'dates'
      const cached = getCache(cacheKey)
      if (cached) {
        dates.value = cached.dates
        currentDate.value = cached.currentDate
        return
      }
      
      const url = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/contents/wallpapers?ref=${CONFIG.BRANCH}`
      
      const response = await fetchWithRetry(url)
      
      if (response.status === 404) {
        dates.value = []
        return
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format')
      }
      
      // Filter and sort date folders (newest first)
      const sortedDates = data
        .filter(item => item.type === 'dir' && /^\d{4}-\d{2}-\d{2}$/.test(item.name))
        .sort((a, b) => new Date(b.name) - new Date(a.name))
      
      dates.value = sortedDates
      
      if (dates.value.length > 0) {
        currentDate.value = dates.value[0].name
      }
      
      // Cache the result
      setCache(cacheKey, { dates: dates.value, currentDate: currentDate.value })
    } catch (e) {
      error.value = 'Failed to load dates. Please try again later.'
      console.error('Failed to fetch dates:', e)
    }
  }

  // Fetch wallpapers for specific date and type
  async function fetchWallpapers() {
    if (!currentDate.value || !currentType.value) return
    
    loading.value = true
    error.value = null
    
    try {
      // Handle 'all' type - fetch from all dates
      if (currentType.value === 'all') {
        await fetchAllWallpapers()
        loading.value = false
        return
      }
      
      // Check cache first
      const cacheKey = `wallpapers-${currentDate.value}-${currentType.value}`
      const cached = getCache(cacheKey)
      if (cached) {
        wallpapers.value = cached
        generateTheme()
        loading.value = false
        return
      }
      
      const url = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/contents/wallpapers/${currentDate.value}/${currentType.value}?ref=${CONFIG.BRANCH}`
      
      const response = await fetchWithRetry(url)
      
      if (response.status === 404) {
        wallpapers.value = []
        loading.value = false
        return
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format')
      }
      
      // Filter and sort images
      const result = data
        .filter(item => item.type === 'file' && item.name.endsWith('.jpg'))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(img => ({
          name: img.name,
          path: img.path,
          url: `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${img.path}`,
          downloadUrl: `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${img.path}`,
          date: currentDate.value,
          type: currentType.value
        }))
      
      wallpapers.value = result
      
      // Cache the result
      setCache(cacheKey, result)
      
      // Generate random theme
      generateTheme()
    } catch (e) {
      error.value = 'Failed to load wallpapers. Please try again later.'
      console.error('Failed to fetch wallpapers:', e)
    } finally {
      loading.value = false
    }
  }

  // Fetch all wallpapers from all dates for 'all' type
  async function fetchAllWallpapers() {
    const allImages = []
    
    // Check cache first
    const cacheKey = 'wallpapers-all'
    const cached = getCache(cacheKey)
    if (cached) {
      wallpapers.value = cached
      generateTheme()
      return
    }
    
    // Fetch from all dates (newest first)
    for (const dateFolder of dates.value) {
      const date = dateFolder.name
      
      // Fetch desktop images
      const desktopUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/contents/wallpapers/${date}/desktop?ref=${CONFIG.BRANCH}`
      try {
        const desktopResponse = await fetchWithRetry(desktopUrl)
        if (desktopResponse.status !== 404) {
          const desktopData = await desktopResponse.json()
          if (Array.isArray(desktopData)) {
            const desktopImages = desktopData
              .filter(item => item.type === 'file' && item.name.endsWith('.jpg'))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(img => ({
                name: img.name,
                path: img.path,
                url: `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${img.path}`,
                downloadUrl: `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${img.path}`,
                date: date,
                type: 'desktop'
              }))
            allImages.push(...desktopImages)
          }
        }
      } catch (e) {
        console.warn(`Failed to fetch desktop for ${date}:`, e)
      }
      
      // Fetch mobile images
      const mobileUrl = `https://api.github.com/repos/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/contents/wallpapers/${date}/mobile?ref=${CONFIG.BRANCH}`
      try {
        const mobileResponse = await fetchWithRetry(mobileUrl)
        if (mobileResponse.status !== 404) {
          const mobileData = await mobileResponse.json()
          if (Array.isArray(mobileData)) {
            const mobileImages = mobileData
              .filter(item => item.type === 'file' && item.name.endsWith('.jpg'))
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(img => ({
                name: img.name,
                path: img.path,
                url: `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${img.path}`,
                downloadUrl: `https://raw.githubusercontent.com/${CONFIG.GITHUB_USER}/${CONFIG.REPO_NAME}/${CONFIG.BRANCH}/${img.path}`,
                date: date,
                type: 'mobile'
              }))
            allImages.push(...mobileImages)
          }
        }
      } catch (e) {
        console.warn(`Failed to fetch mobile for ${date}:`, e)
      }
    }
    
    wallpapers.value = allImages
    
    // Cache the result
    setCache(cacheKey, allImages)
    
    // Generate random theme
    generateTheme()
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