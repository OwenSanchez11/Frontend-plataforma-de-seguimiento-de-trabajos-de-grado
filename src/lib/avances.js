export function diasRestantes(f) {
	if (!f) return null;
	const d = new Date(f);
	if (Number.isNaN(d.getTime())) return null;
	return Math.ceil((d - new Date()) / 86400000);
}

export const esAprobado = (a) => a.dictamen?.toLowerCase() === 'aprobado';

export function textoEstado(a) {
	const d = a.dictamen?.toLowerCase();
	if (d === 'aprobado') return 'Aprobado';
	if (d === 'rechazado') return 'Rechazado';
	if (d === 'en progreso') return 'En progreso';
	if (a.fecha_entrega) return 'Entregado';
	const dias = diasRestantes(a.fecha_limite);
	return dias !== null && dias < 0 ? 'Vencido' : 'Pendiente';
}

export function claseEstado(a) {
	switch (textoEstado(a)) {
		case 'Aprobado':
			return 'bg-success-subtle text-success border-success-subtle';
		case 'Rechazado':
			return 'bg-danger-subtle text-danger border-danger-subtle';
		case 'En progreso':
		case 'Entregado':
			return 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
		case 'Vencido':
			return 'bg-dark text-white';
		default:
			return 'bg-secondary-subtle text-secondary border-secondary-subtle';
	}
}