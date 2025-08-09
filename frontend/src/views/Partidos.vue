<script setup>
import BaseLayout from "@/layouts/BaseLayout.vue";
import { onMounted, ref, watch } from "vue";
import api from '@/services/api';
import { useRoute } from 'vue-router';
const route = useRoute();
const partidos = ref([]);
const tournament = ref({});
const selectedRound = ref(1);
const predictions = ref({});

// UI helpers
const statusLabel = (s) => {
  if (!s) return '—';
  const map = {
    'Not Started': 'Próximo',
    'Match Finished': 'Final',
    'Full Time': 'Final',
    'FT': 'Final',
    'After Penalties': 'Penales',
    'AET': 'ET',
    'Halftime': 'Descanso',
    '1H': '1T',
    '2H': '2T',
    'In Progress': 'En juego',
    'Live': 'En juego',
    'Postponed': 'Suspendido',
    'Canceled': 'Cancelado',
  };
  return map[s] || s;
};

const statusClass = (s) => {
  const live = ['1H', '2H', 'In Progress', 'Live'];
  const finished = ['Match Finished', 'Full Time', 'FT', 'After Penalties', 'AET'];
  const postponed = ['Postponed', 'Canceled'];
  if (live.includes(s)) return 'bg-green-100 text-green-700';
  if (finished.includes(s)) return 'bg-gray-100 text-gray-700';
  if (postponed.includes(s)) return 'bg-yellow-100 text-yellow-800';
  return 'bg-gray-100 text-gray-700';
};

const shortName = (name) => {
  if (!name) return '';
  return name.length > 34 ? name.slice(0, 32) + '…' : name;
};

const getPartidos = async () => {
  try {
    console.log(tournament.value)
    const response = await api.getPartidosByCompetitionId(tournament.value.competition?._id, selectedRound.value);
    partidos.value = response.data.partidos;
  } catch (error) {
    console.error("Error fetching partidos:", error);
    partidos.value = [];
  }
};

const getTorneo = async () => {
  try {
    const response = await api.getTournamentById(route.params.torneoId);
    tournament.value = response.data.tournament;
  } catch (error) {
    console.error("Error fetching tournament:", error);
  }
};

const isFinished = (p) => [
  'Match Finished',
  'Full Time',
  'FT',
  'After Penalties',
  'AET'
].includes(p?.status);

const isPlaying = (p) => [
  '1H',
  '2H',
  'In Progress',
  'Live'
].includes(p?.status);

// Try to auto-select the current round based on today's date and each round's date range
const setCurrentRound = async () => {
  if (!tournament.value?.competition?._id) return;
  const now = new Date();
  let round = 1;
  const maxRounds = 60; // sane upper bound

  while (round <= maxRounds) {
    try {
      const res = await api.getPartidosByCompetitionId(
        tournament.value.competition._id,
        round
      );
      const list = res?.data?.partidos || [];
      if (!list.length) break; // no more rounds

      const dates = list.map((m) => new Date(m.fecha)).filter((d) => !isNaN(d));
      if (!dates.length) break;
      const start = new Date(Math.min(...dates));
      const end = new Date(Math.max(...dates));
      // add a small buffer window
      const before = new Date(start.getTime() - 6 * 60 * 60 * 1000);
      const after = new Date(end.getTime() + 6 * 60 * 60 * 1000);

      if (now >= before && now <= after) {
        selectedRound.value = round;
        partidos.value = list; // preload so UI is instant
        return;
      }
      if (now < start) {
        // we're before this round; pick previous if any
        selectedRound.value = Math.max(1, round - 1);
        const prev = await api.getPartidosByCompetitionId(
          tournament.value.competition._id,
          selectedRound.value
        );
        partidos.value = prev?.data?.partidos || [];
        return;
      }
      // else: now is after this round -> keep searching
      round++;
    } catch (e) {
      console.error('Error while detecting current round', e);
      break;
    }
  }
  // fallback
  selectedRound.value = 1;
};

const savePrediction = async (partido) => {
  const pred = predictions.value[partido._id];
  if (!pred || pred.e1 === undefined || pred.e2 === undefined) return;
  try {
    if (typeof api.savePrediction === 'function') {
      await api.savePrediction({
        partidoId: partido._id,
        predEquipo1: Number(pred.e1),
        predEquipo2: Number(pred.e2),
      });
      console.log('Predicción guardada');
    } else {
      console.log('Predicción (solo UI):', {
        partidoId: partido._id,
        predEquipo1: Number(pred.e1),
        predEquipo2: Number(pred.e2),
      });
    }
  } catch (e) {
    console.error('Error saving prediction', e);
  }
};

onMounted(async () => {
  await getTorneo();
  await setCurrentRound();
  await getPartidos();
});

watch([selectedRound], getPartidos);
</script>

