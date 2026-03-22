<script setup>
import { ref, onMounted } from 'vue'
import { useWallpapers } from './composables/useWallpapers'
import WallpaperCard from './components/WallpaperCard.vue'
import DateSelector from './components/DateSelector.vue'
import TypeToggle from './components/TypeToggle.vue'
import ThemeBadge from './components/ThemeBadge.vue'
import ImagePreview from './components/ImagePreview.vue'

const {
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
} = useWallpapers()

// Dark mode
const isDark = ref(false)

// Image preview
const previewWallpaper = ref(null)

function toggleDarkMode() {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

function openPreview(wallpaper) {
  previewWallpaper.value = wallpaper
}

function closePreview() {
  previewWallpaper.value = null
}

// Check system preference
onMounted(() => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
  fetchDates().then(() => {
    fetchWallpapers()
  })
})
</script>

<template>
  <div 
    class="min-h-screen transition-colors duration-300 overflow-y-auto"
    :class="isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'"
  >
    <!-- Animated Background -->
    <div class="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div 
        class="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        :class="isDark ? 'bg-blue-600' : 'bg-blue-300'"
        style="top: -10%; left: -10%; animation: float 6s ease-in-out infinite;"
      ></div>
      <div 
        class="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        :class="isDark ? 'bg-purple-600' : 'bg-purple-300'"
        style="top: 50%; right: -10%; animation: float 8s ease-in-out infinite reverse;"
      ></div>
    </div>

    <!-- Header -->
    <header 
      class="sticky top-0 z-50 glass border-b"
      :class="isDark ? 'border-gray-700' : 'border-gray-200'"
    >
      <div class="container mx-auto px-4 py-4">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <!-- Logo -->
          <h1 class="text-2xl font-bold flex items-center gap-2 animate-fade-in">
            <span 
              class="w-10 h-10 rounded-xl flex items-center justify-center text-white"
              :class="isDark ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'"
            >
              <i class="fa fa-image"></i>
            </span>
            <span :class="isDark ? 'text-white' : 'text-blue-600'">Daily 4K</span>
          </h1>
          
          <!-- Right Side -->
          <div class="flex items-center gap-4">
            <!-- Dark Mode Toggle -->
            <button
              @click="toggleDarkMode"
              class="p-2 rounded-xl transition-all duration-300 hover:scale-110"
              :class="isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-md'"
            >
              <i :class="isDark ? 'fa fa-sun-o' : 'fa fa-moon-o'" class="text-lg"></i>
            </button>
            
            <!-- GitHub Link -->
            <a
              href="https://github.com/reedtang666/daily-unsplash-4k-wallpapers"
              target="_blank"
              class="px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
              :class="isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-900 text-white hover:bg-gray-800'"
            >
              <i class="fa fa-github mr-2"></i>GitHub
            </a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Filters -->
      <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-8">
        <DateSelector 
          :dates="dates" 
          :currentDate="currentDate"
          :isDark="isDark"
          @update:date="setDate"
        />
        
        <TypeToggle 
          :currentType="currentType" 
          :isDark="isDark"
          @update:type="setType"
        />
      </div>

      <!-- Theme Badge -->
      <ThemeBadge :theme="theme" :isDark="isDark" />

      <!-- Error State -->
      <div v-if="error" class="text-center py-16">
        <div 
          class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
          :class="isDark ? 'bg-red-900/30' : 'bg-red-100'"
        >
          <i class="fa fa-exclamation-circle text-3xl text-red-500"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2">Failed to load wallpapers</h3>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-500'">{{ error }}</p>
      </div>

      <!-- Loading State -->
      <div v-else-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div 
          v-for="i in 8" 
          :key="i"
          class="rounded-xl overflow-hidden skeleton h-64"
        ></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="wallpapers.length === 0" class="text-center py-16">
        <div 
          class="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
          :class="isDark ? 'bg-gray-800' : 'bg-gray-100'"
        >
          <i class="fa fa-folder-open text-3xl" :class="isDark ? 'text-gray-400' : 'text-gray-500'"></i>
        </div>
        <h3 class="text-xl font-semibold mb-2">No wallpapers found</h3>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-500'">Try selecting a different date</p>
      </div>

      <!-- Wallpaper Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <TransitionGroup name="wallpaper">
          <WallpaperCard 
            v-for="(wallpaper, index) in wallpapers" 
            :key="wallpaper.name"
            :wallpaper="wallpaper"
            :type="currentType"
            :isDark="isDark"
            :style="{ animationDelay: `${index * 50}ms` }"
            @preview="openPreview"
          />
        </TransitionGroup>
      </div>
    </main>

    <!-- Footer -->
    <footer 
      class="py-6 mt-12 border-t"
      :class="isDark ? 'border-gray-800' : 'border-gray-200'"
    >
      <div class="container mx-auto px-4 text-center" :class="isDark ? 'text-gray-400' : 'text-gray-600'">
        <p>© 2026 Daily Unsplash 4K Wallpapers</p>
        <p class="text-sm mt-2">
          Images from 
          <a href="https://unsplash.com" target="_blank" class="text-blue-500 hover:underline">Unsplash</a>
          | Free for personal & commercial use
        </p>
      </div>
    </footer>

    <!-- Image Preview Modal -->
    <ImagePreview 
      :wallpaper="previewWallpaper" 
      :isDark="isDark"
      @close="closePreview"
    />
  </div>
</template>

<style scoped>
.wallpaper-enter-active {
  transition: all 0.5s ease-out;
}

.wallpaper-leave-active {
  transition: all 0.3s ease-in;
}

.wallpaper-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.wallpaper-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.wallpaper-move {
  transition: transform 0.5s ease;
}
</style>