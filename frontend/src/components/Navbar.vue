<template>
  <nav class="flex flex-row justify-center dark:bg-black bg-gray-100 text-cyan-600 dark:text-violet-700 text-xl sm:text-3xl w-full h-16">
    <RouterLink class="hidden sm:flex flex-row items-center hover:text-cyan-500  dark:hover:text-violet-600 text-black dark:text-white absolute left-4 top-1 w-12 h-12 p-0 " to="/"><img src="/icons/check.svg">Habits</RouterLink>
    <ul class="flex flex-row items-center justify-around gap-5 sm:w-1/3 font-semibold mx-auto">
      <li>
        <RouterLink class="hover:text-cyan-500 dark:hover:text-violet-600" aria-current="page" to="/">Inicio</RouterLink>
      </li>
      <li>
        <RouterLink class="hover:text-cyan-500  dark:hover:text-violet-600" to="/userHabits">Historial</RouterLink>
      </li>
      <li>
        <button @click="emit('cambiarTema')">
          Tema
        </button>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
  nav{
    border-bottom: rgba(30, 29, 29, 0.3) 3px solid;
  }
</style>

<script setup>
import { defineEmits } from 'vue';
const emit = defineEmits(['cambiarTema']);
</script>