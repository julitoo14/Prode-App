<script setup>
import axios from "axios";
import { ref, onMounted } from "vue";
import Date from "../components/Home/Date.vue";
import Habit from "../components/Home/Habit.vue";
import {API_BASE_URL} from "../config.js";
const habits = ref([]);
const habitsToResolve = ref([]);
const habitsResolved = ref([]);


onMounted(async () => {
  await getHabits();
});

const getHabits = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/habit/byUser/66c419f4dc99848d21092cad`);
    habits.value = response.data.habits.sort((a, b) => a.tipo.localeCompare(b.tipo));
    habitsToResolve.value = habits.value.filter(habit => habit.estado_inicial === false &&
        habit.tipo !== 'mal habito' || habit.tipo === 'mal habito' &&
        habit.estado_inicial === true);
    habitsResolved.value = habits.value.filter(habit => habit.estado_inicial === true &&
        habit.tipo !== 'mal habito' || habit.tipo === 'mal habito' &&
        habit.estado_inicial === false);
  } catch (error) {
    console.error("Error fetching habits:", error);
  }
};

</script>

<template >
    <Date class="w-full text-xl mx-auto dark:text-white" />
    <div class="flex flex-row justify-between items-center w-full lg:w-3/4 p-4 sm:px-12 mx-auto">
      <h2 class="text-left text-xl dark:text-violet-700 text-cyan-600 sm:text-3xl">Habitos por cumplir</h2>
      <RouterLink class="px-4 py-2 rounded bg-cyan-600 dark:bg-violet-700  dark:hover:text-violet-600 hover:bg-cyan-500 hover:scale-110 text-white text-center" to="/addHabit">+</RouterLink>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-normal gap-4 lg:w-3/4 sm:gap-8 w-full p-4 sm:px-12 mx-auto">
      <Habit v-for="habit in habitsToResolve" :key="habit.id" :getHabits="getHabits" :habit="habit"  />
    </div>
      <h2 v-if="habitsResolved.length > 0" class="w-full text-left text-xl text-cyan-600 dark:text-violet-700 lg:w-3/4 sm:text-3xl sm:px-12 mx-auto">Habitos cumplidos/fallidos</h2>
    <div v-if="habitsResolved.length > 0" class="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 justify-normal gap-4 lg:w-3/4 sm:gap-8 w-full p-4 sm:px-12 mx-auto">
      <Habit v-for="habit in habitsResolved" :key="habit.id" :getHabits="getHabits" :habit="habit" />
    </div>
</template>

<style scoped>
</style>
