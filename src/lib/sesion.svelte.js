// src/lib/sesion.svelte.js
const CLAVE = 'sesion_simulada_v2'; // clave nueva, para no leer lo que guardó la versión anterior

const PROYECTO_PRUEBA = {
	radicacion: 'TB-2025-084',
	modalidad: 'Tesis de Pregrado',
	estado: 'En Desarrollo Activo',
	titulo: 'Sistema de Seguimiento de trabajos de grados y tesis',
	descripcion: 'Track de tesis',
	avanceGlobal: 65,
	faseActual: 'Fase 3 de 5 completadas',
	hitoCritico: {
		nombre: 'Entrega de Informe de Avance Metodológico y Código v1.0',
		limite: '2026-11-28T23:59:00'
	}
};

function leerGuardado() {
	try {
		return JSON.parse(localStorage.getItem(CLAVE));
	} catch {
		return null;
	}
}

export const sesion = $state({ usuario: leerGuardado() });

export function iniciarSesion(usuario) {
	sesion.usuario = usuario;
	try { localStorage.setItem(CLAVE, JSON.stringify(usuario)); } catch {}
}

export function cerrarSesion() {
	sesion.usuario = null;
	try { localStorage.removeItem(CLAVE); } catch {}
}

export function usuarioActual() {
	return sesion.usuario;
}

// Solo el estudiante tiene proyecto
export function proyectoActual() {
	return sesion.usuario?.rol === 'estudiante' ? PROYECTO_PRUEBA : null;
}