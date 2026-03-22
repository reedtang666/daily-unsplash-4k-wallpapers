<script setup>
import { ref } from 'vue'

const props = defineProps({
  wallpaper: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    default: 'desktop'
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['preview'])

const isLoaded = ref(false)
const isHovered = ref(false)

function handleLoad() {
  isLoaded.value = true
}

function openPreview() {
  emit('preview', props.wallpaper)
}
</script>

<template>
  <div 
    class="wallpaper-card rounded-xl overflow-hidden cursor-pointer animate-fade-in"
    :class="isDark ? 'bg-gray-800' : 'bg-white'"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Image Container -->
    <div 
      class="relative overflow-hidden"
      :class="wallpaper.type === 'mobile' ? 'aspect-9/16' : 'aspect-video'"
    >
      <!-- Skeleton Loader -->
      <div 
        v-if="!isLoaded"
        class="absolute inset-0 skeleton"
      ></div>
      
      <!-- Image -->
      <img 
        :src="wallpaper.url" 
        :alt="`${type} wallpaper`"
        class="w-full h-full object-cover transition-all duration-500"
        :class="isLoaded ? 'opacity-100' : 'opacity-0'"
        :style="{ 
          transform: isHovered ? 'scale(1.05)' : 'scale(1)'
        }"
        @load="handleLoad"
      />
      
      <!-- Overlay on Hover -->
      <div 
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300"
        :class="isHovered ? 'opacity-100' : ''"
      ></div>
      
      <!-- Preview Button (fullscreen) -->
      <button
        @click.stop="openPreview"
        class="absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110"
        :class="isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'"
        style="background: linear-gradient(135deg, #3b82f6, #8b5cf6);"
      >
        <i class="fa fa-expand text-white"></i>
      </button>
    </div>
    
    <!-- Info -->
    <div class="p-3">
      <p 
        class="text-sm font-medium truncate"
        :class="isDark ? 'text-gray-200' : 'text-gray-700'"
      >
        {{ wallpaper.name }}
      </p>
      <p 
        class="text-xs mt-1"
        :class="isDark ? 'text-gray-400' : 'text-gray-500'"
      >
        4K {{ (wallpaper.type || type).charAt(0).toUpperCase() + (wallpaper.type || type).slice(1) }}
        <span v-if="wallpaper.date" class="ml-2">· {{ wallpaper.date }}</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.wallpaper-card {
  animation: slideUp 0.5s ease-out backwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>