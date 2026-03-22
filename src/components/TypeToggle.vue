<script setup>
const props = defineProps({
  currentType: {
    type: String,
    required: true
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:type'])

function setType(type) {
  emit('update:type', type)
}
</script>

<template>
  <div class="flex gap-2 p-1 rounded-xl" :class="isDark ? 'bg-gray-800' : 'bg-white'">
    <!-- Desktop Button -->
    <button
      @click="setType('desktop')"
      class="px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
      :class="currentType === 'desktop' 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
        : isDark 
          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
    >
      <i class="fa fa-desktop"></i>
      Desktop
    </button>
    
    <!-- Mobile Button -->
    <button
      @click="setType('mobile')"
      class="px-5 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center gap-2"
      :class="currentType === 'mobile' 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' 
        : isDark 
          ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
    >
      <i class="fa fa-mobile"></i>
      Mobile
    </button>
  </div>
</template>