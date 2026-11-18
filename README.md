<p align="center"><img src="logo.svg" width="120" alt="Logo CanchaYa"></p>

# CanchaYa ⚽

Reservá tu cancha de fútbol 5 en un toque. Proyecto final del módulo 4, desarrollado con **Spec-Driven Development (SDD)**: primero se escribió la especificación, después el código.

## Qué hace
- Reserva de turnos de 1 hora en 3 canchas, de 10:00 a 23:00.
- Grilla de disponibilidad por fecha, con precio en cada turno.
- Precio dinámico: horario pico, recargo de fin de semana y descuento de socio.
- "Mis reservas" con cancelación.
- Persistencia en el navegador (`localStorage`).

## Reglas de negocio (resumen)
| Tema | Regla |
|---|---|
| Horario | 10:00 a 23:00, turnos de 1 h |
| Disponibilidad | sin solapamientos; no se reserva en el pasado; hasta 30 días de anticipación |
| Precio | valle $12.000 · pico (desde 18:00) $18.000 · finde +15% · socio -20% |
| Límites | máx. 3 reservas activas (5 socios) · 1 por día |
| Cancelación | hasta 12 h antes del turno |

Detalle completo en [`spec.md`](spec.md) (RN-01 a RN-15).

## Cómo usarla
1. Abrí `app/index.html` en el navegador. No necesita instalar nada.

## Cómo testearla
```bash
npm test          # 47 tests de reglas de negocio (solo requiere Node.js)
npm install       # solo para el test de interfaz
npm run test:ui   # flujo completo de la UI con jsdom
```
Resultados en [`test-report.md`](test-report.md).

## Documentación SDD
| Archivo | Contenido |
|---|---|
| [`constitution.md`](constitution.md) | Principios del proyecto |
| [`spec.md`](spec.md) | Especificación y reglas de negocio |
| [`plan.md`](plan.md) | Arquitectura y decisiones técnicas |
| [`tasks.md`](tasks.md) | Tareas trazables a la spec |
| [`test-report.md`](test-report.md) | Reporte de testeo |
| [`demo-script.md`](demo-script.md) | Guion del video demo |

## Estructura
```
canchaya/
├── app/reglas.js      # lógica de negocio
├── app/index.html     # interfaz
├── tests/             # tests automáticos
├── logo.svg
└── *.md
```

## Flujo SDD aplicado
`constitution` → `spec` → `plan` → `tasks` → código → tests → demo
