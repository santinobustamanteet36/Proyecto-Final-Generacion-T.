/* Tests de las reglas de negocio de CanchaYa. Correr con: node tests/reglas.test.js */
const assert = require("assert");
const R = require("../app/reglas.js");

// "Ahora" fijo: miércoles 18/11/2026 12:00 (hora local)
const AHORA = new Date(2026, 10, 18, 12, 0, 0, 0);
const MIE = "2026-11-25"; // miércoles
const SAB = "2026-11-21"; // sábado
const DOM = "2026-11-22"; // domingo

let pasaron = 0, fallaron = 0;
function test(nombre, fn) {
  try { fn(); pasaron++; console.log("  ✔ " + nombre); }
  catch (e) { fallaron++; console.log("  ✘ " + nombre + "\n      " + e.message); }
}
function grupo(titulo) { console.log("\n" + titulo); }

const datos = (o) => Object.assign({ canchaId: 1, jugador: "Santino", tipoJugador: "regular", fecha: MIE, hora: 20 }, o);
const reservar = (reservas, o, ahora) => R.crearReserva(reservas, datos(o), ahora || AHORA);

grupo("Precios (RN-06, RN-07, RN-08, RN-09)");
test("RN-06 valle entre semana, regular = $12.000", () => assert.strictEqual(R.calcularPrecio(MIE, 11, "regular"), 12000));
test("RN-06 pico entre semana, regular = $18.000", () => assert.strictEqual(R.calcularPrecio(MIE, 20, "regular"), 18000));
test("RN-06 el límite 18:00 ya es pico", () => assert.strictEqual(R.calcularPrecio(MIE, 18, "regular"), 18000));
test("RN-06 17:00 todavía es valle", () => assert.strictEqual(R.calcularPrecio(MIE, 17, "regular"), 12000));
test("RN-07 sábado valle regular = $13.800", () => assert.strictEqual(R.calcularPrecio(SAB, 11, "regular"), 13800));
test("RN-07 domingo pico regular = $20.700", () => assert.strictEqual(R.calcularPrecio(DOM, 18, "regular"), 20700));
test("RN-08 socio entre semana pico = $14.400", () => assert.strictEqual(R.calcularPrecio(MIE, 20, "socio"), 14400));
test("RN-08 socio sábado 20:00 = $16.560 (criterio de aceptación)", () => assert.strictEqual(R.calcularPrecio(SAB, 20, "socio"), 16560));
test("RN-09 el precio siempre es entero", () => {
  [10, 14, 18, 22].forEach(h => [MIE, SAB, DOM].forEach(f => ["regular", "socio"].forEach(t => {
    assert.ok(Number.isInteger(R.calcularPrecio(f, h, t)));
  })));
});

grupo("Horarios y fechas (RN-01, RN-02, RN-04, RN-05)");
test("RN-01 09:00 se rechaza", () => assert.strictEqual(reservar([], { hora: 9 }).ok, false));
test("RN-01 23:00 se rechaza (el último turno es 22:00)", () => assert.strictEqual(reservar([], { hora: 23 }).ok, false));
test("RN-01 10:00 se acepta", () => assert.strictEqual(reservar([], { hora: 10 }).ok, true));
test("RN-01 22:00 se acepta", () => assert.strictEqual(reservar([], { hora: 22 }).ok, true));
test("RN-01 mensaje de error de horario", () => assert.match(reservar([], { hora: 9 }).error, /horario de atención/));
test("RN-02 hora no entera se rechaza", () => assert.strictEqual(reservar([], { hora: 12.5 }).ok, false));
test("RN-04 turno de hoy que ya pasó (11:00) se rechaza", () => assert.strictEqual(reservar([], { fecha: "2026-11-18", hora: 11 }).ok, false));
test("RN-04 turno de hoy a las 12:00 (justo ahora) se rechaza", () => assert.strictEqual(reservar([], { fecha: "2026-11-18", hora: 12 }).ok, false));
test("RN-04 turno de hoy a las 13:00 se acepta", () => assert.strictEqual(reservar([], { fecha: "2026-11-18", hora: 13 }).ok, true));
test("RN-04 fecha de ayer se rechaza", () => assert.strictEqual(reservar([], { fecha: "2026-11-17" }).ok, false));
test("RN-05 a 30 días exactos se acepta", () => assert.strictEqual(reservar([], { fecha: "2026-12-18", hora: 12 }).ok, true));
test("RN-05 a 31 días se rechaza", () => assert.strictEqual(reservar([], { fecha: "2026-12-19", hora: 12 }).ok, false));
test("Fecha con formato inválido se rechaza", () => assert.strictEqual(reservar([], { fecha: "25/11/2026" }).ok, false));
test("Fecha inexistente (31/02) se rechaza", () => assert.strictEqual(reservar([], { fecha: "2026-02-31" }).ok, false));
test("Cancha inexistente se rechaza", () => assert.strictEqual(reservar([], { canchaId: 99 }).ok, false));

