# Guion de demo — CanchaYa (45 segundos)

Grabá la pantalla (OBS, Win+G, QuickTime o el grabador del celular). Abrí `app/index.html` en el navegador **antes** de empezar.

| Tiempo | Acción en pantalla | Qué decir (opcional) |
|---|---|---|
| 0–5 s | Mostrar la app con el logo y el nombre | "Esta es CanchaYa, una app para reservar canchas de fútbol 5." |
| 5–12 s | Apretar **Reservar** sin nombre → aparece el error | "Si falta el nombre, no deja reservar." |
| 12–22 s | Nombre: *Santino*, tipo **Socio**, fecha: próximo sábado, Cancha 2, 20:00 → mostrar precio **$16.560** (pico + finde + descuento socio) → **Reservar** | "El precio aplica horario pico, recargo de fin de semana y descuento de socio." |
| 22–30 s | Mostrar la grilla con el turno ocupado y la reserva en "Mis reservas" | "Queda marcado como ocupado." |
| 30–38 s | Cambiar el nombre a *Lucía* y reservar el mismo turno → error "El turno ya está reservado" | "No se pueden pisar reservas." |
| 38–45 s | Volver a *Santino* → **Cancelar** → el turno queda libre | "Y se puede cancelar con más de 12 horas de anticipación." |

## Tips
- Duración objetivo: entre 30 y 60 segundos.
- Si la app tiene datos viejos de pruebas anteriores, abrí la consola del navegador (F12) y ejecutá `localStorage.clear()` y recargá.
- Subí el video a la plataforma de la tarea (o a Drive/YouTube como "no listado" y pegá el link).
