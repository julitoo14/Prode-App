<script setup>
import { ref, onMounted } from 'vue';
import BaseLayout from "@/layouts/BaseLayout.vue";
import api from '@/services/api';
import { useAuth } from '@/store/auth';

const { user } = useAuth();

const tournamentName = ref('');
const selectedCompetition = ref('');
const password = ref('');
const competitions = ref([]);
const errorMessage = ref('');
const successMessage = ref('');

onMounted(async () => {
  try {
    const response = await api.getCompetitions();
    competitions.value = response.data.competitions;
  } catch (error) {
    errorMessage.value = 'Error al cargar las competiciones.';
  }
});

const createTournament = async () => {
  if (!tournamentName.value || !selectedCompetition.value || !password.value) {
    errorMessage.value = 'Por favor, completa todos los campos.';
    return;
  }

  try {
    const tournamentData = {
      name: tournamentName.value,
      competition: selectedCompetition.value,
      password: password.value,
      creator: user.value._id
    };
    const response = await api.createTournament(tournamentData);
    successMessage.value = '¡Torneo creado exitosamente!';
    // Limpiar formulario
    tournamentName.value = '';
    selectedCompetition.value = '';
    password.value = '';
    errorMessage.value = '';
  } catch (error) {
    errorMessage.value = 'Error al crear el torneo. Inténtalo de nuevo.';
    successMessage.value = '';
  }
};
</script>

<template>
  <BaseLayout>
    <div class="flex flex-col items-center justify-center p-4">
      <h2 class="text-2xl font-semibold my-4 text-center">Crear Nuevo Torneo</h2>

      <div class="w-full max-w-md">
        <form @submit.prevent="createTournament" class="bg-white shadow-md rounded-lg p-6">
          <div class="mb-4">
            <label for="tournamentName" class="block text-gray-700 text-sm font-bold mb-2">Nombre del Torneo</label>
            <input v-model="tournamentName" id="tournamentName" type="text" placeholder="Mi Super Torneo" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
          </div>

          <div class="mb-4">
            <label for="competition" class="block text-gray-700 text-sm font-bold mb-2">Competición</label>
            <select v-model="selectedCompetition" id="competition" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <option disabled value="">Selecciona una competición</option>
              <option v-for="comp in competitions" :key="comp._id" :value="comp._id">
                {{ comp.name }}
              </option>
            </select>
          </div>

          <div class="mb-6">
            <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Contraseña del Torneo</label>
            <input v-model="password" id="password" type="password" placeholder="******************" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline">
          </div>

          <div class="flex items-center justify-between">
            <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Crear Torneo
            </button>
          </div>

          <p v-if="errorMessage" class="text-red-500 text-xs italic mt-4">{{ errorMessage }}</p>
          <p v-if="successMessage" class="text-green-500 text-xs italic mt-4">{{ successMessage }}</p>
        </form>
      </div>
    </div>
  </BaseLayout>
</template>