grupo("Solapamiento (RN-03)");
test("RN-03 mismo turno y cancha se rechaza", () => {
  const r1 = reservar([], {});
  const r2 = reservar(r1.reservas, { jugador: "Otro" });
  assert.strictEqual(r2.ok, false);
  assert.strictEqual(r2.error, "El turno ya está reservado.");
});
test("RN-03 misma hora en otra cancha se acepta", () => {
  const r1 = reservar([], {});
  assert.strictEqual(reservar(r1.reservas, { jugador: "Otro", canchaId: 2 }).ok, true);
});
test("RN-03 misma cancha en otra hora se acepta", () => {
  const r1 = reservar([], {});
  assert.strictEqual(reservar(r1.reservas, { jugador: "Otro", hora: 21 }).ok, true);
});
test("RN-03 una reserva cancelada libera el turno", () => {
  const r1 = reservar([], {});
  const c = R.cancelarReserva(r1.reservas, r1.reserva.id, AHORA);
  assert.strictEqual(c.ok, true);
  assert.strictEqual(reservar(c.reservas, { jugador: "Otro" }).ok, true);
});

grupo("Límites del jugador (RN-10, RN-11, RN-12)");
test("RN-12 nombre vacío se rechaza", () => assert.strictEqual(reservar([], { jugador: "" }).ok, false));
test("RN-12 nombre de solo espacios se rechaza", () => assert.strictEqual(reservar([], { jugador: "   " }).ok, false));
test("RN-12 nombre de 1 letra se rechaza", () => assert.strictEqual(reservar([], { jugador: "A" }).ok, false));
test("RN-11 dos reservas el mismo día se rechazan (aunque sea otra cancha)", () => {
  const r1 = reservar([], {});
  const r2 = reservar(r1.reservas, { canchaId: 2, hora: 21 });
  assert.strictEqual(r2.ok, false);
  assert.match(r2.error, /una por día/);
});
test("RN-11 la comparación de nombre no distingue mayúsculas", () => {
  const r1 = reservar([], { jugador: "santino" });
  assert.strictEqual(reservar(r1.reservas, { jugador: "SANTINO", canchaId: 2 }).ok, false);
});
test("RN-11 si cancelás, podés reservar de nuevo ese día", () => {
  const r1 = reservar([], {});
  const c = R.cancelarReserva(r1.reservas, r1.reserva.id, AHORA);
  assert.strictEqual(reservar(c.reservas, { hora: 21 }).ok, true);
});
function llenar(tipo, cantidad) {
  let reservas = [];
  for (let i = 0; i < cantidad; i++) {
    const f = "2026-11-" + String(23 + i).padStart(2, "0");
    const r = reservar(reservas, { fecha: f, tipoJugador: tipo });
    assert.strictEqual(r.ok, true, "falló la reserva #" + (i + 1));
    reservas = r.reservas;
  }
  return reservas;
}
test("RN-10 regular: la 3ª reserva entra y la 4ª se rechaza", () => {
  const reservas = llenar("regular", 3);
  const r4 = reservar(reservas, { fecha: "2026-11-27", tipoJugador: "regular" });
  assert.strictEqual(r4.ok, false);
  assert.match(r4.error, /máximo de 3/);
});
test("RN-10 socio: la 5ª reserva entra y la 6ª se rechaza", () => {
  const reservas = llenar("socio", 5);
  const r6 = reservar(reservas, { fecha: "2026-11-28", tipoJugador: "socio" });
  assert.strictEqual(r6.ok, false);
  assert.match(r6.error, /máximo de 5/);
});
test("RN-10 el límite es por jugador, no global", () => {
  const reservas = llenar("regular", 3);
  assert.strictEqual(reservar(reservas, { jugador: "Otro", fecha: "2026-11-27" }).ok, true);
});

