// /cron/habitCron.js

const cron = require('node-cron');
const Habit = require('../models/Habit');  // Ruta relativa al modelo Habit

function obtenerDiaDeLaSemana() {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const hoy = new Date();
    return dias[hoy.getDay()];
}

async function actualizarHistorialYResetearEstados() {
    try {
        const diaActual = obtenerDiaDeLaSemana();
        const fechaActual = new Date();

        // Encuentra todos los hábitos que deben cumplirse en el día actual
        const habitosDelDia = await Habit.find({ dias_de_la_semana: diaActual });

        for (const habito of habitosDelDia) {
            // Guardar el estado actual del hábito en el historial
            habito.historial.push({
                fecha: fechaActual,
                completado: habito.estado_inicial  // Guardamos el estado actual
            });

            // Manejar el reseteo del estado y metas completadas
            if (habito.tipo === 'mal habito') {
                habito.estado_inicial = true;  // Malos hábitos se deben cumplir diariamente
            } else if (habito.tipo === 'buen habito') {
                habito.estado_inicial = false;  // Buenos hábitos se resetean al no completado
            } else if (habito.tipo === 'meta' && habito.estado_inicial === true) {
                // Si la meta está completada, la eliminamos o desactivamos para que no aparezca más
                habito.dias_de_la_semana = [];  // Desactivamos la meta
                console.log(`Meta completada: ${habito.nombre} - ya no aparecerá en los días siguientes.`);
            }

            // Guarda el hábito con el historial actualizado
            await habito.save();
        }

        console.log(`Historial actualizado y estados reseteados para el día: ${fechaActual.toLocaleDateString()}`);
    } catch (error) {
        console.error('Error al actualizar el historial de hábitos:', error);
    }
}

cron.schedule('0 0 * * *', () => {
    console.log('Ejecutando tarea diaria para actualizar el historial de hábitos, resetear estados y manejar metas completadas');
    actualizarHistorialYResetearEstados();
}, {
    scheduled: true,
    timezone: "America/Argentina/Buenos_Aires"
});

