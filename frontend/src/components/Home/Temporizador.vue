<script setup>
import { ref, onMounted, watch, computed } from 'vue';

const emit = defineEmits(['completed']);
const props = defineProps({
  minutos: {
    type: Number,
    required: true
  }
});

const tiempoRestante = ref(props.minutos * 60); // Convertir minutos a segundos
const intervalo = ref(null);
const pausado = ref(false);


const iniciarTemporizador = () => {
  intervalo.value = setInterval(() => {
    if (!pausado.value && tiempoRestante.value > 0) {
      tiempoRestante.value--;
    }
  }, 1000);
};

const pausarReanudar = () => {
  pausado.value = !pausado.value;
};

const formatearTiempo = (segundos) => {
  if (isNaN(segundos)) return '0:00';
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;
  return `${minutos}:${segundosRestantes < 10 ? '0' : ''}${segundosRestantes}`;
};

const progreso = computed(() => {
  return ((props.minutos * 60 - tiempoRestante.value) / (props.minutos * 60)) * 100;
});

const marcarComoCompletado = () => {
  clearInterval(intervalo.value);
  tiempoRestante.value = 0;
  emit('completed');
};

onMounted(() => {
  iniciarTemporizador();
});

watch(() => props.minutos, (newMinutos) => {
  tiempoRestante.value = newMinutos * 60;
  clearInterval(intervalo.value);
  iniciarTemporizador();
});

watch(() => tiempoRestante.value, (nuevoTiempoRestante) => {
  if (nuevoTiempoRestante === 0) {
    marcarComoCompletado();
  }
});

</script>

<template>
  <div class="temporizador">
    <div class="barra-progreso" :style="{ width: progreso + '%' }"></div>
    <div class="tiempo-restante">{{ formatearTiempo(tiempoRestante) }}</div>
    <button @click="pausarReanudar">{{ pausado ? 'Reanudar' : 'Pausar' }}</button>
  </div>
</template>

<style scoped>
.temporizador {
  position: relative;
  width: 100%;
  height: 50px;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 10px;
  background-color: #1e1d1d;
  color: white;
}

.barra-progreso {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: #4caf50;
  transition: width 1s linear;
  z-index: -1;
}

.tiempo-restante {
  font-size: 1.2em;
}

button {
  background-color: #1e1d1d;
  color: #ffffff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  padding: 5px 10px;
}

button:hover {
  background-color: #404240;
}
</style>