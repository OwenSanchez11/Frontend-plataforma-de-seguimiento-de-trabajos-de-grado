// src/lib/sesion.svelte.js
const CLAVE = 'sesion_simulada_v2'; // clave nueva, para no leer lo que guardó la versión anterior

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

