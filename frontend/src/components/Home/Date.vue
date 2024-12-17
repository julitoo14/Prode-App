<script setup>
const date = new Date();
const days = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
const weekDay = days[date.getDay()];
const day = date.getDate();
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const month = months[date.getMonth()];

import Clock from "./Clock.vue";
</script>

<template>
  <div class="flex justify-between items-center w-full p-1 text-base">
    <Clock />
    <p>{{weekDay}} {{day}} de {{month}} </p>
  </div>

</template>

