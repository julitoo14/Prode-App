<script setup>
import BaseLayout from "@/layouts/BaseLayout.vue";
import axios from "axios";
import { onMounted, ref, watch } from "vue";

const partidos = ref([]);
const competitions = ref([]);
const selectedCompetition = ref('');
const selectedRound = ref(1);

const getPartidos = async () => {
  try {
    let url = "http://localhost:4000/partido/all?half=2";
    if (selectedCompetition.value) {
      url += `&competition=${selectedCompetition.value}`;
    }
    if (selectedRound.value) {
      url += `&round=${selectedRound.value}`;
    }
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    console.log(url);
    partidos.value = response.data.partidos;
  } catch (error) {
    console.error("Error fetching partidos:", error);
    partidos.value = [];
  }
};

const getCompetitions = async () => {
  try {
    const response = await axios.get("http://localhost:4000/competition/all", {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });
    competitions.value = response.data.competitions;
  } catch (error) {
    console.error("Error fetching competitions:", error);
  }
};

onMounted(async () => {
  await getCompetitions();
  await getPartidos();
});

watch([selectedCompetition, selectedRound], getPartidos);
</script>

<template>
  <BaseLayout>
    <div class="max-w-4xl mx-auto px-4">
      <h2 class="text-3xl font-bold my-6 text-center text-gray-800">Próximos Partidos</h2>
      
      <div class="flex justify-center gap-4 mb-6">
        <select v-model="selectedCompetition" class="border rounded px-2 py-1">
          <option value="">Todas las competiciones</option>
          <option v-for="competition in competitions" :key="competition._id" :value="competition._id">
            {{ competition.name }}
          </option>
        </select>
        <div class="flex items-center gap-2">
          <button
              @click="selectedRound = Math.max((selectedRound || 1) - 1, 1)"
              class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ◀
          </button>
          <span class="min-w-[30px] text-center font-semibold">{{ selectedRound || 1 }}</span>
          <button
              @click="selectedRound = (selectedRound || 1) + 1"
              class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ▶
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
            v-for="(partido, index) in partidos"
            :key="index"
            class="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out"
        >
          <div class="p-5">
            <div class="flex items-center justify-around">
              <div class="flex flex-col items-center text-center w-1/3">
                <img :src="partido.equipo1Image" alt="" class="w-16 h-16 object-contain mb-2" />
                <h3 class="text-lg font-semibold text-gray-700">{{ partido.equipo1 }}</h3>
              </div>

              <div v-if="partido.status !== 'Not Started'" class="flex items-center text-center">
                <span class="text-4xl font-bold text-gray-800">{{ partido.golesEquipo1 }}</span>
                <span class="text-2xl font-light text-gray-500 mx-3">-</span>
                <span class="text-4xl font-bold text-gray-800">{{ partido.golesEquipo2 }}</span>
              </div>
              <div v-else class="text-2xl font-bold text-gray-400">VS</div>

              <div class="flex flex-col items-center text-center w-1/3">
                <img :src="partido.equipo2Image" alt="" class="w-16 h-16 object-contain mb-2" />
                <h3 class="text-lg font-semibold text-gray-700">{{ partido.equipo2 }}</h3>
              </div>
            </div>
            <div class="mt-4 text-center text-gray-500">
              <p class="text-sm">{{ new Date(partido.fecha).toLocaleDateString("es-AR", { day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
              <p class="text-sm">{{ new Date(partido.fecha).toLocaleTimeString("es-AR", { hour: '2-digit', minute: '2-digit', hour12: false }) }} hs</p>
              <p class="mt-2 text-xs"><strong>Estadio:</strong> {{ partido.estadio }}</p>
              <span :class="['mt-2 inline-block px-3 py-1 text-xs font-semibold rounded-full', partido.status === 'Match Finished' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800']">
                {{ partido.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseLayout>
</template>


<style scoped>
.text-gray-800 {
  color: #2d3748;
}
.text-gray-700 {
  color: #4a5568;
}
.text-gray-500 {
  color: #a0aec0;
}
.text-gray-400 {
  color: #cbd5e0;
}
.bg-red-100 {
  background-color: #fff5f5;
}
.text-red-800 {
  color: #9b2c2c;
}
.bg-green-100 {
  background-color: #f0fff4;
}
.text-green-800 {
  color: #276749;
}
</style>