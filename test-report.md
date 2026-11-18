# Reporte de testeo — CanchaYa

**Fecha:** 18/11/2026 · **Resultado general:** ✅ todo OK

## 1. Tests automáticos de reglas de negocio
Comando: `npm test` (o `node tests/reglas.test.js`)

| Grupo | Reglas | Tests | Resultado |
|---|---|---|---|
| Precios | RN-06, 07, 08, 09 | 9 | ✅ |
| Horarios y fechas | RN-01, 02, 04, 05 | 15 | ✅ |
| Solapamiento | RN-03 | 4 | ✅ |
| Límites del jugador | RN-10, 11, 12 | 9 | ✅ |
| Cancelación | RN-13, 14, 15 | 7 | ✅ |
| Integridad de datos | — | 3 | ✅ |
| **Total** | **RN-01 a RN-15** | **47** | **47 OK / 0 fallaron** |

Los 47 tests usan un "ahora" fijo (miércoles 18/11/2026 12:00) para que el resultado sea siempre el mismo.

### Casos borde cubiertos
- Cancelar con **exactamente 12 hs** → permitido. Con **11 h 59 min** → rechazado.
- Reservar a **exactamente 30 días** → permitido. A **31 días** → rechazado.
- Turno **justo a la hora actual** → rechazado (ya empezó).
- Límite horario: **10:00 y 22:00** válidos; **09:00 y 23:00** rechazados.
- Nombre con espacios / distinto uso de mayúsculas ("santino" = "SANTINO").
- Fecha inexistente (31/02) y formato inválido.

### Criterios de aceptación de la spec
| Criterio | Esperado | Resultado |
|---|---|---|
| Socio, sábado 20:00 | $16.560 | ✅ |
| Regular, miércoles 11:00 | $12.000 | ✅ |
| Turno ocupado | "El turno ya está reservado." | ✅ |
| Hora 09:00 | "Fuera del horario de atención" | ✅ |
| Cancelar con 5 hs | "Solo se puede cancelar hasta 12 horas antes" | ✅ |

## 2. Test de interfaz (flujo completo)
Comando: `npm install && npm run test:ui` (usa jsdom, simula el navegador)

| Paso | Resultado |
|---|---|
| La grilla carga 13 horarios × 3 canchas | ✅ |
| Reservar sin nombre muestra error | ✅ |
| Reserva válida de socio ($16.560 un sábado a las 20) | ✅ |
| La reserva aparece en "Mis reservas" y la grilla la marca ocupada | ✅ |
| Otro jugador en el mismo turno → error | ✅ |
| Mismo jugador, mismo día → error | ✅ |
| Cancelar con anticipación → turno libre otra vez | ✅ |
| Sin errores de JavaScript | ✅ |

## 3. Test manual
Seguir el flujo de `demo-script.md` en el navegador (abrir `app/index.html`). Resultado esperado: idéntico al del test de interfaz.

## 4. Bug encontrado durante el desarrollo
- Un test de ids fallaba porque intentaba reservar dos veces el mismo turno. La lógica estaba bien (RN-03 lo bloqueaba); el error estaba en el test. Se corrigió el test usando otra cancha.
