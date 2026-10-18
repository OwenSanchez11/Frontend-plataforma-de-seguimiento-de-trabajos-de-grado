<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { getAvances, getTrabajoPorDocente } from '$lib/api';
	import { sesion } from '$lib/sesion.svelte.js';

	let trabajo = $state(null);
	let equipo = $state([]);
	let avances = $state([]);
	let cargando = $state(true);
	let error = $state('');
	let errorAvances = $state('');

	const nombreCompleto = (p) => `${p.nombre ?? ''} ${p.apellido ?? ''}`.trim() || 'Integrante';
	const iniciales = (p) => ((p.nombre?.[0] ?? '') + (p.apellido?.[0] ?? '')).toUpperCase();
	const listaDe = (valor) => Array.isArray(valor)
		? valor
		: Array.isArray(valor?.data)
			? valor.data
			: Array.isArray(valor?.items)
				? valor.items
				: [];

	onMount(async () => {
		try {
			const usuario = sesion.usuario;
			if (!usuario || usuario.rol !== 'docente') {
				throw new Error('El expediente solo está disponible para docentes.');
			}

			const [resTrabajos, resAvances] = await Promise.allSettled([
				getTrabajoPorDocente(usuario.id_user),
				getAvances({ idTrabajo: page.params.id })
			]);
			if (resTrabajos.status === 'rejected') throw resTrabajos.reason;

			const trabajos = listaDe(resTrabajos.value);
			trabajo = trabajos.find((t) => Number(t.id_trabajo_grado ?? t.id) === Number(page.params.id)) ?? null;
			if (!trabajo) {
				throw new Error('No se encontró el trabajo entre los expedientes asignados a este docente.');
			}
			equipo = Array.isArray(trabajo.equipo)
				? trabajo.equipo
				: Array.isArray(trabajo.integrantes)
					? trabajo.integrantes
					: [];

			if (resAvances.status === 'fulfilled') avances = listaDe(resAvances.value);
			else errorAvances = resAvances.reason?.message ?? 'No se pudieron cargar los avances.';
		} catch (e) {
			error = e.message || 'No se pudo cargar el expediente.';
		} finally {
			cargando = false;
		}
	});
</script>

<div class="container-fluid p-0">
	<a href="/evaluaciones" class="btn btn-sm btn-light border rounded-3 mb-3 extra-small">
		<i class="bi bi-arrow-left me-1"></i> Volver a Evaluaciones
	</a>

	{#if cargando}
		<p class="text-muted small">Cargando expediente...</p>
	{:else if error}
		<div class="alert alert-warning small">{error}</div>
	{:else if trabajo}
		<div class="mb-4">
			<span class="extra-small text-muted fw-bold text-uppercase">Expediente del Trabajo de Grado</span>
			<h1 class="h4 fw-bold text-dark mb-1">{trabajo.titulo ?? `Trabajo #${page.params.id}`}</h1>
			<span class="extra-small text-muted">{trabajo.carrera ?? trabajo.nombre_carrera ?? 'Carrera sin registrar'}</span>
		</div>

		<div class="row g-4">
			<div class="col-12 col-xl-7">
				<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 h-100">
					<h2 class="h6 fw-bold text-dark mb-3">Informacion del trabajo</h2>
					<div class="row g-3">
						<div class="col-12">
							<small class="text-muted d-block">Resumen</small>
							<span>{trabajo.resumen || trabajo.descripcion || 'Sin resumen registrado'}</span>
						</div>
						<div class="col-12 col-md-6"><small class="text-muted d-block">Estado del tramite</small><strong>{trabajo.estado_tramite ?? 'Sin estado'}</strong></div>
						<div class="col-12 col-md-6"><small class="text-muted d-block">Linea de investigacion</small><strong>{trabajo.linea_investigacion || '-'}</strong></div>
						<div class="col-12 col-md-6"><small class="text-muted d-block">Fecha de inicio</small><strong>{trabajo.fecha_inicio || 'No registrada'}</strong></div>
						<div class="col-12 col-md-6"><small class="text-muted d-block">Fecha de finalizacion</small><strong>{trabajo.fecha_fin || 'No registrada'}</strong></div>
						<div class="col-12 col-md-6"><small class="text-muted d-block">Fecha de sustentacion</small><strong>{trabajo.fecha_sustentacion || 'No registrada'}</strong></div>
						<div class="col-12"><small class="text-muted d-block">Observaciones finales</small><span>{trabajo.observaciones_finales || 'Sin observaciones'}</span></div>
					</div>
				</div>
			</div>

			<div class="col-12 col-xl-5">
				<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 h-100">
					<h2 class="h6 fw-bold text-dark mb-3">Equipo de trabajo asignado</h2>
					<div class="d-flex flex-column gap-3">
						{#each equipo as persona (persona.id_user ?? persona.id_usuario ?? persona.id)}
							<div class="d-flex align-items-center gap-3">
								<div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 40px; height: 40px;">{iniciales(persona)}</div>
								<div class="lh-sm min-w-0 flex-grow-1">
									<strong class="text-dark small d-block text-truncate">{nombreCompleto(persona)}</strong>
									<span class="extra-small text-muted d-block text-truncate">{persona.correo ?? ''}</span>
								</div>
								<span class="badge bg-light text-dark border extra-small">{persona.rol_proyecto ?? 'Sin rol'}</span>
							</div>
						{:else}
							<span class="text-muted small">Aun no hay equipo asignado.</span>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<div class="card border-0 shadow-sm rounded-4 mt-4">
			<div class="card-body p-0">
				<div class="px-3 pt-3">
					<h2 class="h6 fw-bold mb-0">Avances y documentos</h2>
					<small class="text-muted">{avances.length} avance(s) registrado(s)</small>
				</div>
				{#if errorAvances}<div class="alert alert-warning m-3 mb-0">{errorAvances}</div>{/if}
				<div class="table-responsive mt-3">
					<table class="table table-hover align-middle mb-0">
						<thead class="table-light"><tr><th class="px-3">Avance</th><th>Estado</th><th>Entrega / limite</th><th>Archivo</th><th>Dictamen</th></tr></thead>
						<tbody>
							{#each avances as avance (avance.id_avance)}
								<tr>
									<td class="px-3"><strong>{avance.titulo}</strong><div class="small text-muted">v{avance.numero_version} · {avance.descripcion || 'Sin descripcion'}</div></td>
									<td>{avance.estado || '-'}</td>
									<td class="small">Entrega: {avance.fecha_entrega || '-'}<br />Limite: {avance.fecha_limite || '-'}</td>
									<td>{#if avance.ruta_archivo}<a href={avance.ruta_archivo} target="_blank" rel="noopener noreferrer">{avance.nombre_archivo || 'Abrir archivo'}</a>{:else}Sin archivo{/if}</td>
									<td>{avance.dictamen || 'Sin dictamen'}</td>
								</tr>
							{:else}
								<tr><td colspan="5" class="text-center text-muted py-4">Este trabajo aun no tiene avances registrados.</td></tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.extra-small { font-size: 0.72rem; }
</style>
