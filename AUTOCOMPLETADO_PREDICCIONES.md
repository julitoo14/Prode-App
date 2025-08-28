# Sistema de Autocompletado de Predicciones

## Nuevas Funcionalidades Implementadas

### 🔄 **Autocompletado de Predicciones Existentes**

Ahora cuando un usuario accede a la página de partidos, el sistema automáticamente:

1. **Carga predicciones existentes**: Busca todas las predicciones que el usuario ya hizo para ese torneo
2. **Autocompleta los campos**: Llena automáticamente los campos de goles con las predicciones guardadas
3. **Muestra el estado**: Indica visualmente si cada predicción está guardada, modificada o es nueva

### 🎨 **Indicadores Visuales de Estado**

Los campos de entrada ahora tienen diferentes colores según el estado:

- **🔴 Gris**: Partido normal sin predicción
- **🟢 Verde**: Predicción guardada sin modificaciones
- **🟡 Amarillo**: Predicción guardada pero modificada (pendiente de actualizar)
- **🔴 Rojo**: Partido que ya no se puede predecir (menos de 10 min o ya empezó)

### 📊 **Estadísticas en Tiempo Real**

- Muestra cuántas predicciones están completas vs total de partidos
- Indica cuántas predicciones están pendientes de guardar
- Diferencia entre predicciones nuevas y modificaciones

### 🎯 **Botones Inteligentes**

#### Botón Individual:
- **"Incompleta"**: Si faltan datos
- **"Guardar"**: Para predicciones nuevas completas
- **"Actualizar"**: Para predicciones modificadas
- **"Guardada ✓"**: Para predicciones ya guardadas sin cambios

#### Botón Batch:
- **"Guardar X predicciones nuevas"**: Solo predicciones nuevas
- **"Actualizar X predicciones"**: Solo modificaciones
- **"Guardar X predicciones"**: Mix de nuevas y modificadas
- **"Todas las predicciones guardadas ✓"**: Cuando no hay cambios pendientes

## Cómo Funciona

### 1. Carga Inicial
```javascript
onMounted(async () => {
  await getTorneo();              // Cargar datos del torneo
  await getCurrentParticipante(); // Identificar al usuario
  await setCurrentRound();        // Determinar fecha actual
  await getPartidos();            // Cargar partidos de la fecha
  await loadPredictions();        // ⭐ AUTOCOMPLETAR predicciones existentes
});
```

### 2. Detección de Estados
```javascript
// Verificar si una predicción está guardada
const isPredictionSaved = (matchId) => {
  return predictions.value[matchId]?._id && predictions.value[matchId]?.saved !== false;
};

// Verificar si una predicción fue modificada
const isPredictionModified = (matchId) => {
  const pred = predictions.value[matchId];
  return pred && pred._id && pred.saved === false;
};
```

### 3. Sincronización con Backend
- Al cargar: `GET /prediction/byParticipante/:id` obtiene todas las predicciones del usuario
- Al guardar individual: `POST /prediction` (nueva) o `PUT /prediction/:id` (actualización)
- Al guardar en lote: `POST /prediction/batch` procesa múltiples predicciones

### 4. Manejo de Estado Local
```javascript
const upsertPredictionLocal = (matchId, e1, e2) => {
  const existing = predictions.value[matchId] || {};
  predictions.value[matchId] = {
    ...existing,
    e1: typeof e1 === 'number' && !Number.isNaN(e1) ? e1 : existing.e1,
    e2: typeof e2 === 'number' && !Number.isNaN(e2) ? e2 : existing.e2,
    saved: false, // ⭐ Marca como modificado
  };
};
```

## Experiencia de Usuario Mejorada

### Antes:
- ❌ Usuario tenía que recordar sus predicciones anteriores
- ❌ No sabía qué predicciones ya había guardado
- ❌ Posibilidad de duplicar esfuerzos
- ❌ Sin feedback visual del estado

### Después:
- ✅ Predicciones se autocompletan automáticamente
- ✅ Indicadores visuales claros del estado
- ✅ Botones contextuales según la acción necesaria
- ✅ Estadísticas en tiempo real
- ✅ Diferenciación entre guardar nuevas vs actualizar existentes

## Casos de Uso

### Caso 1: Usuario Nuevo
1. Entra por primera vez → Campos vacíos
2. Completa predicciones → Fondo gris normal
3. Guarda → Campos se vuelven verdes

### Caso 2: Usuario Regresa
1. Entra de nuevo → **Predicciones autocompletadas** en verde
2. Modifica una predicción → Campo se vuelve amarillo
3. Guarda cambios → Vuelve a verde

### Caso 3: Predicciones Mixtas
1. Algunas predicciones ya guardadas (verde)
2. Algunas modificadas (amarillo)
3. Algunas nuevas (gris)
4. Botón batch muestra: "Guardar 5 predicciones" (total pendientes)

## Beneficios

- **🚀 Mejor UX**: Usuario sabe exactamente qué tiene guardado
- **⚡ Eficiencia**: No repite trabajo ya hecho
- **🎯 Claridad**: Estados visuales claros
- **📱 Responsivo**: Funciona en móvil y desktop
- **🔄 Sincronización**: Estado local sincronizado con servidor
