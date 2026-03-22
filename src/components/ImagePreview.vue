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
        <div class="relative max-w-[90vw] max-h-[90vh]">
          <!-- Loading -->
          <div 
            v-if="!isLoaded"
            class="absolute inset-0 flex items-center justify-center"
          >
            <div class="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
          </div>

          <!-- Image -->
          <img 
            :src="wallpaper.url" 
            :alt="wallpaper.name"
            class="max-w-full max-h-[90vh] object-contain rounded-lg transition-opacity duration-300"
            :class="isLoaded ? 'opacity-100' : 'opacity-0'"
            @load="handleLoad"
          />
        </div>

        <!-- Bottom Info -->
        <div class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <span class="text-white/80 text-sm">{{ wallpaper.name }}</span>
          <a
            :href="wallpaper.downloadUrl"
            target="_blank"
            class="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-all duration-300 flex items-center gap-2"
          >
            <i class="fa fa-download"></i>
            Download
          </a>
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