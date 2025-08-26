<script setup>
import { onMounted, ref } from "vue";
import BaseLayout from "@/layouts/BaseLayout.vue";
import api from "@/services/api";
import { useRoute } from "vue-router";
import { useAuth } from "@/store/auth";

const route = useRoute();

const tournament = ref({});
const isCreator = ref(false);
const { user } = useAuth();

function formatDate(dateStr) {
    if (!dateStr) return "-";
    try {
        return new Date(dateStr).toLocaleDateString("es-AR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch (_) {
        return dateStr;
    }
}

const borrarTorneo = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar este torneo?")) {
        try {
            await api.deleteTournament(tournament.value._id);
            route.push("/torneos");
        } catch (error) {
            console.error("Error deleting tournament:", error);
        }
    }
};

onMounted(async () => {
    const tournamentId = route.params.torneoId;
    try {
        const response = await api.getTournamentById(tournamentId);
        tournament.value = response.data.tournament;
        isCreator.value = tournament.value.creator?._id === user.value._id;
    } catch (e) {
        console.log("Error fetching tournament details:", e);
    }
});
</script>

<template>
    <BaseLayout>
        <section class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <!-- Header / Hero -->
            <header class="text-center mb-6 sm:mb-10">
                <h2
                    class="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900"
                >
                    Detalles del Torneo
                </h2>
            </header>

            <!-- Card: Información del Torneo -->
            <div
                class="bg-white/90 backdrop-blur shadow-lg rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden"
            >
                <div
                    class="px-5 sm:px-8 py-5 sm:py-6 border-b border-gray-100 bg-gray-50"
                >
                    <h3 class="text-lg sm:text-xl font-semibold text-gray-800">
                        Información del Torneo
                    </h3>
                </div>
                <div class="px-5 sm:px-8 py-6">
                    <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        <div class="flex flex-col">
                            <dt
                                class="text-xs uppercase tracking-wide text-gray-500"
                            >
                                Nombre
                            </dt>
                            <dd
                                class="text-base sm:text-lg font-medium text-gray-900"
                            >
                                {{ tournament.name || "-" }}
                            </dd>
                        </div>
                        <div class="flex flex-col">
                            <dt
                                class="text-xs uppercase tracking-wide text-gray-500"
                            >
                                Competición
                            </dt>
                            <dd
                                class="text-base sm:text-lg font-medium text-gray-900"
                            >
                                {{
                                    tournament.competition?.name ||
                                    "Sin Competición"
                                }}
                            </dd>
                        </div>
                        <div class="flex flex-col">
                            <dt
                                class="text-xs uppercase tracking-wide text-gray-500"
                            >
                                Organizador
                            </dt>
                            <dd
                                class="text-base sm:text-lg font-medium text-gray-900"
                            >
                                {{
                                    tournament.creator?.userName ||
                                    "Desconocido"
                                }}
                            </dd>
                        </div>
                        <div class="flex flex-col">
                            <dt
                                class="text-xs uppercase tracking-wide text-gray-500"
                            >
                                Reglas
                            </dt>
                            <dd class="text-base sm:text-lg text-gray-900">
                                {{ tournament.rules || "default" }}
                            </dd>
                        </div>
                        <div class="flex flex-col">
                            <dt
                                class="text-xs uppercase tracking-wide text-gray-500"
                            >
                                Fecha de Creación
                            </dt>
                            <dd class="text-base sm:text-lg text-gray-900">
                                {{ formatDate(tournament.createdAt) }}
                            </dd>
                        </div>
                        <div class="flex flex-col">
                            <dt
                                class="text-xs uppercase tracking-wide text-gray-500"
                            >
                                Estado
                            </dt>
                            <dd>
                                <span
                                    class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                                    :class="
                                        tournament.status === 'pending'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-emerald-100 text-emerald-800'
                                    "
                                >
                                    {{ tournament.status || "Activo" }}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>

            <!-- Acciones -->
            <div class="mt-8 sm:mt-10">
                <div
                    class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto"
                >
                    <!-- Ver Partidos -->
                    <router-link
                        :to="`/torneo/${route.params.torneoId}/partidos`"
                        class="w-full inline-flex items-center justify-center gap-2 text-center bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 sm:py-3.5 px-5 rounded-xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-lg"
                        aria-label="Ver partidos de la competición"
                    >
                        <!-- Ball icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            class="w-6 h-6"
                            aria-hidden="true"
                        >
                            <path
                                d="M12 2a10 10 0 100 20 10 10 0 000-20zm6.92 6.62-2.52-.73-1.5-2.2A7.97 7.97 0 0118.92 8.6zM14.6 5.1l1.38 2.01-2.06 1.5h-3.84l-2.06-1.5L9.4 5.1a8.1 8.1 0 015.2 0zM6.1 5.69l-1.5 2.2-2.52.73A7.97 7.97 0 015.08 5.7zM4.3 16.02l.46-2.56L6.7 12l2.56.46.95 2.33-1.9 1.9a7.98 7.98 0 01-3.99-0.67zM12 20a7.98 7.98 0 01-4.05-1.1l2.03-2.03h4.04l2.03 2.03A7.98 7.98 0 0112 20zm5.7-3.98-1.9-1.9.95-2.33L19.7 12l1.94 1.46.46 2.56a7.98 7.98 0 01-4.4 0z"
                            />
                        </svg>
                        Ver Partidos
                    </router-link>

                    <!-- Ver Posiciones -->
                    <router-link
                        :to="`/torneo/${route.params.torneoId}/posiciones`"
                        class="w-full inline-flex items-center justify-center gap-2 text-center bg-gray-800 hover:bg-gray-900 active:bg-black text-white font-semibold py-3 sm:py-3.5 px-5 rounded-xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 text-lg"
                        aria-label="Ver posiciones del torneo"
                    >
                        <!-- Trophy icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            class="w-6 h-6"
                            aria-hidden="true"
                        >
                            <path
                                d="M18 2H6v3H3v3a5 5 0 005 5h.08A6.002 6.002 0 0011 18v2H8v2h8v-2h-3v-2a6.002 6.002 0 002.92-5H16a5 5 0 005-5V5h-3V2zm-2 3v3a3 3 0 11-6 0V5h6zM5 8V7h1v1a3 3 0 003 3H8a3 3 0 01-3-3zm13 0a3 3 0 01-3 3h-.99A3 3 0 0017 8V7h1v1z"
                            />
                        </svg>
                        Ver Posiciones
                    </router-link>
                    <!-- Borrar Torneo -->
                    <button
                        @click="borrarTorneo()"
                        class="w-full inline-flex items-center justify-center gap-2 text-center bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-3 sm:py-3.5 px-5 rounded-xl shadow-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-lg"
                        aria-label="Eliminar torneo"
                        v-if="isCreator"
                    >
                        <!-- Trash icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            class="w-6 h-6"
                            aria-hidden="true"
                        >
                            <path
                                d="M19 4h-3.5l-1-1h-6l-1 1H5a2 2 0 00-2 2v1h18V6a2 2 0 00-2-2zm-1 4H6V6h12v2zM5 9v11a2 2 0 002 2h10a2 2 0 002-2V9H5zm4 3h2v6H9v-6zm4 0h2v6h-2v-6zm-4 0h2v6H9v-6zm8 0h2v6h-2v-6z"
                            />
                        </svg>
                        Eliminar Torneo
                    </button>
                </div>
                <p class="text-center text-xs text-gray-500 mt-3">
                    La vista de posiciones está en construcción.
                </p>
            </div>
        </section>
    </BaseLayout>
</template>

<style scoped>
/* Add any additional styles here if needed */
</style>
