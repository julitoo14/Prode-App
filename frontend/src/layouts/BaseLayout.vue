<script setup>

import Navbar from "@/components/Navbar.vue";
</script>

<template>
    <div class="min-h-screen flex flex-col bg-gray-100 text-gray-800">
      <!-- Header -->
      <Navbar class=""/>

      <!-- Main content -->
      <main class="flex-1 pb-20 md:pt-20 md:pt-0">
        <slot />
      </main>

      <!-- Footer -->
      <footer class="bg-white hidden md:block p-4 text-center text-sm text-gray-500">
        © 2025 ProdeApp - Hecho con ⚽️ por Julián
      </footer>
    </div>
  </template>


<style scoped>

</style>