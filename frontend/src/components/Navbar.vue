<script setup >
import { useRouter } from 'vue-router'
import { useAuth } from '../store/auth';

const router = useRouter()
const { isAuthenticated, logout } = useAuth();

const guestItems = [
  { name: 'Login', route: '/login' },
  { name: 'Register', route: '/register' },
];

const authItems = [
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
  <nav class="fixed bottom-0 w-full bg-white border-t flex justify-evenly py-2 md:static md:top-0 md:flex md:justify-center md:space-x-8 md:border-b md:py-4 md:bg-transparent">
      <button
        v-for="item in authItems"
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