<script>

	import { onMount } from "svelte";
	import { getTrabajoPorDocente } from "$lib/api";
	import { sesion } from "$lib/sesion.svelte.js";

	let pestanaActiva = $state('calificar');
	let busqueda = $state('');

	let trabajosAsignados = $state([]);
	let trabajoSeleccionado = $state(null);
	let cargando = $state(true);
	let error = $state('');
	let notaFinal = $state('');
	let veredicto = $state('Aprobado');
	let observaciones = $state('');
	let evaluacionEnviada = $state(false);

	function formatearFecha(f) {
		if (!f) return '—';
		return new Date(String(f).slice(0, 10) + 'T00:00:00').toLocaleDateString('es-CO', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	onMount(async () => {
		try {
			const usuario = sesion.usuario;
			if (!usuario || usuario.rol !== 'docente') {
				error = 'Esta página está disponible únicamente para docentes.';
				return;
			}

			const respuesta = await getTrabajoPorDocente(usuario.id_user);
			const datos = Array.isArray(respuesta)
				? respuesta
				: Array.isArray(respuesta?.data)
					? respuesta.data
					: Array.isArray(respuesta?.items)
						? respuesta.items
						: [];
			
			trabajosAsignados = datos.map((t) => {
				const equipo = Array.isArray(t.equipo) ? t.equipo : [];
				const est = equipo.find((e) => e.rol_proyecto?.toLowerCase().includes('estudiante'));
				return {
					id: t.id_trabajo_grado,
					titulo: t.titulo,
					estudiante: est ? `${est.nombre} ${est.apellido}` : 'Sin estudiante asignado',
					carrera: t.carrera ?? '—',
					rolProfesor: t.rol_docente ?? '—',
					estadoTramite: t.evaluado ? 'Evaluado' : 'Pendiente de Calificación',
					ultimoAvance: t.ultimo_avance ?? 'Sin avances',
					fechaEntrega: formatearFecha(t.fecha_ultimo_avance),
					integrantes: equipo.map((e) => `${e.nombre} ${e.apellido} (${e.rol_proyecto ?? 'Sin rol'})`)
				};
			});

			trabajoSeleccionado = trabajosAsignados[0] ?? null;

		} catch (e) {
			error = e.message || 'No fue posible cargar los trabajos asignados.';
		} finally {
			cargando = false
		}
	});

	function guardarEvaluacion(e) {
		e.preventDefault();
		evaluacionEnviada = true;
	}

	let trabajosFiltrados = $derived(
		trabajosAsignados.filter(
			(t) =>
				t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
				t.estudiante.toLowerCase().includes(busqueda.toLowerCase()) ||
				String(t.id).toLowerCase().includes(busqueda.toLowerCase())
		)
	);
</script>

<div class="container-fluid p-0">

	<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
		<div>
			<span class="extra-small text-muted fw-bold text-uppercase">Portal del Docente</span>
			<h1 class="h3 fw-bold text-dark mb-0">Gestión de Evaluaciones y Trabajos Asignados</h1>
		</div>
		<span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 extra-small fw-semibold">
			Rol: Director / Jurado Evaluador
		</span>
	</div>


	<ul class="nav nav-tabs border-bottom mb-4 gap-2">
		<li class="nav-item">
			<button
				class="nav-link extra-small fw-bold px-3 py-2.5 rounded-top-3 border-0 d-flex align-items-center gap-2 {pestanaActiva === 'calificar' ? 'active text-primary border-bottom border-primary border-2 bg-white shadow-2xs' : 'text-secondary hover-bg-light'}"
				onclick={() => (pestanaActiva = 'calificar')}
			>
				<i class="bi bi-patch-check fs-6"></i>
				<span>Calificación & Dictamen</span>
			</button>
		</li>
		<li class="nav-item">
			<button
				class="nav-link extra-small fw-bold px-3 py-2.5 rounded-top-3 border-0 d-flex align-items-center gap-2 {pestanaActiva === 'directorio' ? 'active text-primary border-bottom border-primary border-2 bg-white shadow-2xs' : 'text-secondary hover-bg-light'}"
				onclick={() => (pestanaActiva = 'directorio')}
			>
				<i class="bi bi-journal-bookmark fs-6"></i>
				<span>Directorio de Trabajos Asignados</span>
			</button>
		</li>
	</ul>

	{#if cargando}
	<p class="text-muted small">Cargando trabajos asignados...</p>
	{:else if error}
		<div class="alert alert-danger small">{error}</div>
	{:else if trabajosAsignados.length === 0}
		<div class="alert alert-info small">No tienes trabajos de grado asignados.</div>
	{:else}

		<!-- PESTAÑA 1 FORMULARIO DE CALIFICACIÓN -->
		{#if pestanaActiva === 'calificar'}
			<div class="row g-4">

				<div class="col-12 col-xl-5">
					<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
						<h2 class="h6 fw-bold text-dark mb-3">Entregas Pendientes por Calificar</h2>

						<div class="d-flex flex-column gap-3">
							{#each trabajosAsignados as trabajo}
								<button
									type="button"
								class="card border p-3 rounded-3 text-start transition-all btn-hover {trabajoSeleccionado?.id === trabajo.id ? 'border-primary bg-primary-subtle shadow-2xs' : 'bg-white'}"
									onclick={() => {
										trabajoSeleccionado = trabajo;
										evaluacionEnviada = false;
									}}
								>
									<div class="d-flex align-items-center justify-content-between mb-2 w-100">
										<span class="badge bg-light text-dark border extra-small">{trabajo.id}</span>
										<span class="badge bg-white text-secondary border extra-small">{trabajo.rolProfesor}</span>
									</div>
									<strong class="text-dark small d-block mb-1 text-break">{trabajo.titulo}</strong>
									<span class="extra-small text-muted d-block mb-2">Estudiante: <strong>{trabajo.estudiante}</strong></span>
									<div class="d-flex align-items-center justify-content-between w-100 border-top pt-2 mt-1">
										<span class="extra-small text-muted">Entrega: {trabajo.fechaEntrega}</span>
										<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle extra-small">
											{trabajo.estadoTramite}
										</span>
									</div>
								</button>
							{/each}
						</div>
					</div>
				</div>

				<div class="col-12 col-xl-7">
					<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
						<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3 border-bottom pb-3">
							<div class="min-w-0">
								<span class="extra-small text-muted fw-bold text-uppercase d-block">Evaluación en curso</span>
								<h3 class="h6 fw-bold text-dark mb-0 text-truncate">{trabajoSeleccionado.estudiante}</h3>
							</div>
							<a
								href="#"
								class="btn btn-sm btn-outline-primary rounded-3 extra-small fw-medium d-flex align-items-center justify-content-center gap-1 w-100 w-sm-auto text-truncate"
							>
								<i class="bi bi-file-earmark-arrow-down flex-shrink-0"></i>
								<span class="text-truncate">Ver Avance: {trabajoSeleccionado.ultimoAvance}</span>
							</a>
						</div>

						{#if evaluacionEnviada}
							<div class="alert alert-success border-0 shadow-sm rounded-3 p-3 mb-0">
								<div class="d-flex align-items-center gap-2 mb-1">
									<i class="bi bi-check-circle-fill fs-5 text-success"></i>
									<strong class="text-dark small">¡Evaluación Final registrada exitosamente!</strong>
								</div>
								<p class="extra-small text-secondary mb-0">
									El veredicto y las observaciones registradas fueron asociadas al trabajo {trabajoSeleccionado.id} en el sistema.
								</p>
							</div>
						{:else}
							<form onsubmit={guardarEvaluacion} class="d-flex flex-column gap-3">
								<div class="row g-3">
									<div class="col-12 col-md-6">
										<label for="inputNota" class="form-label extra-small fw-bold text-uppercase text-muted">Nota Cuantitativa (0.0 - 5.0)</label>
										<input
											id="inputNota"
											type="number"
											step="0.1"
											min="0"
											max="5"
											bind:value={notaFinal}
											class="form-control form-control-sm rounded-3"
											placeholder="Ej. 4.5"
											required
										/>
									</div>
									<div class="col-12 col-md-6">
										<label for="selectVeredicto" class="form-label extra-small fw-bold text-uppercase text-muted">Veredicto Final</label>
										<select id="selectVeredicto" bind:value={veredicto} class="form-select form-select-sm rounded-3">
											<option value="Aprobado">Aprobado</option>
											<option value="Aprobado con Observaciones">Aprobado con Observaciones</option>
											<option value="Rechazado">Rechazado / Reprobado</option>
										</select>
									</div>
								</div>

								<div>
									<label for="inputObs" class="form-label extra-small fw-bold text-uppercase text-muted">Observaciones y Dictamen Técnico</label>
									<textarea
										id="inputObs"
										bind:value={observaciones}
										rows="5"
										class="form-control form-control-sm rounded-3"
										placeholder="Escribe aquí las observaciones generales del documento, sustentación o correcciones requeridas..."
										required
									></textarea>
								</div>

								<div class="d-flex justify-content-end gap-2 pt-2 border-top">
									<button type="button" class="btn btn-sm btn-light border rounded-3 px-3">Cancelar</button>
									<button type="submit" class="btn btn-sm btn-primary rounded-3 px-4 fw-semibold shadow-sm">
										<i class="bi bi-send-check me-1"></i> Registrar Evaluación Final
									</button>
								</div>
							</form>
						{/if}
					</div>
				</div>
			</div>

		<!-- PESTAÑA 2 DE TRABAJOS ASIGNADOS -->
		{:else}
			<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
				<!-- Buscador superior -->
				<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
					<div>
						<h2 class="h6 fw-bold text-dark mb-1">Todos tus Trabajos Vinculados</h2>
						<p class="text-secondary extra-small mb-0">Listado general de proyectos donde participas como Director o Jurado.</p>
					</div>
					<div class="w-100 w-sm-auto" style="min-width: 260px;">
						<div class="input-group input-group-sm">
							<span class="input-group-text bg-white border-end-0 text-muted"><i class="bi bi-search"></i></span>
							<input
								type="text"
								class="form-control border-start-0 ps-0"
								placeholder="Buscar por título, código o alumno..."
								bind:value={busqueda}
							/>
						</div>
					</div>
				</div>

				<div class="row g-3">
					{#each trabajosFiltrados as item}
						<div class="col-12 col-md-6">
							<div class="card border rounded-3 p-3 h-100 d-flex flex-column justify-content-between bg-white shadow-2xs">
								<div>
									<div class="d-flex align-items-center justify-content-between gap-2 mb-2">
										<span class="badge bg-light text-dark border font-monospace extra-small">{item.id}</span>
										<span class="badge bg-primary-subtle text-primary border border-primary-subtle extra-small">{item.rolProfesor}</span>
									</div>

									<strong class="text-dark small d-block mb-1">{item.titulo}</strong>
									<span class="extra-small text-muted d-block mb-3">{item.carrera}</span>

									<div class="mb-3">
										<div class="d-flex align-items-center justify-content-between extra-small mb-1">
											<span class="text-muted">Avance General</span>
											<span class="fw-bold text-dark">{item.avancePorcentaje}%</span>
										</div>
										<div class="progress" style="height: 6px;">
											<div class="progress-bar bg-primary" role="progressbar" style="width: {item.avancePorcentaje}%" aria-valuenow={item.avancePorcentaje} aria-valuemin="0" aria-valuemax="100"></div>
										</div>
									</div>

									<div class="bg-light p-2.5 rounded-3 border extra-small mb-3">
										<span class="fw-bold text-dark d-block mb-1">Comité Registrado:</span>
										<ul class="list-unstyled mb-0 text-muted ps-1">
											{#each item.integrantes as integrante}
												<li class="d-flex align-items-center gap-1">
													<i class="bi bi-person-circle extra-small text-primary"></i> {integrante}
												</li>
											{/each}
										</ul>
									</div>
								</div>

								<div class="d-flex align-items-center justify-content-between border-top pt-2 mt-2">
									<span class="extra-small text-muted">Última entrega: {item.fechaEntrega}</span>
									<button class="btn btn-sm btn-outline-primary extra-small px-3 rounded-3 d-flex align-items-center gap-1">
										<i class="bi bi-eye"></i> Ver Detalles
									</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.extra-small {
		font-size: 0.72rem;
	}
	.btn-hover:hover {
		border-color: #0d6efd !important;
	}
	.shadow-2xs {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}
	.hover-bg-light:hover {
		background-color: #f8f9fa;
	}
</style>
