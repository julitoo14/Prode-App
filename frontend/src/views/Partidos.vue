<script setup>
import BaseLayout from "@/layouts/BaseLayout.vue";
import axios from "axios";
import {onMounted, ref} from "vue";
const partidos = ref([]);

const getPartidos = async () => {
  try {
    const response = await axios.get("http://localhost:4000/partido/all?round=3&competition=68791c0e490c3fcd8be2c899&half=2" , {
      headers: {
        "Content-Type": "application/json",
        "Authorization": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyTmFtZSI6IlByb2JhbmRvIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiX2lkIjoiNjg1MzA4OTY1ZjNlNjJlOGE0ZGJiYzgwIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTMzODA3NTYsImV4cCI6MTc1MzQ2NzE1Nn0.IFGeKqnUW9GFnyfAilEsqFmbVTuw_ftQBlacfpuXwrQ"
      }});
    partidos.value = response.data.partidos;
  } catch (error) {
    console.error("Error fetching partidos:", error);
    partidos.value = [];
  }
};

onMounted(async () => {
  await getPartidos();
  console.log("Getting partidos:", partidos.value);
})


</script>

<template>
  <BaseLayout>
    <div class="max-w-lg mx-auto px-4">
      <h2 class="text-2xl font-semibold my-4 text-center">Próximos Partidos - Fútbol Argentino</h2>
      <div class="flex flex-col gap-4">
        <div
            v-for="(partido, index) in partidos"
            :key="index"
            class="bg-white rounded-xl shadow-md p-5 mx-2 text-center text-sm leading-relaxed border-x-4 border-red-600"
        >
          <div class="flex items-center justify-center gap-2 mb-2">
            <img :src="partido.equipo1Image" alt="" class="w-8 h-8 object-contain" />
            <h3 class="text-xl font-bold">{{ partido.equipo1 }} vs {{ partido.equipo2 }}</h3>
            <img :src="partido.equipo2Image" alt="" class="w-8 h-8 object-contain" />
          </div>
          <p class="mt-1">{{ new Date(partido.fecha).toLocaleDateString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }) }} - {{ new Date(partido.fecha).toLocaleTimeString("es-AR", { timeZone: "America/Argentina/Buenos_Aires", hour: '2-digit', minute: '2-digit', hour12: false }) }}</p>
          <p class="mt-1"><strong>Estadio:</strong> {{ partido.estadio }}</p>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>


<style scoped>

</style>