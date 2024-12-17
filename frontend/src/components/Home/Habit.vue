
<template>
  <div class="relative flex flex-col items-center justify-between bg-gradient-to-tl from-gray-50 to-indigo-50 shadow rounded-2xl  w-full p-3 sm:p-2 hover:cursor-pointer hover:bg-gray-300 gap-4" :class="habitTypeClass(habit)" @click="toggleHabit">
    <div class="flex justify-between items-center w-full">
      <span class="text-xl sm:text-2xl font-semibold name">{{ habit.nombre }}</span>
      <button class="rounded p-2 text-white bg-gradient-to-bl from-gray-700 to-black" @click="(e) => stopPropagation(e)"> <RouterLink :to="'/editHabit/' + habit._id"> Edit</RouterLink> </button>
    </div>
    <div class="realtive flex w-full items-center justify-center">
      <img class="w-12 h-12" :src="habit.icon" alt="Habit icon" v-if="habit.icon && habit.icon.includes('/')" />
      <div  :style="habitColorStyle(habit)" class="w-full h-2.5 rounded overflow-hidden my-4 mx-4"></div>
    </div>
    <p class="p-2 w-full text-wrap habit-description">{{ habit.descripcion }}</p>
    <span class="rounded bg-black text-white px-2 py-1" v-if="props.habit.tipo !== 'mal habito' && props.habit.estado_inicial" >Completado</span>
    <span class="rounded bg-black text-white px-2 py-1" v-if="props.habit.tipo === 'mal habito' && !props.habit.estado_inicial" >Fallado</span>
    <img class="absolute right-0 bottom-0 w-12 h-12" src="/icons/check.svg" v-if="props.habit.estado_inicial && props.habit.tipo !== 'mal habito'">
    <img class="absolute right-0 bottom-0 w-12 h-12" src="/icons/prohibido.svg" v-if="!props.habit.estado_inicial && props.habit.tipo === 'mal habito'">
    <button
        v-if="props.habit.temporizador && !props.habit.estado_inicial && props.habit.tipo !== 'mal habito' && !mostrarTemporizador"
        @click="(e) => startTimer(e, props.habit.temporizador)">
      iniciar temporizador
    </button>
    <Temporizador :minutos="habit.temporizador"
                  v-if="mostrarTemporizador && !props.habit.estado_inicial"
                  @completado="toggleHabit"
                  @click="(e) => pauseTimer(e)"
    />
    <span class="rounded-2xl bg-black text-white px-2 py-1 bg-gradient-to-tr from-gray-700 to-black" v-if="props.habit.tipo === 'meta' && !props.habit.estado_inicial" >{{ diasRestantes }} días restantes</span>
    <span class="rounded-2xl bg-black text-white px-2 py-1 bg-gradient-to-tr from-gray-700 to-black" v-if="props.habit.tipo === 'buen habito' && !props.habit.estado_inicial" >Buen habito</span>
    <span class="rounded-2xl bg-black text-white px-2 py-1 bg-gradient-to-tr from-gray-700 to-black" v-if="props.habit.tipo === 'mal habito' && props.habit.estado_inicial" >Mal habito</span>
  </div>
</template>


<script setup>
import { ref } from "vue";
import Temporizador from "./Temporizador.vue";
import axios from "axios";
import {API_BASE_URL} from "../../config.js";

const props = defineProps({
  habit: {
    type: Object,
    required: true
  },
  getHabits: {
    type: Function,
    required: true
  }
});

const diasRestantes = ref(0);
const mostrarTemporizador = ref(false);
diasRestantes.value = Math.floor((new Date(props.habit.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24));

const habitTypeClass = (habit) => {
  if(habit.tipo === 'mal habito') {
    return habit.estado_inicial ? '' : 'failed-habit';
  }
  return habit.estado_inicial ? 'completed-habit' : '';
};

const habitColorStyle = (habit) => {
  return {
    backgroundColor: habit.color || '#706161'
  };
};

const toggleHabit = async () => { //
  try{

  await axios.put(`${API_BASE_URL}/habit/toggle/${props.habit._id}`);
  props.habit.estado_inicial = !props.habit.estado_inicial;
  await props.getHabits();

  } catch (error) {
    console.error("Error updating habit:", error);
  }

};

const startTimer = (e) => {
  e.stopPropagation();
  mostrarTemporizador.value = !mostrarTemporizador.value;
};

const pauseTimer = (e) => {
  e.stopPropagation();
};

const stopPropagation = (e) => {
  e.stopPropagation();
};

</script>

<style scoped>


.completed-habit {
  opacity: 0.6;
}

.failed-habit {
  opacity: 0.6;
}

.failed-habit .name,
.failed-habit .habit-description {
  text-decoration: line-through;
  color: red;
}

.completed-habit .name,
.completed-habit .habit-description {
  text-decoration: line-through;
}
</style>