grupo("Cancelación (RN-13, RN-14, RN-15)");
test("RN-13 con más de 12 hs de anticipación se puede cancelar", () => {
  const r1 = reservar([], {});
  assert.strictEqual(R.puedeCancelar(r1.reserva, AHORA).ok, true);
});
test("RN-13 con exactamente 12 hs se puede cancelar", () => {
  const r1 = reservar([], { fecha: "2026-11-19", hora: 12 }); // 24 hs
  const ahora = new Date(2026, 10, 19, 0, 0, 0); // faltan 12 hs
  assert.strictEqual(R.puedeCancelar(r1.reserva, ahora).ok, true);
});
test("RN-14 con 5 hs de anticipación NO se puede cancelar", () => {
  const r1 = reservar([], { fecha: "2026-11-19", hora: 20 });
  const ahora = new Date(2026, 10, 19, 15, 0, 0);
  const p = R.puedeCancelar(r1.reserva, ahora);
  assert.strictEqual(p.ok, false);
  assert.match(p.error, /12 horas/);
});
test("RN-14 con 11 h 59 min NO se puede cancelar", () => {
  const r1 = reservar([], { fecha: "2026-11-19", hora: 20 });
  const ahora = new Date(2026, 10, 19, 8, 1, 0);
  assert.strictEqual(R.puedeCancelar(r1.reserva, ahora).ok, false);
});
test("RN-14 cancelarReserva tardía deja la reserva activa", () => {
  const r1 = reservar([], { fecha: "2026-11-19", hora: 20 });
  const ahora = new Date(2026, 10, 19, 15, 0, 0);
  const c = R.cancelarReserva(r1.reservas, r1.reserva.id, ahora);
  assert.strictEqual(c.ok, false);
  assert.strictEqual(r1.reservas[0].estado, "activa");
});
test("RN-15 no se puede cancelar dos veces", () => {
  const r1 = reservar([], {});
  const c1 = R.cancelarReserva(r1.reservas, r1.reserva.id, AHORA);
  const c2 = R.cancelarReserva(c1.reservas, r1.reserva.id, AHORA);
  assert.strictEqual(c2.ok, false);
  assert.match(c2.error, /ya está cancelada/);
});
test("Cancelar una reserva inexistente da error", () => assert.strictEqual(R.cancelarReserva([], 123, AHORA).ok, false));

grupo("Integridad de datos");
test("La reserva creada guarda precio, estado activa e id", () => {
  const r = reservar([], { fecha: SAB, tipoJugador: "socio" });
  assert.strictEqual(r.reserva.precio, 16560);
  assert.strictEqual(r.reserva.estado, "activa");
  assert.strictEqual(r.reserva.id, 1);
});
test("crearReserva no muta el arreglo original", () => {
  const original = [];
  reservar(original, {});
  assert.strictEqual(original.length, 0);
});
test("Los ids son incrementales", () => {
  const a = reservar([], {});
  const b = reservar(a.reservas, { jugador: "Otro", canchaId: 2 });
  assert.strictEqual(b.reserva.id, 2);
});

console.log("\n" + "=".repeat(40));
console.log("Total: " + (pasaron + fallaron) + " | OK: " + pasaron + " | Fallaron: " + fallaron);
process.exit(fallaron ? 1 : 0);
