<script setup>
import { onMounted, ref } from 'vue';
import axios from "axios";
import { router } from "../routes.js";
import { API_BASE_URL } from "../config.js";

const habit = ref('');

const addTimer = ref(false);

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const icons = [
  '/icons/book.svg',
  '/icons/briefcase.svg',
  '/icons/calendar.svg',
  '/icons/dolar.svg',
  '/icons/estadistica.svg',
  '/icons/map.svg',
];

const submitForm = async () => {
  const id = router.currentRoute.value.params.id;
  if (habit.value.tipo === 'meta') {
    habit.value.dias_de_la_semana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  }
  try {
    const response = await axios.put(`${API_BASE_URL}/habit/edit/${id}`, habit.value);
    await router.push('/');
  } catch (error) {
    console.error(error);
  }
};

const deleteHabit = async () => {
  const id = router.currentRoute.value.params.id;
  try {
    const response = await axios.delete(`${API_BASE_URL}/habit/delete/${id}`);
    await router.push('/');
  } catch (error) {
    console.error(error);
  }
}

const getHabit = async () => {
  const id = router.currentRoute.value.params.id;
  try {
    const response = await axios.get(`${API_BASE_URL}/habit/one/${id}`);
    habit.value = response.data.habit;
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  getHabit();
});
</script>

<template>
  <form class="p-4 sm:w-1/2 mx-auto" @submit.prevent="submitForm">
    <div class="flex flex-row justify-between items-center w-full">
    <h1 class="text-3xl font-bold ">Edit your habit!</h1>
    <button class="bg-cyan-600 text-white p-2 hover:bg-cyan-500" @click="router.push('/')">Go Back</button>
    </div>

    <div class="mb-3">
      <label for="timerRadio" class="block text-xl font-medium text-gray-700">Temporizador</label>
      <div id="timerRadio" class="mt-2 flex flex-row justify-start items-center gap-2">
        <div class="flex items-center ">
          <input class="mr-2" type="radio" id="timer" :value="true" v-model="addTimer">
          <label class="text-base" for="timer">Si</label>
        </div>
        <div class="flex items-center">
          <input class="mr-2" type="radio" id="noTimer" :value="false" v-model="addTimer">
          <label class="text-base" for="noTimer">No</label>
        </div>
      </div>
    </div>

    <div class="mb-3">
      <label for="habitName" class="block text-xl font-medium text-gray-700">Nombre</label>
      <input type="text" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 p-2 sm:text-base" id="habitName" v-model="habit.nombre" placeholder="Nombre del hábito">
    </div>

    <div class="mb-3">
      <label for="habitDescription" class="block text-xl font-medium text-gray-700">Descripción</label>
      <textarea class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base p-2" id="habitDescription" v-model="habit.descripcion" placeholder="Descripción del hábito"></textarea>
    </div>

    <div v-if="habit.tipo !== 'meta'" class="mb-3">
      <label class="block text-xl font-medium text-gray-700">Días</label>
      <div class="mt-2 flex flex-row justify-start flex-wrap items-center gap-2">
        <div class="flex items-center mb-2" v-for="day in days" :key="day">
          <input class="mr-2" type="checkbox" :id="day" v-model="habit.dias_de_la_semana" :value="day">
          <label class="text-base" :for="day">{{ day }}</label>
        </div>
      </div>
    </div>

    <div v-if="addTimer" class="mb-3">
      <label for="habitTime" class="block text-xl font-medium text-gray-700">Tiempo</label>
      <input type="number" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base p-2" placeholder="Tiempo deseado (en minutos)" id="habitTime" v-model="habit.tiempo">
    </div>

    <div v-if="habit.tipo === 'meta'" class="mb-3">
      <label for="habitDeadline" class="block text-xl font-medium text-gray-700">Fecha Límite</label>
      <input type="date" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base" id="habitDeadline" v-model="habit.fecha_limite">
    </div>

    <div class="mb-3">
      <label for="habitColor" class="block text-xl font-medium text-gray-700">Color</label>
      <input type="color" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-base" id="habitColor" v-model="habit.color" title="Elige un color">
    </div>

    <div class="mb-3">
      <label for="habitIcon" class="block text-xl font-medium text-gray-700">Icono</label>
      <div id="habitIcon" class="flex flex-row flex-wrap mt-2 gap-2">
        <div class="flex items-center mb-2" v-for="icon in icons" :key="icon">
          <input class="mr-2" type="radio" :id="icon" :value="icon" v-model="habit.icon">
          <label class="text-base" :for="icon">
            <img :src="icon" alt="icon" width="24" height="24">
          </label>
        </div>
      </div>
    </div>

    <button type="submit" class="mt-4 mr-6 px-4 py-2 bg-cyan-600 text-white rounded-md  hover:bg-cyan-500">Actualizar</button>
    <button type="button" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-md  hover:bg-red-500" @click="deleteHabit">Delete</button>
  </form>
</template>

<style scoped>
</style>