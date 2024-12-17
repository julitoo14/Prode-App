<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API_BASE_URL } from '../config.js';
const habits = ref({})


// Fetch habits
const getHabits = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/habit/byUser/66c419f4dc99848d21092cad`);
    habits.value = response.data.habits.sort((a, b) => a.tipo.localeCompare(b.tipo));
  } catch (error) {
    console.error("Error fetching habits:", error);
  }
};

const calcHistory = () => {
  // Calculate the history of habits
  console.log(habits.value);
  habits.value.forEach(habit => {
      habit.diasCompletados = 0;
      habit.totalDias = habit.historial.length;
      for(let i=0; i<habit.totalDias; i++) {
        if(habit.historial[i].completado) {
          habit.diasCompletados++;
        }
      }
      
      habit.diasFallidos = habit.totalDias - habit.diasCompletados;
      habit.porcentaje = (habit.diasCompletados / habit.totalDias) * 100;
      habit.porcentaje = habit.porcentaje.toFixed(0);
      if(isNaN(habit.porcentaje)) {
        habit.porcentaje = 0;
      }
    
  }); 
}

onMounted(async () => {
  await getHabits();
  calcHistory();
});


</script>

<template>
  <div class="flex flex-col justify-start gap-6 items-center bg-transparent text-black w-full min-h-screen lg:w-3/4 mx-auto">
    <div class="w-full">
      <h2 class="text-2xl font-semibold dark:text-violet-700">Historial y progreso</h2>

    </div>

    <div v-for="habit in habits" class="w-full flex mb-1 p-2 bg-slate-200 rounded text-sm">
      <div class="w-full grid sm:grid-cols-5 justify-between items-center">
        <h3 class="text-base text-wrap">{{ habit.nombre }} ({{ habit.tipo }})</h3>
        <p class="text-gray-700" >Percentage: {{ habit.porcentaje }}%</p>
        <p class="text-gray-700" >Days tracked: {{ habit.totalDias }}</p>
        <p class="text-gray-700" >Days completed: {{ habit.diasCompletados }}</p>
        <p class="text-gray-700" >Days failed: {{ habit.diasFallidos }}</p>
      </div>
    </div>
      
  </div>
</template>

<style scoped>
</style>