<script setup>
import { ref } from 'vue';
import LoginModal from '../components/LoginModal.vue';
import RegisterModal from '../components/RegisterModal.vue';

const showLoginModal = ref(false);
const showRegisterModal = ref(false);
</script>

<template>
  <div class="min-h-screen relative flex flex-col items-center justify-center text-center px-4 bg-gray-50 overflow-hidden">
    <div
      class="absolute inset-0 bg-cover bg-center"
      style="background-image: url('/futbolargentinojpg.webp');"
    >
      <div class="absolute inset-0 bg-green-950 opacity-60"></div>
    </div>

    <div class="relative z-10 md:w-2/4 mx-auto px-2">
      <h1 class="text-3xl md:text-6xl font-bold mb-10 text-white text-center">Prode Oeste</h1>
      <p class="mb-4 text-gray-200 md:text-lg text-left mb-8">
        Participá de torneos, hacé tus pronósticos y competí con tus amigos. Demostrá que sos el mejor pronosticador de fútbol argentino.
      </p>
      <div class="flex flex-col w-3/5 md:w-full md:flex-row gap-y-4 md:gap-x-4 mx-auto mb-6 justify-center">
        <button @click="showLoginModal = true" class="bg-green-800 text-white px-6 py-2 rounded hover:bg-green-700 transition">
          Iniciar sesión
        </button>
        <button @click="showRegisterModal = true"
            class="bg-green-800 text-white px-6 py-2 rounded hover:bg-green-700 transition">
          Registrate gratis
        </button>
      </div>

    </div>
    <LoginModal v-if="showLoginModal" @close="showLoginModal = false" />
    <RegisterModal v-if="showRegisterModal" @close="showRegisterModal = false" />
  </div>
</template>

<style scoped>
</style>
