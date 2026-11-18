# Constitution — CanchaYa

Principios no negociables del proyecto. Toda spec, plan y línea de código se subordina a esto.

## 1. Identidad
- **Nombre:** CanchaYa
- **Logo:** `logo.svg` (pelota dentro de un pin de ubicación, verde cancha + amarillo).
- **Propósito:** reservar canchas de fútbol 5 por hora, aplicando reglas de negocio reales (horarios, solapamientos, precios, cancelaciones).

## 2. Principios de desarrollo
1. **Spec primero.** No se escribe código que no esté descrito en `spec.md`. Si el comportamiento cambia, primero se cambia la spec.
2. **Reglas de negocio aisladas.** Toda la lógica vive en `app/reglas.js`, sin depender del DOM. La UI solo la invoca.
3. **Testeable.** Cada regla de negocio (RN-xx) tiene al menos un test automático en `tests/reglas.test.js`.
4. **Simple.** Sin backend, sin dependencias externas. Persistencia en `localStorage`.
5. **Trazabilidad.** Cada test referencia la regla que valida (RN-xx) y cada tarea de `tasks.md` referencia su spec.

## 3. Stack
- HTML + CSS + JavaScript vanilla.
- Node.js (solo para correr tests, sin librerías).
- Git para versionado.

## 4. Calidad
- Mensajes de error claros, en español rioplatense.
- Ninguna reserva inválida puede guardarse nunca (la validación está en la lógica, no solo en la UI).
- Los tests deben pasar al 100% antes de cada commit.

## 5. Uso de IA
La IA genera código **a partir de la spec**. El humano revisa la spec, valida los tests y decide qué entra al repo.
