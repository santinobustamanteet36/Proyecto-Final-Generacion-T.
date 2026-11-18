# Plan técnico — CanchaYa

## Arquitectura
```
canchaya/
├── app/
│   ├── reglas.js     # Lógica de negocio pura (RN-01…RN-15). Funciona en navegador y Node.
│   └── index.html    # UI (HTML+CSS+JS). Usa reglas.js y localStorage.
├── tests/
│   └── reglas.test.js
├── logo.svg
└── *.md              # constitution, spec, plan, tasks, test-report, demo-script, README
```

## Capas
1. **Dominio (`reglas.js`)** — funciones puras; reciben el estado (lista de reservas) y la hora actual como parámetro (`ahora`) para poder testear el tiempo.
2. **Persistencia** — `localStorage` bajo la clave `canchaya.reservas`.
3. **UI** — renderiza la grilla, el formulario y "mis reservas"; muestra los errores devueltos por el dominio.

## API del dominio
| Función | Regla(s) |
|---|---|
| `calcularPrecio(fecha, hora, tipo)` | RN-06, 07, 08, 09 |
| `validarReserva(reservas, datos, ahora)` | RN-01, 02, 03, 04, 05, 10, 11, 12 |
| `crearReserva(reservas, datos, ahora)` | usa `validarReserva` + `calcularPrecio` |
| `puedeCancelar(reserva, ahora)` | RN-13, 14, 15 |
| `cancelarReserva(reservas, id, ahora)` | usa `puedeCancelar` |
| `estaOcupado(reservas, canchaId, fecha, hora)` | RN-03 |

Todas devuelven `{ ok: true, ... }` o `{ ok: false, error: "mensaje" }`. Nunca lanzan excepciones por reglas de negocio.

## Decisiones
- **Fechas y horas** se manejan como string `YYYY-MM-DD` + hora entera, y se convierten a `Date` local solo para comparar con `ahora`.
- **`ahora` inyectable** → tests deterministas.
- **IDs** con contador incremental basado en el máximo id existente.

## Estrategia de testing
- Tests automáticos con `node tests/reglas.test.js` (sin librerías, usando `assert`).
- Test manual de UI siguiendo `demo-script.md`.
