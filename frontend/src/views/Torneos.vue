<script setup>
import api from '@/services/api';
import BaseLayout from "@/layouts/BaseLayout.vue";
import {onMounted, ref} from 'vue';
import { useAuth } from '@/store/auth';
import { useRouter } from 'vue-router';

const { user } = useAuth();
const router = useRouter();
const participaciones = ref([]);
const tournaments = ref([]);


const fetchTournaments = async () => {
  try {
    const response = await api.getParticipaciones();
    console.log('Participaciones:', response.data.participantes);
    participaciones.value = response.data.participantes;
    console.log('Torneos:', tournaments.value);
    tournaments.value = participaciones.value.map(p => p.tournament);
  } catch (error) {
    console.error('Error fetching tournaments:', error);
  }
};

onMounted(() => {
  fetchTournaments();
})
</script>

<template>
  <BaseLayout>
    <div class="p-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-2/3 mx-auto">
      <RouterLink
        :to="`/torneo/${tournament._id}`"
        v-for="tournament in tournaments"
        :key="tournament._id"
        class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1"
      >
        <div class="p-6">
          <div class="flex items-baseline mb-2">
            <span class="inline-block bg-indigo-200 text-indigo-800 text-xs px-2 rounded-full uppercase font-semibold tracking-wide">
              {{ tournament.competition?.name || 'Sin Competición' }}
            </span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">{{ tournament.name }}</h2>
          <p class="text-sm text-gray-600 mb-4">Organizado por: <span class="font-semibold">{{ tournament.creator.userName }}</span></p>
          
          <div class="border-t border-gray-200 pt-4">
            <h4 class="font-semibold text-gray-700 mb-2">Reglas del Torneo:</h4>
            <p class="text-gray-600 capitalize">{{ tournament.rules }}</p>
          </div>
        </div>
      </RouterLink>
    </div>
  </BaseLayout>
</template>

<style scoped>

</style>