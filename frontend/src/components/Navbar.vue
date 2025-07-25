<script setup >
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const items = [
  { name: 'Inicio', icon: '🏠', route: '/' },
  { name: 'Hábitos', icon: '📅', route: '/partidos' },
  { name: 'Progreso', icon: '🏆', route: '/torneos' },
  { name: 'Perfil', icon: '👤', route: '/profile' },
]

const navigate = (route) => {
  router.push(route)
}
</script>

<template>
  <nav class="fixed bottom-0 w-full bg-white border-t flex justify-around py-2 md:static md:top-0 md:flex md:justify-center md:space-x-8 md:border-b md:py-4 md:bg-transparent">
    <button
      v-for="item in items"
      :key="item.route"
      @click="navigate(item.route)"
      class="flex flex-col items-center text-sm text-gray-700 hover:text-blue-500 md:flex-row md:space-x-1"
    >
      <span class="text-xl md:hidden">{{ item.icon }}</span>
      <span class="hidden md:inline">{{ item.name }}</span>
    </button>
  </nav>
</template>

<style scoped>
nav {
  z-index: 50;
}
</style>