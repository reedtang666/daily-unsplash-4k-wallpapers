<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  dates: {
    type: Array,
    required: true
  },
  currentDate: {
    type: String,
    required: true
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:date'])

const isOpen = ref(false)
const currentMonth = ref(new Date())

// Available dates as Set for fast lookup
const availableDates = computed(() => {
  return new Set(props.dates.map(d => d.name))
})

// Get all dates that have wallpapers
const allDates = computed(() => {
  return props.dates.map(d => d.name)
})

// Generate calendar days for current month
const calendarDays = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()
  
  const days = []
  
  // Previous month days (empty placeholders)
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ day: null, date: null })
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    days.push({
      day,
      date: dateStr,
      hasWallpaper: availableDates.value.has(dateStr),
      isSelected: props.currentDate === dateStr
    })
  }
  
  return days
})

const monthName = computed(() => {
  return currentMonth.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

function prevMonth() {
  const current = new Date(currentMonth.value)
  current.setMonth(current.getMonth() - 1)
  currentMonth.value = current
}

function nextMonth() {
  const current = new Date(currentMonth.value)
  current.setMonth(current.getMonth() + 1)
  currentMonth.value = current
}

function selectDate(dateStr) {
  if (!dateStr) return
  emit('update:date', dateStr)
  isOpen.value = false
}

function formatDateDisplay(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Close on outside click
function handleClickOutside(event) {
  if (!event.target.closest('.calendar-container')) {
    isOpen.value = false
  }
}
</script>

<template>
  <div class="relative calendar-container" @click.stop>
    <!-- Trigger Button -->
    <button
      @click="isOpen = !isOpen"
      class="flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all duration-300 min-w-[200px]"
      :class="isDark 
        ? 'bg-gray-800 border-gray-700 text-white hover:border-blue-500' 
        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500'"
    >
      <i class="fa fa-calendar text-blue-500"></i>
      <span class="flex-1 text-left">{{ formatDateDisplay(currentDate) }}</span>
      <i 
        class="fa transition-transform duration-300" 
        :class="isOpen ? 'fa-chevron-up' : 'fa-chevron-down'"
      ></i>
    </button>

    <!-- Calendar Dropdown -->
    <Transition name="calendar">
      <div 
        v-if="isOpen"
        class="absolute top-full mt-2 p-4 rounded-xl shadow-2xl z-50 min-w-[320px]"
        :class="isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'"
      >
        <!-- Month Navigation -->
        <div class="flex items-center justify-between mb-4">
          <button
            @click="prevMonth"
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            :class="isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'"
          >
            <i class="fa fa-chevron-left"></i>
          </button>
          <span 
            class="font-semibold"
            :class="isDark ? 'text-white' : 'text-gray-800'"
          >
            {{ monthName }}
          </span>
          <button
            @click="nextMonth"
            class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            :class="isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'"
          >
            <i class="fa fa-chevron-right"></i>
          </button>
        </div>

        <!-- Weekday Headers -->
        <div class="grid grid-cols-7 gap-1 mb-2">
          <div 
            v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']" 
            :key="day"
            class="text-center text-xs font-medium py-2"
            :class="isDark ? 'text-gray-400' : 'text-gray-500'"
          >
            {{ day }}
          </div>
        </div>

        <!-- Calendar Days -->
        <div class="grid grid-cols-7 gap-1">
          <template v-for="(item, index) in calendarDays" :key="index">
            <button
              v-if="item.day"
              @click="selectDate(item.date)"
              class="relative w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-200"
              :class="[
                item.isSelected 
                  ? 'bg-blue-600 text-white' 
                  : item.hasWallpaper
                    ? isDark 
                      ? 'text-white hover:bg-blue-900/50' 
                      : 'text-gray-700 hover:bg-blue-50'
                    : isDark 
                      ? 'text-gray-600 cursor-not-allowed' 
                      : 'text-gray-300 cursor-not-allowed'
              ]"
              :disabled="!item.hasWallpaper"
            >
              {{ item.day }}
              <!-- Dot indicator for available dates -->
              <span 
                v-if="item.hasWallpaper && !item.isSelected"
                class="absolute bottom-1.5 w-1 h-1 rounded-full"
                :class="isDark ? 'bg-blue-400' : 'bg-blue-500'"
              ></span>
            </button>
            <div v-else class="w-10 h-10"></div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.calendar-enter-active,
.calendar-leave-active {
  transition: all 0.2s ease;
}

.calendar-enter-from,
.calendar-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>