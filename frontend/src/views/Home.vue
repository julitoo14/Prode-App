<script setup>
import BaseLayout from "@/layouts/BaseLayout.vue";
import { useAuth } from "@/store/auth";
const { user } = useAuth();
</script>

<template>
  <BaseLayout>
    <div class="flex flex-col items-center justify-center h-full p-4">
      <h2 class="text-2xl font-semibold my-4 text-center">Bienvenido {{user.userName}}</h2>

      <div class="w-full max-w-xs grid grid-cols-1 gap-5">
        <router-link to="/crear-torneo">
          <button class="w-full h-32 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg flex flex-col items-center justify-center text-lg transition-transform transform hover:scale-105">
            <img src="/icons/calendar.svg" alt="Crear Torneo" class="w-10 h-10 mb-2">
            <span>Crear Torneo</span>
          </button>
        </router-link>

        <router-link to="/torneos">
          <button class="w-full h-32 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg flex flex-col items-center justify-center text-lg transition-transform transform hover:scale-105">
            <img src="/icons/briefcase.svg" alt="Ver Torneos" class="w-10 h-10 mb-2">
            <span>Ver Torneos</span>
          </button>
        </router-link>

        <router-link to="/competiciones">
          <button class="w-full h-32 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg flex flex-col items-center justify-center text-lg transition-transform transform hover:scale-105">
            <img src="/icons/book.svg" alt="Ver Competiciones" class="w-10 h-10 mb-2">
            <span>Ver Competiciones</span>
          </button>
        </router-link>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>
/* Estilos adicionales si son necesarios */
</style>
