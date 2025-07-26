<script setup>
import BaseLayout from "@/layouts/BaseLayout.vue";
import { useAuth } from "@/store/auth";
const { user } = useAuth();
</script>

<template>
  <BaseLayout>
    <h2 class="text-2xl font-semibold my-4 text-center">Bienvenido {{user.userName}}</h2>
    <!-- Acá iría contenido de la home -->
  </BaseLayout>
</template>

<style scoped>

</style>