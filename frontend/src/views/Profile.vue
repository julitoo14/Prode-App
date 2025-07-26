<template>
  <BaseLayout>
    <div class="min-h-screen bg-gray-100">
      <div class="container mx-auto p-4">
        <div v-if="user" class="bg-white rounded-lg shadow-md p-6">
          <h1 class="text-2xl font-bold mb-4">Perfil de Usuario</h1>
          <div class="mb-4">
            <p class="text-gray-600"><strong>Nombre:</strong> {{ user.userName }}</p>
            <p class="text-gray-600"><strong>Email:</strong> {{ user.email }}</p>
          </div>
          <button @click="logout" class="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
            Cerrar Sesión
          </button>
        </div>
        <div v-else>
          <div class="flex justify-center items-center h-64">
            <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>

<script setup>
import { computed } from 'vue';
import { useAuth } from '../store/auth';
import BaseLayout from "@/layouts/BaseLayout.vue";

const { user, logout } = useAuth();
</script>
