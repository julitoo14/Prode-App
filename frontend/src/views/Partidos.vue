<script setup>
import BaseLayout from "@/layouts/BaseLayout.vue";
import { onMounted, ref, watch, computed } from "vue";
import api from '@/services/api';
import { useRoute } from 'vue-router';
import { useAuth } from '@/store/auth';

const route = useRoute();
const { user } = useAuth();
const partidos = ref([]);
const tournament = ref({});
const selectedRound = ref(1);
const predictions = ref({});
const currentParticipante = ref(null);

// Prediction UI state
const saving = ref({}); // { [matchId]: true }
const saved = ref({});  // { [matchId]: true }
const errorMsg = ref('');

const canPredict = (p) => !(isFinished(p) || isPlaying(p));

const upsertPredictionLocal = (matchId, e1, e2) => {
  predictions.value[matchId] = {
    ...(predictions.value[matchId] || {}),
    e1: typeof e1 === 'number' && !Number.isNaN(e1) ? e1 : predictions.value[matchId]?.e1,
    e2: typeof e2 === 'number' && !Number.isNaN(e2) ? e2 : predictions.value[matchId]?.e2,
  };
};

// Obtener el participante del usuario actual en el torneo
const getCurrentParticipante = async () => {
  try {
    if (!tournament.value?._id || !user.value?._id) return;
    const response = await api.getParticipantesPorTorneo(tournament.value._id);
    const participantes = response.data.participantes || [];
    currentParticipante.value = participantes.find(p => p.user === user.value._id);
  } catch (error) {
    console.error('Error fetching current participante:', error);
  }
};

// Load existing predictions for the current list of matches
const loadPredictions = async () => {
  try {
    if (!currentParticipante.value?._id || !partidos.value?.length) return;
    
    const response = await api.getPredictionsByParticipante(currentParticipante.value._id);
    const predictionsList = response.data.predictions || [];
    
    // Crear un mapa de predicciones por partido ID
    const predictionsMap = {};
    predictionsList.forEach(pred => {
      if (pred.partido) {
        predictionsMap[pred.partido] = {
          e1: pred.golesEquipo1,
          e2: pred.golesEquipo2,
          _id: pred._id
        };
      }
    });
    
    predictions.value = predictionsMap;
  } catch (e) {
    console.error('Error loading predictions', e);
  }
};

// Helpers to group matches by day (Argentina timezone)
const tz = 'America/Argentina/Buenos_Aires';

const formatDayLabel = (date) => {
  if (!(date instanceof Date) || isNaN(date)) return '';
  // e.g., "viernes 15/08"
  const weekday = new Intl.DateTimeFormat('es-AR', { weekday: 'long', timeZone: tz }).format(date);
  const dayMonth = new Intl.DateTimeFormat('es-AR', { day: '2-digit', month: '2-digit', timeZone: tz }).format(date);
  return `${weekday.toLowerCase()} ${dayMonth}`;
};

const dateKey = (date) => {
  // Stable key YYYY-MM-DD in Argentina timezone
  return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: tz }).format(date);
};

const groupedPartidos = computed(() => {
  const groupsMap = new Map();
  for (const p of partidos.value || []) {
    const d = new Date(p.fecha);
    if (isNaN(d)) continue;
    const key = dateKey(d);
    if (!groupsMap.has(key)) {
      groupsMap.set(key, { key, date: d, dayLabel: formatDayLabel(d), items: [] });
    }
    groupsMap.get(key).items.push(p);
  }
  // sort groups by date ascending, and inside each group keep original order
  return Array.from(groupsMap.values()).sort((a, b) => a.date - b.date);
});

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
    await loadPredictions();
  } catch (error) {
    console.error('Error fetching partidos:', error);
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
  const id = partido?._id;
  if (!id || !currentParticipante.value?._id) return;
  
  const pred = predictions.value[id];
  const bothNumbers = pred && Number.isFinite(Number(pred.e1)) && Number.isFinite(Number(pred.e2));
  if (!bothNumbers) {
    errorMsg.value = 'Completá ambos goles antes de guardar.';
    setTimeout(() => (errorMsg.value = ''), 2000);
    return;
  }
  if (!canPredict(partido)) return; // blocked if empezó/terminó
  
  try {
    saving.value = { ...saving.value, [id]: true };
    
    const predictionData = {
      partido: id,
      participante: currentParticipante.value._id,
      golesEquipo1: Number(pred.e1),
      golesEquipo2: Number(pred.e2)
    };
    
    // Si ya existe una predicción, actualizarla
    if (pred._id) {
      await api.updatePrediction(pred._id, predictionData);
    } else {
      // Si no existe, crear una nueva
      const response = await api.savePrediction(predictionData);
      // Actualizar el ID de la predicción creada
      predictions.value[id] = {
        ...predictions.value[id],
        _id: response.data.prediction._id
      };
    }
    
    saved.value = { ...saved.value, [id]: true };
    setTimeout(() => {
      const { [id]: _omit, ...rest } = saved.value; // clean flag
      saved.value = rest;
    }, 1500);
  } catch (e) {
    console.error('Error saving prediction', e);
    errorMsg.value = 'No se pudo guardar. Intentá de nuevo.';
    setTimeout(() => (errorMsg.value = ''), 2500);
  } finally {
    const { [id]: _omit, ...rest } = saving.value;
    saving.value = rest;
  }
};

