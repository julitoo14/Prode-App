<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const time = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

const updateTime = () => {
  time.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

let intervalId;

onMounted(() => {
  intervalId = setInterval(updateTime, 10000);
});

onUnmounted(() => {
  clearInterval(intervalId);
});
</script>

<template>
  <div>
    <p>{{ time }}</p>
  </div>
</template>

<style scoped>

</style>