<script setup>
defineProps({
  theme: {
    type: String,
    default: ''
  },
  isDark: {
    type: Boolean,
    default: false
  }
})
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="theme"
      class="inline-flex items-center gap-3 px-5 py-3 rounded-xl mb-6"
      :class="isDark 
        ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-700/30' 
        : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'"
    >
      <div 
        class="w-8 h-8 rounded-lg flex items-center justify-center"
        :class="isDark ? 'bg-blue-800' : 'bg-blue-100'"
      >
        <i class="fa fa-star text-sm" :class="isDark ? 'text-blue-400' : 'text-blue-600'"></i>
      </div>
      <div>
        <span class="text-xs uppercase tracking-wider" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          Today's Theme
        </span>
        <p class="font-semibold" :class="isDark ? 'text-white' : 'text-gray-800'">
          {{ theme }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>