<template>
  <BaseLayout>
    <div class="max-w-6xl mx-auto px-4 w-full">

      <!-- Header  -->
      <div class="flex items-center justify-between py-4">
        <button
          @click="$router.back()"
          class="flex gap-x-2 text-gray-600 hover:text-gray-800 "
          aria-label="Volver"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7m-7 7h18"></path>
          </svg>
          <span class="">Volver</span>
        </button>

        <div class="flex items-center gap-2">
          <button
              @click="selectedRound = Math.max((selectedRound || 1) - 1, 1)"
              class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ◀
          </button>
          <span class="min-w-[30px] text-center font-semibold">Fecha {{ selectedRound || 1 }}</span>
          <button
              @click="selectedRound = (selectedRound || 1) + 1"
              class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ▶
          </button>
        </div>
      </div>

      <div class="divide-y divide-blue-200 rounded-lg border-2 border-blue-200 bg-white">
        <div
          v-for="(partido, index) in partidos"
          :key="index"
          class="grid grid-cols-[3rem_minmax(0,1.6fr)_auto_minmax(0,1.6fr)] sm:grid-cols-[5rem_1fr_auto_1fr] items-center gap-2.5 sm:gap-4 px-4 py-4 min-h-[64px] text-center w-full"
        >
          <!-- Estado / Hora -->
          <div class="flex flex-col items-center justify-center w-12 sm:w-20 shrink-0 text-center">
            <template v-if="partido.status === 'Not Started'">
              <div class="text-xs text-gray-500 text-center">
                {{ new Date(partido.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }) }}
                <span class="hidden sm:inline text-xs">hs</span>
              </div>
            </template>
            <template v-else>
              <span
                class="inline-block px-2 py-1 text-xs font-semibold rounded-full text-center"
                :class="statusClass(partido.status)"
              >
                {{ statusLabel(partido.status) }}
              </span>
            </template>
          </div>

          <!-- Equipo 1 -->
          <div class="flex items-center min-w-0 gap-1 pr-1 sm:gap-2 sm:pr-2 flex-1 min-[0px]:basis-0">
            <img :src="partido.equipo1Image" alt="" class="w-5 h-5 sm:w-10 sm:h-10 object-contain" />
            <span class="font-medium text-gray-700 truncate leading-tight text-xs sm:text-base sm:overflow-visible sm:whitespace-normal">{{ shortName(partido.equipo1) }}</span>
          </div>

          <!-- Marcador / Predicción -->
          <div class="grid items-center justify-self-center grid-cols-[1rem_0.5rem_1rem_1rem] sm:grid-cols-[2.5rem_1rem_2.5rem_5.5rem] gap-1 sm:gap-2 text-center">
            <template v-if="isFinished(partido) || isPlaying(partido)">
              <span class="col-start-1 justify-self-center text-sm sm:text-xl font-bold text-gray-800">{{ partido.golesEquipo1 ?? '-' }}</span>
              <span class="hidden sm:block col-start-2 justify-self-center text-sm sm:text-lg font-light text-gray-500">-</span>
              <span class="col-start-3 justify-self-center text-sm sm:text-xl font-bold text-gray-800">{{ partido.golesEquipo2 ?? '-' }}</span>
            </template>
            <template v-else>
              <input
                type="number"
                min="0"
                class="col-start-1 w-7 h-7 sm:w-10 sm:h-10 text-center text-base font-semibold bg-gray-100 rounded-md outline-none focus:ring-2 focus:ring-indigo-400"
                :value="(predictions[partido._id]?.e1) ?? ''"
                @input="predictions[partido._id] = { ...(predictions[partido._id]||{}), e1: $event.target.valueAsNumber >= 0 ? $event.target.valueAsNumber : 0 }"
                aria-label="Goles equipo 1"
              />
              <span class="hidden sm:block col-start-2 justify-self-center text-lg font-light text-gray-500">-</span>
              <input
                type="number"
                min="0"
                class="col-start-3 w-7 h-7 sm:w-10 sm:h-10 text-center text-base font-semibold bg-gray-100 rounded-md outline-none focus:ring-2 focus:ring-indigo-400"
                :value="(predictions[partido._id]?.e2) ?? ''"
                @input="predictions[partido._id] = { ...(predictions[partido._id]||{}), e2: $event.target.valueAsNumber >= 0 ? $event.target.valueAsNumber : 0 }"
                aria-label="Goles equipo 2"
              />
            </template>
          </div>

          <!-- Equipo 2 -->
          <div class="flex items-center justify-end min-w-0 gap-1 pl-1 pr-2 sm:gap-2 sm:pl-2 sm:pr-3 flex-1 min-[0px]:basis-0">
            <span class="font-medium text-gray-700 truncate leading-tight text-right text-xs sm:text-base sm:overflow-visible sm:whitespace-normal">{{ shortName(partido.equipo2) }}</span>
            <img :src="partido.equipo2Image" alt="" class="w-5 h-5 sm:w-10 sm:h-10 object-contain" />
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

.bg-yellow-100 { background-color: #fefcbf; }
.text-yellow-800 { color: #92400e; }
</style>
