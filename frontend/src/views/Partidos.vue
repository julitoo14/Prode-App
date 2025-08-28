<script setup>
import BaseLayout from "@/layouts/BaseLayout.vue";
import { onMounted, ref, watch, computed, nextTick } from "vue";
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
const saving = ref({}); // { [matchId]: true } - mantener para compatibilidad si es necesario
const errorMsg = ref('');
const batchSaving = ref(false);
const batchSaved = ref(false);

const canPredict = (p) => {
  if (isFinished(p) || isPlaying(p)) return false;
  
  // Verificar si faltan menos de 10 minutos para el partido
  const now = new Date();
  const matchDate = new Date(p.fecha);
  const diff = matchDate - now;
  return diff >= 10 * 60 * 1000; // 10 minutos en milisegundos
};

const getTimeUntilMatch = (p) => {
  const now = new Date();
  const matchDate = new Date(p.fecha);
  const diff = matchDate - now;
  
  if (diff < 0) return null; // Ya empezó
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}m`;
};

const upsertPredictionLocal = (matchId, e1, e2) => {
  const existing = predictions.value[matchId] || {};
  
  // Solo marcar como no guardado si realmente hay cambios
  const newE1 = typeof e1 === 'number' && !Number.isNaN(e1) ? e1 : existing.e1;
  const newE2 = typeof e2 === 'number' && !Number.isNaN(e2) ? e2 : existing.e2;
  
  // Verificar si realmente hay cambios
  const hasChanges = (newE1 !== existing.e1) || (newE2 !== existing.e2);
  
  predictions.value[matchId] = {
    ...existing,
    e1: newE1,
    e2: newE2,
    saved: hasChanges && existing._id ? false : existing.saved, // Solo marcar como no guardado si hay cambios y existe un ID
  };
};

// Verificar si una predicción está guardada en el servidor
const isPredictionSaved = (matchId) => {
  const pred = predictions.value[matchId];
  return pred && pred._id && pred.saved === true;
};

// Verificar si una predicción ha sido modificada desde la última vez que se guardó
const isPredictionModified = (matchId) => {
  const pred = predictions.value[matchId];
  return pred && pred._id && pred.saved === false;
};

// Verificar si una predicción está completa (ambos goles ingresados)
const isPredictionComplete = (matchId) => {
  const pred = predictions.value[matchId];
  return pred && 
         Number.isFinite(Number(pred.e1)) && 
         Number.isFinite(Number(pred.e2)) &&
         Number(pred.e1) >= 0 &&
         Number(pred.e2) >= 0;
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
    if (!currentParticipante.value?._id) {
      return;
    }
    
    const response = await api.getPredictionsByParticipante(currentParticipante.value._id);
    
    // Las predicciones pueden estar en response.data directamente (array) o en response.data.predictions
    let predictionsList;
    if (Array.isArray(response.data)) {
      predictionsList = response.data;
    } else if (response.data.data && response.data.data.predictions && Array.isArray(response.data.data.predictions)) {
      predictionsList = response.data.data.predictions;
    } else if (response.data.predictions && Array.isArray(response.data.predictions)) {
      predictionsList = response.data.predictions;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      predictionsList = response.data.data;
    } else {
      predictionsList = [];
    }
    
    // Crear un mapa de predicciones por partido ID
    const predictionsMap = {};
    predictionsList.forEach(pred => {
      if (pred.partido) {
        predictionsMap[pred.partido] = {
          e1: pred.golesEquipo1,
          e2: pred.golesEquipo2,
          _id: pred._id,
          saved: true, // Marca que esta predicción ya está guardada
          updatedAt: pred.updatedAt || pred.createdAt
        };
      }
    });
    
    // Merge con predicciones existentes en el estado (por si el usuario está editando)
    predictions.value = {
      ...predictions.value,
      ...predictionsMap
    };
  } catch (e) {
    console.error('Error loading predictions', e);
    errorMsg.value = 'Error al cargar predicciones existentes';
    setTimeout(() => (errorMsg.value = ''), 2000);
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

// Computed para estadísticas de predicciones
const predictionsStats = computed(() => {
  const predictableMatches = partidos.value.filter(p => canPredict(p));
  const completePredictions = predictableMatches.filter(p => isPredictionComplete(p._id));
  
  // Clasificar predicciones sin solapamiento
  const savedPredictions = [];
  const modifiedPredictions = [];
  const unsavedPredictions = [];
  
  completePredictions.forEach(p => {
    const matchId = p._id;
    
    if (isPredictionModified(matchId)) {
      // Si está modificada, va a modificadas (tiene _id pero saved: false)
      modifiedPredictions.push(p);
    } else if (isPredictionSaved(matchId)) {
      // Si está guardada y no modificada
      savedPredictions.push(p);
    } else {
      // Si no tiene _id (nueva predicción)
      unsavedPredictions.push(p);
    }
  });
  
  const pendingCount = modifiedPredictions.length + unsavedPredictions.length;
  
  return {
    total: predictableMatches.length,
    complete: completePredictions.length,
    saved: savedPredictions.length,
    modified: modifiedPredictions.length,
    unsaved: unsavedPredictions.length,
    pending: pendingCount
  };
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

const savePredictionsBatch = async () => {
  if (!currentParticipante.value?._id) {
    errorMsg.value = 'No se pudo identificar el participante.';
    setTimeout(() => (errorMsg.value = ''), 2000);
    return;
  }

  // Filtrar partidos que se pueden predecir y tienen predicciones completas
  const validPredictions = partidos.value
    .filter(p => canPredict(p) && isPredictionComplete(p._id))
    .map(p => ({
      partido: p._id,
      participante: currentParticipante.value._id,
      golesEquipo1: Number(predictions.value[p._id].e1),
      golesEquipo2: Number(predictions.value[p._id].e2),
      _existingId: predictions.value[p._id]?._id
    }));

  if (validPredictions.length === 0) {
    errorMsg.value = 'No hay predicciones válidas para guardar.';
    setTimeout(() => (errorMsg.value = ''), 2000);
    return;
  }

  try {
    batchSaving.value = true;
    const response = await api.savePredictionsBatch(validPredictions);
    
    // Verificar que la respuesta tenga la estructura esperada
    const responseData = response.data?.data || response.data;
    const results = responseData?.results || [];
    const errors = responseData?.errors || [];
    
    // Actualizar el estado de todas las predicciones válidas después del guardado exitoso
    if (results.length > 0) {
      // Crear un nuevo objeto para forzar reactividad
      const updatedPredictions = { ...predictions.value };
      
      // Marcar todas las predicciones enviadas como guardadas
      validPredictions.forEach(validPred => {
        if (updatedPredictions[validPred.partido]) {
          updatedPredictions[validPred.partido] = {
            ...updatedPredictions[validPred.partido],
            saved: true,
            updatedAt: new Date().toISOString()
          };
        }
      });
      
      // Actualizar IDs para predicciones nuevas
      results.forEach(result => {
        if (result.prediction) {
          const partidoId = result.prediction.partido;
          if (updatedPredictions[partidoId] && !updatedPredictions[partidoId]._id) {
            updatedPredictions[partidoId] = {
              ...updatedPredictions[partidoId],
              _id: result.prediction._id
            };
          }
        }
      });
      
      // Asignar el nuevo objeto para forzar reactividad
      predictions.value = updatedPredictions;
      
      // Forzar actualización en el próximo tick
      await nextTick();
    } else {
      // Si no hay results pero la operación fue exitosa, marcar todas como guardadas de todas formas
      const updatedPredictions = { ...predictions.value };
      
      validPredictions.forEach(validPred => {
        if (updatedPredictions[validPred.partido]) {
          updatedPredictions[validPred.partido] = {
            ...updatedPredictions[validPred.partido],
            saved: true,
            updatedAt: new Date().toISOString()
          };
        }
      });
      
      predictions.value = updatedPredictions;
      await nextTick();
    }

    batchSaved.value = true;
    console.log(results, errors);
    // Mostrar resultado
    if (errors.length > 0) {
      errorMsg.value = `Se guardaron las predicciones. ${errors.length} tuvieron errores.`;
    } else {
      errorMsg.value = `Se guardaron las predicciones exitosamente.`;
    }
    
    setTimeout(() => {
      errorMsg.value = '';
      batchSaved.value = false;
    }, 3000);
  } catch (e) {
    console.error('Error saving predictions batch', e);
    errorMsg.value = e.response?.data?.message || 'Error al guardar predicciones.';
    setTimeout(() => (errorMsg.value = ''), 3000);
  } finally {
    batchSaving.value = false;
  }
};

onMounted(async () => {
  try {
    // 1. Cargar torneo
    await getTorneo();
    
    // 2. Obtener participante actual
    await getCurrentParticipante();
    
    // 3. Determinar fecha actual y cargar partidos
    await setCurrentRound();
    await getPartidos();
    
    // 4. Cargar predicciones existentes
    await loadPredictions();
  } catch (error) {
    console.error('Error during component mounting:', error);
    errorMsg.value = 'Error al cargar la información del torneo';
  }
});

watch([selectedRound], async () => {
  try {
    await getPartidos();
    await loadPredictions();
  } catch (error) {
    console.error('Error watching selectedRound:', error);
  }
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
              class="grid grid-cols-[3rem_minmax(0,1fr)_auto_minmax(0,1fr)] sm:grid-cols-[5rem_1fr_auto_1fr] items-center gap-2.5 sm:gap-4 px-4 py-4 min-h-[64px] text-center w-full"
            >
              <!-- Estado / Hora -->
              <div class="flex flex-col items-center justify-center w-12 sm:w-20 shrink-0 text-center">
                <template v-if="partido.status === 'Not Started'">
                  <div class="text-xs text-gray-500 text-center">
                    {{ new Date(partido.fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: tz }) }}
                    <span class="hidden sm:inline text-xs">hs</span>
                  </div>
                  <!-- Mostrar tiempo restante si es menos de 2 horas -->
                  <div v-if="getTimeUntilMatch(partido) && new Date(partido.fecha) - new Date() < 2 * 60 * 60 * 1000" 
                       class="text-xs" 
                       :class="canPredict(partido) ? 'text-green-600' : 'text-red-500'">
                    {{ getTimeUntilMatch(partido) }}
                  </div>
                  <!-- Indicador de estado de predicción -->
                  <div class="flex items-center gap-1 mt-1">
                    <div class="w-2 h-2 rounded-full" :class="{
                      'bg-green-500': isPredictionSaved(partido._id) && !isPredictionModified(partido._id),
                      'bg-yellow-500': isPredictionModified(partido._id),
                      'bg-gray-300': !isPredictionComplete(partido._id) && canPredict(partido),
                      'bg-red-500': !canPredict(partido)
                    }"></div>
                    <span class="text-xs text-gray-500">
                      <span v-if="!canPredict(partido)">No disponible</span>
                      <span v-else-if="isPredictionSaved(partido._id) && !isPredictionModified(partido._id)">Guardada</span>
                      <span v-else-if="isPredictionModified(partido._id)">Modificada</span>
                      <span v-else-if="isPredictionComplete(partido._id)">Lista</span>
                      <span v-else>Pendiente</span>
                    </span>
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
                <span class="font-medium text-gray-700 truncate leading-tight text-xs sm:text-base">{{ shortName(partido.equipo1) }}</span>
              </div>

              <!-- Marcador / Predicción -->
              <div class="flex items-center justify-center gap-1 sm:gap-2">
                <template v-if="isFinished(partido) || isPlaying(partido)">
                  <span class="text-sm sm:text-xl font-bold text-gray-800 min-w-[1.5rem] text-center">{{ partido.golesEquipo1 ?? '-' }}</span>
                  <span class="text-sm sm:text-lg font-light text-gray-500 px-1">-</span>
                  <span class="text-sm sm:text-xl font-bold text-gray-800 min-w-[1.5rem] text-center">{{ partido.golesEquipo2 ?? '-' }}</span>
                </template>
                <template v-else>
                  <div class="flex items-center gap-1 sm:gap-2">
                    <!-- Input Equipo 1 -->
                    <div class="relative flex flex-col items-center">
                      <!-- Flecha arriba -->
                      <button
                        v-if="canPredict(partido)"
                        @click="() => {
                          const currentVal = predictions[partido._id]?.e1 || 0;
                          upsertPredictionLocal(partido._id, Math.min(currentVal + 1, 20), undefined);
                        }"
                        class="w-8 h-3 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-t transition-colors mb-1"
                        :disabled="batchSaving"
                        type="button"
                      >
                        ▲
                      </button>
                      
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="1"
                        class="w-10 h-10 sm:w-14 sm:h-14 text-center text-sm sm:text-lg font-bold rounded-lg outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-2 appearance-none"
                        :class="{
                          'bg-gray-100 focus:ring-blue-400 border-gray-300': canPredict(partido) && !isPredictionSaved(partido._id),
                          'bg-green-50 border-green-400 focus:ring-green-400 text-green-800': canPredict(partido) && isPredictionSaved(partido._id) && !isPredictionModified(partido._id),
                          'bg-yellow-50 border-yellow-400 focus:ring-yellow-400 text-yellow-800': canPredict(partido) && isPredictionModified(partido._id),
                          'bg-red-50 border-red-300 text-red-600': !canPredict(partido)
                        }"
                        :value="(predictions[partido._id]?.e1) ?? ''"
                        :disabled="!canPredict(partido) || batchSaving"
                        @input="upsertPredictionLocal(partido._id, $event.target.valueAsNumber >= 0 ? $event.target.valueAsNumber : 0, undefined)"
                        @keyup.enter="savePredictionsBatch"
                        :placeholder="canPredict(partido) ? '0' : 'X'"
                        aria-label="Goles equipo 1"
                      />
                      
                      <!-- Flecha abajo -->
                      <button
                        v-if="canPredict(partido)"
                        @click="() => {
                          const currentVal = predictions[partido._id]?.e1 || 0;
                          upsertPredictionLocal(partido._id, Math.max(currentVal - 1, 0), undefined);
                        }"
                        class="w-8 h-3 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-b transition-colors mt-1"
                        :disabled="batchSaving"
                        type="button"
                      >
                        ▼
                      </button>
                    </div>
                    
                    <!-- Separador -->
                    <span class="text-lg font-light text-gray-500 px-1 sm:px-2">-</span>
                    
                    <!-- Input Equipo 2 -->
                    <div class="relative flex flex-col items-center">
                      <!-- Flecha arriba -->
                      <button
                        v-if="canPredict(partido)"
                        @click="() => {
                          const currentVal = predictions[partido._id]?.e2 || 0;
                          upsertPredictionLocal(partido._id, undefined, Math.min(currentVal + 1, 20));
                        }"
                        class="w-8 h-3 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-t transition-colors mb-1"
                        :disabled="batchSaving"
                        type="button"
                      >
                        ▲
                      </button>
                      
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="1"
                        class="w-10 h-10 sm:w-14 sm:h-14 text-center text-sm sm:text-lg font-bold rounded-lg outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border-2 appearance-none"
                        :class="{
                          'bg-gray-100 focus:ring-blue-400 border-gray-300': canPredict(partido) && !isPredictionSaved(partido._id),
                          'bg-green-50 border-green-400 focus:ring-green-400 text-green-800': canPredict(partido) && isPredictionSaved(partido._id) && !isPredictionModified(partido._id),
                          'bg-yellow-50 border-yellow-400 focus:ring-yellow-400 text-yellow-800': canPredict(partido) && isPredictionModified(partido._id),
                          'bg-red-50 border-red-300 text-red-600': !canPredict(partido)
                        }"
                        :value="(predictions[partido._id]?.e2) ?? ''"
                        :disabled="!canPredict(partido) || batchSaving"
                        @input="upsertPredictionLocal(partido._id, undefined, $event.target.valueAsNumber >= 0 ? $event.target.valueAsNumber : 0)"
                        @keyup.enter="savePredictionsBatch"
                        :placeholder="canPredict(partido) ? '0' : 'X'"
                        aria-label="Goles equipo 2"
                      />
                      
                      <!-- Flecha abajo -->
                      <button
                        v-if="canPredict(partido)"
                        @click="() => {
                          const currentVal = predictions[partido._id]?.e2 || 0;
                          upsertPredictionLocal(partido._id, undefined, Math.max(currentVal - 1, 0));
                        }"
                        class="w-8 h-3 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-b transition-colors mt-1"
                        :disabled="batchSaving"
                        type="button"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Equipo 2 -->
              <div class="flex items-center justify-end min-w-0 gap-1 pl-1 pr-2 sm:gap-2 sm:pl-2 sm:pr-3 flex-1 min-[0px]:basis-0">
                <span class="font-medium text-gray-700 truncate leading-tight text-right text-xs sm:text-base">{{ shortName(partido.equipo2) }}</span>
                <img :src="partido.equipo2Image" alt="" class="w-5 h-5 sm:w-10 sm:h-10 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="errorMsg" class="mt-4 p-3 rounded-lg text-center text-sm" :class="errorMsg.includes('exitosamente') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'">
        {{ errorMsg }}
      </div>
      
      <!-- Estadísticas de predicciones -->
      <div v-if="predictionsStats.total > 0" class="mt-6 bg-gray-50 rounded-xl p-4 border">
        <div class="text-center">
          <div class="text-lg font-semibold text-gray-900 mb-2">Estado de Predicciones</div>
          
          <!-- Barra de progreso -->
          <div class="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div 
              class="h-3 rounded-full transition-all duration-500 ease-out"
              :class="{
                'bg-green-500': predictionsStats.pending === 0,
                'bg-gradient-to-r from-green-500 to-yellow-500': predictionsStats.pending > 0 && predictionsStats.complete > predictionsStats.pending,
                'bg-yellow-500': predictionsStats.pending > 0
              }"
              :style="{ width: `${(predictionsStats.complete / predictionsStats.total) * 100}%` }"
            ></div>
          </div>
          
          <!-- Estadísticas -->
          <div class="flex justify-center items-center gap-6 text-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              <span class="text-gray-700">{{ predictionsStats.complete - predictionsStats.pending }} guardadas</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span class="text-gray-700">{{ predictionsStats.pending }} pendientes</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span class="text-gray-700">{{ predictionsStats.total - predictionsStats.complete }} sin completar</span>
            </div>
          </div>
          
          <div class="mt-2 text-xs text-gray-500">
            {{ predictionsStats.complete }} de {{ predictionsStats.total }} predicciones completas
          </div>
        </div>
      </div>
      
      <!-- Botón principal mejorado -->
      <div class="mt-6 mb-8">
        <button
          @click="savePredictionsBatch"
          :disabled="batchSaving || predictionsStats.pending === 0"
          class="w-full px-6 py-4 rounded-xl font-semibold text-lg focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
          :class="{
            'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:shadow-xl focus:ring-green-200': batchSaved || predictionsStats.pending === 0,
            'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-200': predictionsStats.pending > 0 && !batchSaved && predictionsStats.modified === 0,
            'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:shadow-xl focus:ring-yellow-200': predictionsStats.modified > 0 && !batchSaved
          }"
        >
          <div class="flex items-center justify-center gap-3">
            <div v-if="batchSaving" class="flex items-center gap-2">
              <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Guardando {{ predictionsStats.pending }} predicciones...</span>
            </div>
            <div v-else-if="batchSaved || predictionsStats.pending === 0" class="flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span>Todas las predicciones guardadas</span>
            </div>
            <div v-else class="flex items-center gap-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
              </svg>
              <span v-if="predictionsStats.modified > 0 && predictionsStats.unsaved === 0">
                Actualizar {{ predictionsStats.pending }} predicciones
              </span>
              <span v-else-if="predictionsStats.unsaved > 0 && predictionsStats.modified === 0">
                Guardar {{ predictionsStats.pending }} predicciones nuevas
              </span>
              <span v-else>
                Guardar {{ predictionsStats.pending }} predicciones
              </span>
            </div>
          </div>
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

/* Estilos para indicadores de estado */
.bg-green-50 { background-color: #f0fdf4; }
.border-green-200 { border-color: #bbf7d0; }
.border-green-300 { border-color: #86efac; }
.border-green-400 { border-color: #4ade80; }
.focus\:ring-green-400:focus { box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1); }

.bg-yellow-50 { background-color: #fefce8; }
.border-yellow-200 { border-color: #fde047; }
.border-yellow-300 { border-color: #facc15; }
.border-yellow-400 { border-color: #eab308; }
.focus\:ring-yellow-400:focus { box-shadow: 0 0 0 3px rgba(250, 204, 21, 0.1); }

.text-green-600 { color: #16a34a; }
.text-green-700 { color: #15803d; }
.text-blue-600 { color: #2563eb; }
.text-yellow-700 { color: #a16207; }
.text-yellow-800 { color: #92400e; }

/* Botón mejorado */
.focus\:ring-blue-200:focus { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15); }
.focus\:ring-green-200:focus { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.15); }
.focus\:ring-yellow-200:focus { box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.15); }

/* Estilos para inputs de número */
input[type="number"] {
  appearance: textfield; /* Standard */
  -moz-appearance: textfield; /* Firefox */
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none; /* Chrome, Safari, Edge */
  margin: 0;
}

.appearance-none {
  appearance: none;
}

/* Botones de incremento/decremento personalizados */
.increment-btn, .decrement-btn {
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

/* Animaciones */
@keyframes spin {
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 1s linear infinite;
}

/* Transiciones suaves */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

.transition-colors {
  transition-property: color, background-color, border-color;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.duration-200 {
  transition-duration: 200ms;
}

.duration-300 {
  transition-duration: 300ms;
}

.duration-500 {
  transition-duration: 500ms;
}

.ease-out {
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
}

/* Efectos hover/active */
.hover\:scale-\[1\.02\]:hover {
  transform: scale(1.02);
}

.active\:scale-\[0\.98\]:active {
  transform: scale(0.98);
}

/* Mejores estilos para los botones de incremento */
.hover\:bg-gray-200:hover {
  background-color: #e5e7eb;
}

.border-gray-300 {
  border-color: #d1d5db;
}

.focus\:ring-blue-400:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
