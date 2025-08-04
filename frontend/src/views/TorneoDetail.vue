<script setup>
import {onMounted, ref} from 'vue'
import BaseLayout from "@/layouts/BaseLayout.vue";
import api from '@/services/api'
import { useRoute } from 'vue-router';

const route = useRoute();
const tournament = ref({});
const partidos = ref([]);

onMounted(async () => {
  const tournamentId = route.params.torneoId;
  console.log(tournamentId);
  try{
    const response = await api.getTournamentById(tournamentId);
    tournament.value = response.data.tournament;
    const competitionId = tournament.value.competition?._id;
    console.log(competitionId)
    const partidosResponse = await api.getPartidosByCompetitionId(competitionId);
    partidos.value = partidosResponse.data.partidos;
    console.log(partidos.value);
    console.log(partidosResponse.data);
  }catch (e){
    console.log('Error fetching tournament details:', e);
  }
})
</script>

<template>
  <BaseLayout>
    <div class="max-w-4xl mx-auto px-4">
      <h2 class="text-3xl font-bold my-6 text-center text-gray-800">Detalles del Torneo</h2>
      <div class="bg-white shadow-md rounded-lg p-6">
        <h3 class="text-xl font-semibold mb-4">Información del Torneo</h3>
        <p class="text-gray-700 mb-2"><strong>Nombre:</strong> {{ tournament.name }}</p>
        <p class="text-gray-700 mb-2"><strong>Competición:</strong> {{ tournament.competition?.name || 'Sin Competición' }}</p>
        <p class="text-gray-700 mb-2"><strong>Organizador:</strong> {{ tournament.creator?.userName || 'Desconocido' }}</p>
        <p class="text-gray-700 mb-2"><strong>Reglas:</strong> {{ tournament.rules }}</p>
        <p class="text-gray-700 mb-2"><strong>Fecha de Creación:</strong> {{ new Date(tournament.createdAt).toLocaleDateString() }}</p>
        <p class="text-gray-700 mb-2"><strong>Estado:</strong> {{ tournament.status || 'Activo' }}</p>
      </div>
      <div class="flex justify-center mt-4">
        <RouterView name="partidos">
          <div class="bg-white shadow-md rounded-lg p-6 mt-6 w-full">
            <h3 class="text-xl font-semibold mb-4">Partidos del Torneo</h3>
            <ul class="list-disc pl-5">
              <li v-for="partido in partidos" :key="partido._id" class="mb-2">
                {{ partido.equipo1 }} - {{ partido.equipo2 }}   |    {{ new Date(partido.fecha).toLocaleDateString() }}
              </li>
            </ul>
          </div>
        </RouterView>
      </div>
    </div>
  </BaseLayout>
</template>

<style scoped>

</style>