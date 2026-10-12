export function parsearFechaLocal(valor) {
	if (!valor) return null;

	const texto = String(valor);
	const soloFecha = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
	const fecha = soloFecha
		? new Date(Number(soloFecha[1]), Number(soloFecha[2]) - 1, Number(soloFecha[3]))
		: new Date(texto);

	return Number.isNaN(fecha.getTime()) ? null : fecha;
}

export function inicioDelDia(fecha) {
	return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}
