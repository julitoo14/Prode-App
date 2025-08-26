<template>
    <BaseLayout>
        <div class="p-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 w-2/3 mx-auto">
            <template v-if="tournaments.length > 0">
                <div
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
                    <h4 class="font-light text-gray-600 mb-2">Reglas del Torneo: <span class="text-lg font-bold"> {{ tournament.rules }}</span>  </h4>
                </div>
                <button 
                    v-if="!esCreador(tournament)"
                    class="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-transform transform hover:scale-105"
                    @click="unirseATorneo(tournament._id)"
                >
                    Unirse al Torneo
                </button>
                <p class="mt-2 font-light text-xs text-gray-600" v-else>Eres el creador de este torneo</p>
                </div>
                </div>
            </template>
            <div v-else class="flex text-center justify-center items-center text-gray-500">
                <p>No hay torneos disponibles.</p>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup>  
import api from '@/services/api';
import BaseLayout from "@/layouts/BaseLayout.vue";
import { onMounted, ref, computed } from 'vue';
import { useAuth } from '@/store/auth';
import { useRouter } from 'vue-router';
const { user } = useAuth();
const router = useRouter();
const allTournaments = ref([]);
const tournaments = ref([]);
const participaciones = ref([]);

const getId = (v) => String(v?._id ?? v ?? '');
const userId = computed(() => getId(user?.value));
const esCreador = (t) => getId(t?.creator) === userId.value;
const estaUnido = (t) =>
  participaciones.value.some(
    (p) => getId(p?.tournament) === getId(t?._id) && getId(p?.user) === userId.value
  );

const fetchTournaments = async () => {
  try {
    const res = await api.getTournaments();
    const participacionesRes = await api.getParticipaciones();
    allTournaments.value = res.data.tournaments;
    participaciones.value = participacionesRes.data.participantes;
    tournaments.value = allTournaments.value.filter((t) => {
      return !esCreador(t) && !estaUnido(t);
    });
  } catch (error) {
    console.error('Error fetching tournaments:', error);
  }
};

const unirseATorneo = async (tournamentId , password = null) => {
  try {
    const res = await api.createParticipante({ user: user.value._id, tournament: tournamentId });
    alert(res.data.message || 'Te has unido al torneo con éxito');
    router.push(`/torneo/${tournamentId}`);
  } catch (error) {
    console.error('Error al unirse al torneo:', error);
    alert(`${error.response?.data?.message || 'No se pudo unir al torneo'}`);
  }
};

onMounted(async () => {
  await fetchTournaments();
});
</script>