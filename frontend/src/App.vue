<script setup>
import Navbar from "./components/Navbar.vue";
import {RouterView} from "vue-router";
import { ref, onMounted } from 'vue';

// Estado del modo oscuro
const isDarkMode = ref(false);

// Alternar el modo oscuro y guardar la preferencia en localStorage
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  const theme = isDarkMode.value ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
};

// Verificar el modo guardado en localStorage al montar el componente
onMounted(() => {
  const theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    isDarkMode.value = true;
  }
});

</script>

<template>
  <div  :class="{ 'dark': isDarkMode }">
    <header>
      <Navbar @cambiarTema="toggleDarkMode" />
    </header>
    <main class=" dark:bg-black flex flex-col gap-2 p-3 min-h-screen">
      <RouterView />
    </main>
  </div>
</template>

<style scoped> 

</style>
