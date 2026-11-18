const { JSDOM } = require("jsdom");
const path = require("path");
const assert = require("assert");

(async () => {
  const dom = await JSDOM.fromFile(require("path").join(__dirname, "..", "app", "index.html"), {
    runScripts: "dangerously", resources: "usable", pretendToBeVisual: true
  });
  await new Promise(r => dom.window.addEventListener("load", r));
  const w = dom.window, d = w.document;
  const $ = id => d.getElementById(id);
  const errores = [];
  w.addEventListener("error", e => errores.push(e.message));

  const sumar = n => { const x = new Date(); x.setDate(x.getDate() + n); return w.CanchaYa.formatoFecha(x); };
  const set = (id, v, ev = "change") => { $(id).value = v; $(id).dispatchEvent(new w.Event(ev, { bubbles: true })); };
  const log = (ok, msg) => console.log((ok ? "  ✔ " : "  ✘ ") + msg);

  // grilla inicial
  assert.ok($("grilla").querySelectorAll("tr").length >= 14, "grilla renderizada");
  log(true, "La grilla se renderiza con 13 horarios x 3 canchas");

  // 1) reservar con nombre vacío -> error
  $("btnReservar").click();
  assert.ok($("toast").className.includes("err") && /nombre/i.test($("toast").textContent));
  log(true, "Sin nombre: muestra error (" + $("toast").textContent + ")");

  // 2) reserva válida de socio
  const f = sumar(3);
  set("nombre", "Santino", "input"); set("tipo", "socio"); set("fecha", f); set("cancha", "2"); set("hora", "20");
  $("btnReservar").click();
  assert.ok($("toast").className.includes("ok"), "reserva ok: " + $("toast").textContent);
  log(true, "Reserva válida: " + $("toast").textContent);
  assert.ok($("misReservas").textContent.includes("Cancha 2"));
  log(true, "Aparece en 'Mis reservas'");
  assert.ok($("grilla").textContent.includes("Santino"));
  log(true, "La grilla marca el turno como ocupado");

  // 3) mismo turno otro jugador -> error
  set("nombre", "Lucía", "input");
  $("btnReservar").click();
  assert.ok($("toast").className.includes("err") && /ya está reservado/.test($("toast").textContent));
  log(true, "Turno ocupado: " + $("toast").textContent);

  // 4) mismo jugador, mismo día -> error
  set("nombre", "Santino", "input"); set("cancha", "1"); set("hora", "21");
  $("btnReservar").click();
  assert.ok(/una por día/.test($("toast").textContent));
  log(true, "Un turno por día: " + $("toast").textContent);

  // 5) cancelar
  set("nombre", "Santino", "input");
  $("misReservas").querySelector(".btn-cancel").click();
  assert.ok(/cancelada/i.test($("toast").textContent) && $("toast").className.includes("ok"));
  assert.ok($("misReservas").textContent.includes("Cancelada"));
  log(true, "Cancelación con anticipación: " + $("toast").textContent);

  // 6) fuera de horario no es posible desde la UI, pero la lógica lo cubre; el turno quedó libre
  assert.ok(!$("grilla").textContent.includes("Santino"));
  log(true, "El turno cancelado queda libre en la grilla");

  assert.strictEqual(errores.length, 0, "errores JS: " + errores.join("; "));
  log(true, "Sin errores de JavaScript en consola");
  console.log("\nUI smoke test OK");
  process.exit(0);
})().catch(e => { console.error("  ✘ FALLÓ:", e.message); process.exit(1); });
