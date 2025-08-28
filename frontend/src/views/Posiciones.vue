<template>
    <BaseLayout>
        <div class=" w-full sm:w-2/4 mx-auto p-4">
            <div class="flex items-center mb-4 gap-x-4 w-full justify-start">

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
                <h1 class="text-2xl font-bold mx-auto">Posiciones</h1>
            </div>
            <div v-if="posiciones.length > 0" class="grid grid-cols-1 gap-x-4">
                <div v-for="(posicion, index) in posiciones" :key="posicion._id" class="bg-white flex justify-between items-center p-3 border border-gray-200 shadow">
                    <div v-if="index < 3" class="w-8 h-8 flex items-center justify-center rounded-full text-white font-bold"
                        :class="index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-yellow-700'">
                        {{ index + 1 }}

                    </div>
                    <h2 class="ml-4 text-xl font-semibold">{{ posicion.name }}</h2>
                    <p class="ml-auto">Puntos: {{ posicion.points }}</p>
                </div>
            </div>
        </div>
    </BaseLayout>
</template>

<script setup>
import BaseLayout from "@/layouts/BaseLayout.vue";
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/services/api';
const route = useRoute();
const posiciones = ref([]);

onMounted(async () => {
    await fetchPosiciones();
    console.log('Posiciones:', posiciones.value);
});

const fetchPosiciones = async () => {
    try {
        const response = await api.getParticipantesPorTorneo(route.params.torneoId);
        console.log('API Response:', response.data);
        posiciones.value = response.data.participantes;
        // los ordeno por puntos descendente
        posiciones.value.sort((a, b) => b.points - a.points);
    } catch (error) {
        console.error('Error fetching posiciones:', error);
    }
};

</script>