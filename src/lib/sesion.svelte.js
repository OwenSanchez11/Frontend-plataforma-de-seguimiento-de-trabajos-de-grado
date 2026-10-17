// src/lib/sesion.svelte.js
const CLAVE = 'sesion_v3'; // clave nueva, para no leer lo que guardó la versión anterior

function leerGuardado() {
	try {
		return JSON.parse(localStorage.getItem(CLAVE)) ?? { usuario: null, token: null };
	} catch {
		return { usuario: null, token: null};
	}
}

const guardado = leerGuardado();

export const sesion = $state({ usuario: guardado.usuario, token: guardado.token });

export function iniciarSesion(usuario, token) {
	sesion.usuario = usuario;
	sesion.token = token
	try { localStorage.setItem(CLAVE, JSON.stringify({ usuario, token })); } catch {}
}

export function cerrarSesion() {
	sesion.usuario = null;
	sesion.token = null
	try { localStorage.removeItem(CLAVE); } catch {}
}

export function usuarioActual() {
	return sesion.usuario;
}

export function obtenerToken() {
	return sesion.token
}

