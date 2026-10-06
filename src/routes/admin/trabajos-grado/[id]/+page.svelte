<script>

    import { onMount } from "svelte";
    import {getCarreras, getTrabajoPorId, getAvances} from '$lib/api';

	//recibe y gaurda los datos que se le envían al componente, en este caso, recibe lo que le da mi archivo +page.js que es la función que obtiene el numero que es el id del trabajo
	//y usa ese data.id para luego pedirle al backend el trabajo y los avances respectivos
    let { data } = $props();

    let trabajo = $state(null);
	let avances  =$state([]);
	let carreras = $state([]);
    let cargando = $state(true);
    let error = $state('');

	let nombreCarrera = $derived(
		carreras.find((c) => Number(c.id_carrera) === Number(trabajo?.id_carrera))
			?.nombre_carrera ?? 'Carrera no encontrada'
	);

	//revisa el estado del trabajo que recibe de la DB y devuelve un color del badge
	function claseEstado(t) {
		if (!t.estado) return 'text-bg-secondary';
		if (t.estado_tramite === 'Finalizado') return 'text-bg-success';
		if (t.estado_tramite === 'Cancelado') return 'text-bg-danger';
		return 'text-bg-primary';
	}

	function formatearTamano(bytes) {
		if (!bytes) return '—';
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}

    onMount(async () => {
        const [resTrabajo, resCarreras, resAvances] = await Promise.allSettled([
			getTrabajoPorId(data.id),
			getCarreras(),
			getAvances({ idTrabajo: data.id })
		]);

		if (resTrabajo.status === 'fulfilled') {
			trabajo = resTrabajo.value;
		} else {
			console.error(resTrabajo.reason);
			error = 'No se pudo cargar el trabajo de grado.';
		}

		if (resCarreras.status === 'fulfilled') {
			carreras = resCarreras.value;
		} else {
			console.error(resCarreras.reason);
		}

		if (resAvances.status === 'fulfilled') {
			avances = resAvances.value;
		} else {
			console.error(resAvances.reason);
		}

		cargando = false;


    })



</script>

<div class="container-fluid py-2">

	<a href="/admin/trabajos-grado" class="text-decoration-none small">
		<i class="bi bi-arrow-left"></i> Volver a trabajos de grado
	</a>

	<h2 class="fw-bold text-dark mt-2 mb-4">Detalle del trabajo de grado #{data.id}</h2>

	{#if cargando}
		<p class="text-muted">Cargando...</p>
	{:else if error}
		<div class="alert alert-danger">{error}</div>
	{:else if trabajo}
		<div class="card border-0 shadow-sm mb-4">
			<div class="card-body">

				<div class="d-flex justify-content-between align-items-start gap-3 mb-3">
					<div>
						<h4 class="fw-bold mb-1">{trabajo.titulo}</h4>
						<span class="text-muted">{nombreCarrera}</span>
					</div>

					<span class="badge rounded-pill {claseEstado(trabajo)}">
						{trabajo.estado ? trabajo.estado_tramite : 'Inactivo'}
					</span>
				</div>

				<div class="row g-3">
					<div class="col-12">
						<small class="text-muted d-block">Resumen</small>
						<span>{trabajo.resumen || 'Sin resumen registrado'}</span>
					</div>

					<div class="col-12 col-md-6">
						<small class="text-muted d-block">Línea de investigación</small>
						<strong>{trabajo.linea_investigacion || '—'}</strong>
					</div>

					<div class="col-12 col-md-6">
						<small class="text-muted d-block">Fecha de inicio</small>
						<strong>{trabajo.fecha_inicio || 'No registrada'}</strong>
					</div>

					<div class="col-12 col-md-6">
						<small class="text-muted d-block">Fecha de finalización</small>
						<strong>{trabajo.fecha_fin || 'No registrada'}</strong>
					</div>

					<div class="col-12 col-md-6">
						<small class="text-muted d-block">Fecha de sustentación</small>
						<strong>{trabajo.fecha_sustentacion || 'No registrada'}</strong>
					</div>

					<div class="col-12">
						<small class="text-muted d-block">Observaciones finales</small>
						<span>{trabajo.observaciones_finales || 'Sin observaciones'}</span>
					</div>
				</div>

			</div>
		</div>

		<div class="card border-0 shadow-sm">
			<div class="card-body p-0">

				<div class="px-3 pt-3">
					<h5 class="fw-bold mb-0">Avances y documentos</h5>
					<small class="text-muted">{avances.length} avance(s) registrado(s)</small>
				</div>

				<div class="table-responsive mt-3">
					<table class="table table-hover align-middle mb-0">
						<thead class="table-light">
							<tr>
								<th class="px-3">Versión</th>
								<th>Avance</th>
								<th>Estado</th>
								<th>Fechas</th>
								<th>Archivo</th>
								<th>Dictamen</th>
							</tr>
						</thead>

						<tbody>
							{#each avances as av (av.id_avance)}
								<tr>
									<td class="px-3 fw-semibold">v{av.numero_version}</td>

									<td>
										<div class="fw-semibold">{av.titulo}</div>
										<small class="text-muted">{av.descripcion || 'Sin descripción'}</small>
									</td>

									<td>{av.estado}</td>

									<td class="small">
										<div>Entrega: {av.fecha_entrega || '—'}</div>
										<div class="text-muted">Límite: {av.fecha_limite || '—'}</div>
									</td>

									<td>
										{#if av.nombre_archivo}
											<div class="fw-semibold small">{av.nombre_archivo}</div>
											<small class="text-muted">{formatearTamano(av.tamano_bytes)}</small>
										{:else}
											<span class="text-muted small">Sin archivo</span>
										{/if}
									</td>

									<td class="small">{av.dictamen || 'Sin dictamen'}</td>
								</tr>
							{:else}
								<tr>
									<td colspan="6" class="text-center text-muted py-4">
										Este trabajo aún no tiene avances registrados.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

			</div>
		</div>
	{/if}


</div>
