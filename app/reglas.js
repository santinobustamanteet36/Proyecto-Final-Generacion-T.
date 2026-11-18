/* CanchaYa — Lógica de negocio (ver spec.md, RN-01…RN-15)
 * Funciona en navegador (window.CanchaYa) y en Node (module.exports).
 */
(function (root) {
  "use strict";

  var CONFIG = {
    HORA_APERTURA: 10,      // RN-01
    HORA_ULTIMO_TURNO: 22,  // RN-01 (el último turno empieza 22:00 y termina 23:00)
    DIAS_ANTICIPACION: 30,  // RN-05
    HORA_INICIO_PICO: 18,   // RN-06
    TARIFA_VALLE: 12000,    // RN-06
    TARIFA_PICO: 18000,     // RN-06
    RECARGO_FINDE: 0.15,    // RN-07
    DESC_SOCIO: 0.20,       // RN-08
    MAX_ACTIVAS: { regular: 3, socio: 5 }, // RN-10
    HORAS_MIN_CANCELAR: 12, // RN-13
    CANCHAS: [
      { id: 1, nombre: "Cancha 1" },
      { id: 2, nombre: "Cancha 2" },
      { id: 3, nombre: "Cancha 3" }
    ]
  };

  // ---------- utilidades de fecha ----------
  function parseFecha(fecha) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha || "");
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getFullYear() !== +m[1] || d.getMonth() !== +m[2] - 1 || d.getDate() !== +m[3]) return null;
    return d;
  }

  function inicioTurno(fecha, hora) {
    var d = parseFecha(fecha);
    if (!d) return null;
    d.setHours(hora, 0, 0, 0);
    return d;
  }

  function esFinDeSemana(fecha) {
    var d = parseFecha(fecha);
    return !!d && (d.getDay() === 0 || d.getDay() === 6);
  }

  function formatoFecha(d) {
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  function error(msg) { return { ok: false, error: msg }; }

  // ---------- RN-06, 07, 08, 09 ----------
  function calcularPrecio(fecha, hora, tipo) {
    var precio = hora >= CONFIG.HORA_INICIO_PICO ? CONFIG.TARIFA_PICO : CONFIG.TARIFA_VALLE;
    if (esFinDeSemana(fecha)) precio = precio * (1 + CONFIG.RECARGO_FINDE);
    if (tipo === "socio") precio = precio * (1 - CONFIG.DESC_SOCIO);
    return Math.round(precio);
  }

  // ---------- RN-03 ----------
  function estaOcupado(reservas, canchaId, fecha, hora) {
    return reservas.some(function (r) {
      return r.estado === "activa" && r.canchaId === canchaId && r.fecha === fecha && r.hora === hora;
    });
  }

  // ---------- validación de reserva ----------
  function validarReserva(reservas, datos, ahora) {
    ahora = ahora || new Date();
    var nombre = (datos.jugador || "").trim();
    var tipo = datos.tipoJugador === "socio" ? "socio" : "regular";

    // RN-12
    if (nombre.length < 2) return error("Ingresá tu nombre (mínimo 2 caracteres).");

    var cancha = CONFIG.CANCHAS.filter(function (c) { return c.id === datos.canchaId; })[0];
    if (!cancha) return error("La cancha elegida no existe.");

    var inicio = inicioTurno(datos.fecha, datos.hora);
    if (!inicio || typeof datos.hora !== "number" || datos.hora % 1 !== 0) {
      return error("Fecha u hora inválida.");
    }

    // RN-01 / RN-02
    if (datos.hora < CONFIG.HORA_APERTURA || datos.hora > CONFIG.HORA_ULTIMO_TURNO) {
      return error("Fuera del horario de atención (10:00 a 23:00).");
    }

    // RN-04
    if (inicio.getTime() <= ahora.getTime()) {
      return error("No se puede reservar un turno que ya pasó.");
    }

    // RN-05
    var limite = new Date(ahora.getTime());
    limite.setDate(limite.getDate() + CONFIG.DIAS_ANTICIPACION);
    if (inicio.getTime() > limite.getTime()) {
      return error("Solo se puede reservar hasta " + CONFIG.DIAS_ANTICIPACION + " días hacia adelante.");
    }

    // RN-03
    if (estaOcupado(reservas, datos.canchaId, datos.fecha, datos.hora)) {
      return error("El turno ya está reservado.");
    }

    var delJugador = reservas.filter(function (r) {
      return r.estado === "activa" && r.jugador.trim().toLowerCase() === nombre.toLowerCase();
    });

    // RN-11
    if (delJugador.some(function (r) { return r.fecha === datos.fecha; })) {
      return error("Ya tenés una reserva ese día (máximo una por día).");
    }

    // RN-10 (solo reservas futuras activas)
    var futuras = delJugador.filter(function (r) {
      return inicioTurno(r.fecha, r.hora).getTime() > ahora.getTime();
    });
    var max = CONFIG.MAX_ACTIVAS[tipo];
    if (futuras.length >= max) {
      return error("Alcanzaste el máximo de " + max + " reservas activas (" + (tipo === "socio" ? "socios" : "jugadores regulares") + ").");
    }

    return { ok: true };
  }

  function siguienteId(reservas) {
    return reservas.reduce(function (max, r) { return Math.max(max, r.id); }, 0) + 1;
  }

  function crearReserva(reservas, datos, ahora) {
    ahora = ahora || new Date();
    var v = validarReserva(reservas, datos, ahora);
    if (!v.ok) return v;
    var tipo = datos.tipoJugador === "socio" ? "socio" : "regular";
    var reserva = {
      id: siguienteId(reservas),
      canchaId: datos.canchaId,
      jugador: datos.jugador.trim(),
      tipoJugador: tipo,
      fecha: datos.fecha,
      hora: datos.hora,
      precio: calcularPrecio(datos.fecha, datos.hora, tipo),
      estado: "activa",
      creadaEn: ahora.toISOString()
    };
    return { ok: true, reserva: reserva, reservas: reservas.concat([reserva]) };
  }

  // ---------- cancelación RN-13, 14, 15 ----------
  function puedeCancelar(reserva, ahora) {
    ahora = ahora || new Date();
    if (!reserva) return error("La reserva no existe.");
    if (reserva.estado === "cancelada") return error("La reserva ya está cancelada.");
    var inicio = inicioTurno(reserva.fecha, reserva.hora);
    var horas = (inicio.getTime() - ahora.getTime()) / 3600000;
    if (horas < CONFIG.HORAS_MIN_CANCELAR) {
      return error("Solo se puede cancelar hasta " + CONFIG.HORAS_MIN_CANCELAR + " horas antes del turno.");
    }
    return { ok: true };
  }

  function cancelarReserva(reservas, id, ahora) {
    var reserva = reservas.filter(function (r) { return r.id === id; })[0];
    var p = puedeCancelar(reserva, ahora);
    if (!p.ok) return p;
    var nuevas = reservas.map(function (r) {
      return r.id === id ? Object.assign({}, r, { estado: "cancelada" }) : r;
    });
    return { ok: true, reservas: nuevas };
  }

  var API = {
    CONFIG: CONFIG,
    calcularPrecio: calcularPrecio,
    estaOcupado: estaOcupado,
    validarReserva: validarReserva,
    crearReserva: crearReserva,
    puedeCancelar: puedeCancelar,
    cancelarReserva: cancelarReserva,
    esFinDeSemana: esFinDeSemana,
    formatoFecha: formatoFecha,
    inicioTurno: inicioTurno
  };

  if (typeof module !== "undefined" && module.exports) module.exports = API;
  else root.CanchaYa = API;
})(typeof window !== "undefined" ? window : this);
