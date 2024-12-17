<script setup>
import { ref } from 'vue';
import axios from "axios";
import { router } from "../routes.js";
import { API_BASE_URL } from "../config.js";

const habit = ref({
  tipo: '',
  nombre: '',
  descripcion: '',
  dias_de_la_semana: [],
  fecha_limite: '',
  color: '#000000',
  icon: '',
  id_user: '66c419f4dc99848d21092cad'
});

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
  if (habit.value.tipo === 'meta') {
    habit.value.dias_de_la_semana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  }
  const response = await axios.post(`${API_BASE_URL}/habit/add`, habit.value);
  router.push('/');
};
</script>

<template>
  <form class="p-4 sm:w-1/2 mx-auto" @submit.prevent="submitForm">
    <h1 class="text-3xl font-bold mb-4">New Habit</h1>

    <div class="mb-3">
      <label for="habitType" class="block text-xl font-medium text-gray-700">Tipo</label>
      <div id="habitType" class="mt-2 flex flex-row justify-start items-center gap-2">
        <div class="flex items-center">
          <input class="mr-2" type="radio" id="meta" value="meta" v-model="habit.tipo">
          <label class="text-base" for="meta">Con Meta</label>
        </div>
        <div class="flex items-center ">
          <input class="mr-2" type="radio" id="buen" value="buen habito" v-model="habit.tipo">
          <label class="text-base" for="buen">Buen Hábito</label>
        </div>
        <div class="flex items-center">
          <input class="mr-2" type="radio" id="mal" value="mal habito" v-model="habit.tipo">
          <label class="text-base" for="mal">Mal Hábito</label>
        </div>
      </div>
    </div>

    <div class="mb-3">
      <label for="timerRadio" class="block text-xl font-medium text-gray-700">Temporizador</label>
      <div id="timerRadio" class="mt-2 flex flex-row justify-start items-center gap-2">
        <div class="flex items-center">
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
      <input type="text"
             class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 p-2 sm:text-base"
             id="habitName" v-model="habit.nombre" placeholder="Nombre del hábito">
    </div>

    <div class="mb-3">
      <label for="habitDescription" class="block text-xl font-medium text-gray-700">Descripción</label>
      <textarea
          class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500 sm:text-base p-2"
          id="habitDescription" v-model="habit.descripcion" placeholder="Descripción del hábito"></textarea>
    </div>

    <div v-if="habit.tipo !== 'meta'" class="mb-3">
      <label class="block text-xl font-medium text-gray-700">Días</label>
      <div class="mt-2 flex flex-row justify-start flex-wrap items-center gap-2">
        <div class="flex items-center mb-2" v-for="day in days" :key="day">
          <input class="mr-2" type="checkbox" :id="day" v-model="habit.dias_de_la_semana" :value="day">
          <label class="sm:text-base" :for="day">{{ day }}</label>
        </div>
      </div>
    </div>

    <div v-if="addTimer" class="mb-3">
      <label for="habitTime" class="block text-xl font-medium text-gray-700">Tiempo</label>
      <input type="number"
             class="mt-1 block p-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
             placeholder="Tiempo deseado (en minutos)" id="habitTime" v-model="habit.tiempo">
    </div>

    <div v-if="habit.tipo === 'meta'" class="mb-3">
      <label for="habitDeadline" class="block text-xl font-medium text-gray-700">Fecha Límite</label>
      <input type="date"
             class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
             id="habitDeadline" v-model="habit.fecha_limite">
    </div>

    <div class="mb-3">
      <label for="habitColor" class="block text-xl font-medium text-gray-700">Color</label>
      <input type="color"
             class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
             id="habitColor" v-model="habit.color" title="Elige un color">
    </div>

    <div class="mb-3">
      <label for="habitIcon" class="block text-xl font-medium text-gray-700">Icono</label>
      <div id="habitIcon" class="flex flex-row flex-wrap mt-2 gap-2">
        <div class="flex items-center gap-1 " v-for="icon in icons" :key="icon">
          <input class="" type="radio" :id="icon" :value="icon" v-model="habit.icon">
          <label class="text-sm" :for="icon">
            <img :src="icon" alt="icon" width="24" height="24">
          </label>
        </div>
      </div>
    </div>

    <button type="submit" class="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-md  hover:bg-cyan-500">Agregar Hábito
    </button>
  </form>
</template>

<style scoped>
</style>