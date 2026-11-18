# Especificación — CanchaYa

## 1. Resumen
CanchaYa permite a un usuario reservar una cancha de fútbol 5 por turnos de 1 hora, ver sus reservas, y cancelarlas. El sistema aplica reglas de negocio de horarios, disponibilidad, precios, límites y cancelación.

## 2. Actores
- **Jugador:** reserva y cancela sus turnos. Puede ser *Regular* o *Socio*.

## 3. Entidades
| Entidad | Campos |
|---|---|
| Cancha | id, nombre (`Cancha 1`, `Cancha 2`, `Cancha 3`) |
| Jugador | nombre, tipo (`regular` \| `socio`) |
| Reserva | id, canchaId, jugador, tipoJugador, fecha (`YYYY-MM-DD`), hora (entero 0–23), precio, estado (`activa` \| `cancelada`), creadaEn |

## 4. Reglas de negocio

### Horarios y disponibilidad
- **RN-01 — Horario de atención:** los turnos van de **10:00 a 23:00** (el último turno empieza a las 22:00 y termina a las 23:00). Turnos fuera de ese rango se rechazan.
- **RN-02 — Duración fija:** cada turno dura exactamente 1 hora.
- **RN-03 — Sin solapamiento:** una cancha no puede tener dos reservas **activas** en la misma fecha y hora. Una reserva cancelada libera el turno.
- **RN-04 — No reservar en el pasado:** no se puede reservar un turno cuya hora de inicio ya pasó.
- **RN-05 — Anticipación máxima:** solo se puede reservar hasta **30 días** hacia adelante.

### Precios
- **RN-06 — Tarifa base:** horario valle (10:00–17:59) = **$12.000**; horario pico (18:00–22:59) = **$18.000**.
- **RN-07 — Recargo fin de semana:** sábados y domingos tienen **+15%** sobre la tarifa.
- **RN-08 — Descuento socio:** los socios reciben **-20%** sobre el precio ya calculado (con recargo incluido).
- **RN-09 — Redondeo:** el precio final se redondea al entero más cercano (pesos).

### Límites del jugador
- **RN-10 — Máximo de reservas activas:** un jugador puede tener como máximo **3 reservas activas futuras** a la vez (regular) o **5** (socio).
- **RN-11 — Un turno por día:** un jugador no puede tener más de **una reserva activa por día** (evita acaparar).
- **RN-12 — Nombre obligatorio:** el nombre del jugador es obligatorio (mín. 2 caracteres, sin espacios solos).

### Cancelación
- **RN-13 — Cancelación con anticipación:** se puede cancelar hasta **12 horas antes** del inicio del turno.
- **RN-14 — Cancelación tardía:** con menos de 12 horas de anticipación **no** se puede cancelar.
- **RN-15 — Reserva ya cancelada:** no se puede cancelar dos veces.

## 5. Casos de uso
1. **Reservar turno:** el jugador elige cancha, fecha, hora, ingresa su nombre y tipo → el sistema valida RN-01…RN-12, calcula el precio y confirma.
2. **Ver disponibilidad:** grilla por fecha mostrando cada cancha/hora como *libre* u *ocupada*, con el precio.
3. **Ver mis reservas:** listado filtrado por nombre del jugador.
4. **Cancelar reserva:** valida RN-13…RN-15 y libera el turno.

## 6. Criterios de aceptación (ejemplos)
- Reservar Cancha 1, sábado 20:00, socio → precio = 18.000 × 1,15 × 0,80 = **$16.560**.
- Reservar Cancha 2, miércoles 11:00, regular → **$12.000**.
- Reservar un turno ya ocupado → error "El turno ya está reservado".
- Reservar a las 09:00 → error "Fuera del horario de atención".
- Cancelar con 5 hs de anticipación → error "Solo se puede cancelar hasta 12 horas antes".

## 7. Fuera de alcance
Pagos reales, login, notificaciones, backend/base de datos, múltiples sedes.
