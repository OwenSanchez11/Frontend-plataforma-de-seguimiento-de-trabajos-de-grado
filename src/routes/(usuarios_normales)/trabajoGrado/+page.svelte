<script>
	import { onMount } from 'svelte';
	import { getTrabajoPorEstudiante } from '$lib/api';
  import { sesion } from '$lib/sesion.svelte';

	let trabajoGrado = $state(null);
	let integrantes = $state([]);
	let cargando = $state(true);
	let error = $state('');
	let sinTrabajo = $state(false);

	// El texto debe ser idéntico al nombre en la tabla rol_proyecto
	let director = $derived(integrantes.find((p) => p.rol_proyecto === 'Director'));
	// Comité = quienes tienen rol de proyecto (director y jurados)
	let comite = $derived(integrantes.filter((p) => p.rol_proyecto));

	function formatearFecha(f) {
		if (!f) return '-';
		return new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function nombreCompleto(p) {
		return `${p.nombre} ${p.apellido ?? ''}`.trim();
	}

	function iniciales(p) {
		return ((p.nombre?.[0] ?? '') + (p.apellido?.[0] ?? '')).toUpperCase();
	}

	onMount(async () => {
		try {
			const usuario = sesion.usuario;
			if (!usuario || usuario.rol !== 'estudiante') {
				error = 'Esta página está disponible únicamente para estudiantes.';
				return;
			}

			const data = await getTrabajoPorEstudiante(usuario.id_user);
			trabajoGrado = data?.trabajo ?? null;
			integrantes = Array.isArray(data?.equipo) ? data.equipo : [];
			sinTrabajo = !trabajoGrado;
		} catch (e) {
			if (e.status === 404) {
				sinTrabajo = true;
			} else {
				error = e.message;
			}
		} finally {
			cargando = false;
		}
	});
</script>

<div class="d-flex bg-light min-vh-100">
	<main class="flex-grow-1 p-4 overflow-x-hidden">
		<div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
			<div>
				<span class="extra-small text-muted fw-bold text-uppercase">Gestión del proyecto</span>
				<h1 class="h3 fw-bold text-dark mb-0">Mi trabajo de Grado</h1>
			</div>
			<div class="d-flex gap-2">
				<button class="btn btn-outline-secondary btn-sm px-3 rounded-3 d-flex align-items-center gap-2">
					<i class="bi bi-download"></i>Descargar Técnica
				</button>
				<button class="btn btn-primary btn-sm px-3 rounded-3 d-flex align-items-center gap-2">
					<i class="bi bi-pencil-square"></i>Solicitud de Modificación
				</button>
			</div>
		</div>

		{#if cargando}
			<div class="text-center py-5 text-muted">Cargando...</div>
		{:else if error}
			<div class="alert alert-warning">{error}</div>
		{:else if sinTrabajo}
			<div class="alert alert-info">Aún no tienes un trabajo de grado asignado.</div>
		{:else if trabajoGrado}
			<!-- Tarjeta principal -->
			<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4">
				<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
					<span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold py-1.5 px-2.5">
						<i class="bi bi-circle-fill me-1 extra-small"></i>{trabajoGrado.estado}
					</span>
					<span class="text-muted extra-small">Radicación: <strong>{trabajoGrado.radicacion}</strong></span>
				</div>
				<h2 class="h5 h4-md fw-bold text-dark mb-3 text-break">{trabajoGrado.titulo}</h2>
				<div class="row g-3 pt-3 border-top">
					<div class="col-6 col-md-3">
						<span class="extra-small text-muted d-block text-uppercase fw-bold">Modalidad</span>
						<span class="small fw-semibold text-dark d-block text-truncate">{trabajoGrado.modalidad}</span>
					</div>
					<div class="col-6 col-md-3">
						<span class="extra-small text-muted d-block text-uppercase fw-bold">Director</span>
						<span class="small fw-semibold text-dark d-block text-truncate">
							{director ? nombreCompleto(director) : 'Sin asignar'}
						</span>
					</div>
					<div class="col-6 col-md-3">
						<span class="extra-small text-muted d-block text-uppercase fw-bold">Inicio</span>
						<span class="small fw-semibold text-dark d-block text-truncate">{formatearFecha(trabajoGrado.fecha_inicio)}</span>
					</div>
					<div class="col-6 col-md-3">
						<span class="extra-small text-muted d-block text-uppercase fw-bold">Cierre Estimado</span>
						<span class="small fw-semibold text-dark d-block text-truncate">{formatearFecha(trabajoGrado.fecha_estimada_fin ?? trabajoGrado.fecha_fin)}</span>
					</div>
				</div>
			</div>

			<!-- Repositorio (datos de prueba) -->
			<div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
				<h3 class="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
					<i class="bi bi-github text-primary fs-5"></i>Repositorio y control de versiones
				</h3>

				<div class="bg-light p-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3 border">
					<div class="bg-white p-2 rounded-2 border text-dark">
						<i class="bi bi-code-slash fs-5"></i>
					</div>
					<div>
						<span class="fw-semibold text-dark d-block small">github.com/universidad/tesis-resnet-denseNet</span>
						<span class="extra-small text-muted">Último commit: hace 2 días (Rama main)</span>
					</div>
					<a href="https://github.com" target="_blank" class="btn btn-sm btn-white border shadow-sm fw-medium d-flex align-items-center gap-1">
						Abrir Repositorio <i class="bi bi-box-arrow-up-right extra-small ms-1"></i>
					</a>
				</div>
			</div>

			<!-- Equipo vinculado -->
			<div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
				<h3 class="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
					<i class="bi bi-people text-primary fs-5"></i> Equipo Vinculado al Proyecto
				</h3>
				<div class="table-responsive">
					<table class="table table-hover align-middle mb-0">
						<thead class="table-light extra-small text-uppercase text-muted">
							<tr>
								<th>Persona</th>
								<th>Rol / Asignación</th>
								<th>Correo Institucional</th>
								<th class="text-end">Acción</th>
							</tr>
						</thead>
						<tbody class="small">
							{#each integrantes as persona (persona.id_user)}
								<tr>
									<td>
										<div class="d-flex align-items-center gap-2">
											<div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px;">
												{iniciales(persona)}
											</div>
											<div>
												<strong class="text-dark d-block">{nombreCompleto(persona)}</strong>
											</div>
										</div>
									</td>
									<td>
										<span class="badge bg-light text-dark border fw-medium">{persona.rol_proyecto ?? 'Estudiante'}</span>
									</td>
									<td class="text-muted">{persona.correo}</td>
									<td class="text-end">
										<a href="mailto:{persona.correo}" class="btn btn-sm btn-light border p-1 text-muted">
											<i class="bi bi-envelope"></i>
										</a>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<div class="row g-4 mb-4">
				<!-- Entregables (datos de prueba) -->
				<div class="col-12 col-xl-8">
					<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 h-100">
						<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-4">
							<div>
								<h3 class="h5 fw-bold text-dark mb-1">Entregables Activos y Requisitos Pendientes</h3>
								<p class="text-secondary small mb-0">Subidas habilitadas según el calendario de radicación actual.</p>
							</div>
							<span class="badge bg-light text-dark border px-3 py-2 extra-small text-nowrap">
								Período Ordinario 2025-II
							</span>
						</div>

						<div class="border rounded-3 p-3 mb-3 bg-light-subtle">
							<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
								<div class="d-flex align-items-center gap-2">
									<span class="badge bg-danger text-white extra-small fw-bold">URGENTE • 7 DÍAS</span>
									<span class="extra-small text-muted fw-semibold">Hito 3.2</span>
								</div>
								<span class="extra-small text-danger fw-semibold d-flex align-items-center gap-1">
									<i class="bi bi-clock-history"></i> Plazo: 28 Nov 2025 - 23:59
								</span>
							</div>

							<h4 class="h6 fw-bold text-dark mb-1">Informe de Avance Metodológico y Repositorio Código v1.0</h4>
							<p class="extra-small text-muted mb-3">
								Evaluador: Dr. Roberto Silva (Director) y Dra. Elena Gómez (Jurado)
							</p>

							<div class="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3 pt-2 border-top">
								<div class="d-flex align-items-center gap-1 extra-small text-muted flex-wrap">
									<span>Formatos admitidos:</span>
									<span class="badge bg-white text-dark border">PDF</span>
									<span class="badge bg-white text-dark border">PYNB</span>
									<span class="badge bg-white text-dark border">ZIP (Máx. 50MB)</span>
								</div>
								<div class="d-flex align-items-center gap-2">
									<button class="btn btn-sm btn-white border shadow-sm text-secondary px-3 py-1.5 fw-medium flex-fill flex-md-grow-0 d-flex align-items-center justify-content-center gap-1">
										<i class="bi bi-journal-text"></i> Rúbrica
									</button>
									<button class="btn btn-sm btn-primary px-3 py-1.5 fw-semibold flex-fill flex-md-grow-0 d-flex align-items-center justify-content-center gap-1">
										<i class="bi bi-cloud-upload"></i> Cargar Documento
									</button>
								</div>
							</div>
						</div>

						<div class="border rounded-3 p-3 opacity-75">
							<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
								<div class="d-flex align-items-center gap-2">
									<span class="badge bg-secondary text-white extra-small fw-bold">PROGRAMADO</span>
									<span class="extra-small text-muted fw-semibold">Hito 3.3</span>
								</div>
								<span class="extra-small text-muted d-flex align-items-center gap-1">
									<i class="bi bi-calendar-event"></i> Plazo: 15 Dic 2025
								</span>
							</div>

							<h4 class="h6 fw-bold text-dark mb-1">Resultados Preliminares y Matriz de Confusión de Algoritmos</h4>
							<p class="extra-small text-muted mb-3">
								Evaluador: Ing. Marcos Paz (Comité de Bioética & Validación Técnica)
							</p>

							<div class="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3 pt-2 border-top">
								<div class="d-flex align-items-center gap-1 extra-small text-muted flex-wrap">
									<span>Formatos admitidos:</span>
									<span class="badge bg-white text-dark border">PDF</span>
									<span class="badge bg-white text-dark border">CSV</span>
									<span class="badge bg-white text-dark border">XLSX</span>
								</div>
								<button class="btn btn-sm btn-light border text-muted px-3 py-1.5 fw-medium disabled" disabled>
									<i class="bi bi-lock me-1"></i> Apertura 01 Dic
								</button>
							</div>
						</div>
					</div>
				</div>

				<div class="col-12 col-xl-4 d-flex flex-column gap-4">
					<!-- Comité asignado -->
					<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
						<div class="d-flex align-items-center justify-content-between mb-3">
							<h3 class="h6 fw-bold text-dark mb-0">Comité Asignado</h3>
							<span class="badge bg-light text-primary border extra-small">{comite.length} Miembros</span>
						</div>

						<div class="d-flex flex-column gap-3">
							{#each comite as miembro, i (miembro.id_user)}
								{#if i > 0}
									<hr class="my-0 text-muted opacity-25" />
								{/if}
								<div class="d-flex align-items-center gap-3">
									<div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 40px; height: 40px;">
										{iniciales(miembro)}
									</div>
									<div class="lh-sm min-w-0">
										<div class="d-flex align-items-center gap-2">
											<strong class="text-dark extra-small text-truncate">{nombreCompleto(miembro)}</strong>
											<span class="badge bg-primary text-white extra-small">{miembro.rol_proyecto}</span>
										</div>
										<a href="mailto:{miembro.correo}" class="extra-small text-decoration-none text-muted text-truncate d-block">{miembro.correo}</a>
									</div>
								</div>
							{/each}
						</div>
					</div>

					<!-- Documentos oficiales (datos de prueba) -->
					<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
						<div class="d-flex align-items-center justify-content-between mb-3">
							<h3 class="h6 fw-bold text-dark mb-0">Documentos Oficiales</h3>
							<span class="badge bg-light text-muted border extra-small">2 Archivos</span>
						</div>

						<div class="list-group list-group-flush border-0">
							<a href="#" class="list-group-item list-group-item-action border-0 px-0 py-2 d-flex align-items-center justify-content-between">
								<div class="d-flex align-items-center gap-2 min-w-0">
									<i class="bi bi-file-earmark-pdf text-danger fs-5 flex-shrink-0"></i>
									<div class="lh-sm min-w-0">
										<span class="extra-small fw-semibold text-dark d-block text-truncate">Carta_Aprobacion_Comite.pdf</span>
										<span class="extra-small text-muted">Firmado • 1.4 MB</span>
									</div>
								</div>
								<i class="bi bi-download text-muted fs-6"></i>
							</a>

							<a href="#" class="list-group-item list-group-item-action border-0 px-0 py-2 d-flex align-items-center justify-content-between">
								<div class="d-flex align-items-center gap-2 min-w-0">
									<i class="bi bi-file-earmark-pdf text-danger fs-5 flex-shrink-0"></i>
									<div class="lh-sm min-w-0">
										<span class="extra-small fw-semibold text-dark d-block text-truncate">Anteproyecto_Aprobado_v2.pdf</span>
										<span class="extra-small text-muted">Sello Decanatura • 3.8 MB</span>
									</div>
								</div>
								<i class="bi bi-download text-muted fs-6"></i>
							</a>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</main>
</div>

<style>
	.extra-small {
		font-size: 0.72rem;
	}
	.btn-white {
		background-color: #ffffff;
	}
</style>
