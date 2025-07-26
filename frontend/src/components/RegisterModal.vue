
<template>
  <div class="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" @click.self="$emit('close')">
    <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="mt-3 text-center">
        <h3 class="text-lg leading-6 font-medium text-gray-900">Registrarse</h3>
        <div class="mt-2 px-7 py-3">
          <input type="text" v-model="userName" placeholder="Nombre" class="mb-3 px-3 py-2 border rounded w-full">
          <input type="email" v-model="email" placeholder="Email" class="mb-3 px-3 py-2 border rounded w-full">
          <input type="password" v-model="password" placeholder="Contraseña" class="mb-3 px-3 py-2 border rounded w-full">
        </div>
        <div class="items-center px-4 py-3">
          <button @click="register" class="px-4 py-2 bg-green-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-300">
            Registrarse
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const emit = defineEmits(['close']);

const userName = ref('');
const email = ref('');
const password = ref('');

const register = async () => {
  try {
    await api.register({ userName: userName.value, email: email.value, password: password.value });
    emit('close');
  } catch (error) {
    console.error('Error registering:', error);
  }
};
</script>