onMounted(async () => {
  await getTorneo();
  await getCurrentParticipante();
  await setCurrentRound();
  await getPartidos();
  await loadPredictions();
});

watch([selectedRound], async () => {
  await getPartidos();
  await loadPredictions();
});
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

      <!-- Groups by day -->
      <div class="space-y-6">
        <div v-for="group in groupedPartidos" :key="group.key" class="rounded-lg border-2 border-blue-200 bg-white">
          <!-- Day separator/header -->
          <div class="px-4 py-2 bg-blue-50 text-blue-900 font-semibold tracking-wide uppercase text-xs sm:text-sm rounded-t-lg">
            {{ group.dayLabel }}
          </div>

          <!-- Matches of the day -->
          <div class="divide-y divide-blue-200">
            <div
              v-for="(partido, index) in group.items"
              :key="partido._id || index"
              class="grid grid-cols-[3rem_minmax(0,1.6fr)_auto_minmax(0,1.6fr)] sm:grid-cols-[5rem_1fr_auto_1fr] items-center gap-2.5 sm:gap-4 px-4 py-4 min-h-[64px] text-center w-full"
            >
              <!-- Estado / Hora -->
              <div class="flex flex-col items-center justify-center w-12 sm:w-20 shrink-0 text-center">
                <template v-if="partido.status === 'Not Started'">
                  <div class="text-xs text-gray-500 text-center">
                    {{ new Date(partido.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }) }}
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
                    class="col-start-1 w-7 h-7 sm:w-10 sm:h-10 text-center text-base font-semibold bg-gray-100 rounded-md outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    :value="(predictions[partido._id]?.e1) ?? ''"
                    :disabled="!canPredict(partido) || saving[partido._id]"
                    @input="predictions[partido._id] = { ...(predictions[partido._id]||{}), e1: $event.target.valueAsNumber >= 0 ? $event.target.valueAsNumber : 0 }"
                    @keyup.enter="savePrediction(partido)"
                    aria-label="Goles equipo 1"
                  />
                  <span class="hidden sm:block col-start-2 justify-self-center text-lg font-light text-gray-500">-</span>
                  <input
                    type="number"
                    min="0"
                    class="col-start-3 w-7 h-7 sm:w-10 sm:h-10 text-center text-base font-semibold bg-gray-100 rounded-md outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    :value="(predictions[partido._id]?.e2) ?? ''"
                    :disabled="!canPredict(partido) || saving[partido._id]"
                    @input="predictions[partido._id] = { ...(predictions[partido._id]||{}), e2: $event.target.valueAsNumber >= 0 ? $event.target.valueAsNumber : 0 }"
                    @keyup.enter="savePrediction(partido)"
                    aria-label="Goles equipo 2"
                  />
                  <!-- Save per-match -->
                  <button
                    class="hidden sm:inline-flex items-center justify-center px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md border border-indigo-200 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    :class="{
                      'bg-green-50 border-green-200': saved[partido._id],
                    }"
                    :disabled="!canPredict(partido) || saving[partido._id]"
                    @click="savePrediction(partido)"
                    aria-label="Guardar predicción"
                  >
                    <span v-if="saving[partido._id]">Guardando…</span>
                    <span v-else-if="saved[partido._id]">Guardado ✓</span>
                    <span v-else>Guardar</span>
                  </button>
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
      </div>
      <div v-if="errorMsg" class="mt-3 text-center text-sm text-red-700">{{ errorMsg }}</div>
      <div class="mt-4">
        <button
          @click="partidos.filter(p => canPredict(p)).forEach(savePrediction)"
          class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Guardar predicciones
        </button>
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
