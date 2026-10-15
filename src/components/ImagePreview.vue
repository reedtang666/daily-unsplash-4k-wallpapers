<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  wallpaper: {
    type: Object,
    default: null
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const isLoaded = ref(false)
const isDownloading = ref(false)

function close() {
  emit('close')
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    close()
  }
}

function handleBackdropClick(e) {
  if (e.target === e.currentTarget) {
    close()
  }
}

async function handleDownload() {
  if (!props.wallpaper || !props.wallpaper.downloadUrl || isDownloading.value) return
  isDownloading.value = true

  try {
    const res = await fetch(props.wallpaper.downloadUrl)
    if (!res.ok) throw new Error('Download failed')
    const blob = await res.blob()
    const blobUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobUrl
    const fileName = `${props.wallpaper.date || 'wallpaper'}_${props.wallpaper.name || '4k.jpg'}`
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(blobUrl)
  } catch (err) {
    // 跨域或网络限制时回退到新窗口打开
    window.open(props.wallpaper.downloadUrl, '_blank')
  } finally {
    isDownloading.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})

function handleLoad() {
  isLoaded.value = true
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="wallpaper"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        @click="handleBackdropClick"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/90 backdrop-blur-sm"></div>

        <!-- Close Button -->
        <button
          @click="close"
          class="absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 z-10"
        >
          <i class="fa fa-times text-xl"></i>
        </button>

        <!-- Image Container -->
        <div class="relative max-w-[90vw] max-h-[82vh] flex flex-col items-center">
          <!-- Loading Spinner -->
          <div 
            v-if="!isLoaded"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div class="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>

          <!-- Image -->
          <img 
            :src="wallpaper.url" 
            :alt="wallpaper.title || wallpaper.name"
            class="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl transition-opacity duration-300"
            :class="isLoaded ? 'opacity-100' : 'opacity-0'"
            @load="handleLoad"
          />
        </div>

        <!-- Bottom Info & Download Bar -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row items-center gap-3 px-6 py-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-white z-10 shadow-xl max-w-[90vw]">
          <div class="text-center sm:text-left truncate max-w-xs sm:max-w-md">
            <p class="text-sm font-semibold truncate">{{ wallpaper.title || wallpaper.name }}</p>
            <p v-if="wallpaper.author" class="text-xs text-gray-400">
              Photo by 
              <a :href="wallpaper.authorUrl" target="_blank" class="text-blue-400 hover:underline">
                {{ wallpaper.author }}
              </a> 
              on Unsplash
            </p>
          </div>

          <button
            @click="handleDownload"
            :disabled="isDownloading"
            class="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium transition-all duration-300 flex items-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            <i :class="isDownloading ? 'fa fa-spinner fa-spin' : 'fa fa-download'"></i>
            <span>{{ isDownloading ? 'Downloading 4K...' : 'Download 4K' }}</span>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from img,
.modal-leave-to img {
  transform: scale(0.9);
}
</style>