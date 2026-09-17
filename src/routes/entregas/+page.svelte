<script>

	const fases = [
		{ numero: 1, nombre: 'Propuesta de Grado', estado: 'completado', avance: 100, fecha: '10 Mar 2025', detalle: 'Acta #021' },
		{ numero: 2, nombre: 'Anteproyecto', estado: 'completado', avance: 100, fecha: '10 Jun 2025', detalle: 'Res. 104-B' },
		{ numero: 3, nombre: 'Desarrollo & Prototipo', estado: 'en-curso', avance: 60, fecha: '28 Nov 2025', detalle: 'Vence en 7 días' },
		{ numero: 4, nombre: 'Documento Final Tesis', estado: 'pendiente', avance: 0, fecha: 'Enero 2026', detalle: 'Próximo' },
		{ numero: 5, nombre: 'Sustentación Oral', estado: 'pendiente', avance: 0, fecha: 'Febrero 2026', detalle: 'Próximo' }
	];

	const hitos = [
		{ id: '1.1', nombre: 'Aprobación de la Idea de Investigación', fase: 'Fase 1', estado: 'Aprobado', fecha: '15 Feb 2025', Descripcion: "Primer avance", fechaInicio: '1 Ene 2025' },
		{ id: '2.1', nombre: 'Entrega de Anteproyecto a Decanatura', fase: 'Fase 2', estado: 'Aprobado', fecha: '01 May 2025', Descripcion: "Segundo avance", fechaInicio: '1 Ene 2025' },
		{ id: '3.1', nombre: 'Configuración de Dataset & Preprocesamiento', fase: 'Fase 3', estado: 'Aprobado', fecha: '15 Oct 2025', Descripcion: "Primer avance", fechaInicio: '1 Ene 2025' },
		{ id: '3.2', nombre: 'Informe de Avance Metodológico y Código v1.0', fase: 'Fase 3', estado: 'Urgente', fecha: '28 Nov 2025', Descripcion: "Primer avance", fechaInicio: '1 Ene 2025' },
		{ id: '3.3', nombre: 'Resultados Preliminares y Matriz de Confusión', fase: 'Fase 3', estado: 'Pendiente', fecha: '15 Dic 2025', Descripcion: "Primer avance", fechaInicio: '1 Ene 2025' }
	];

	const documentos = [
		{
			id: 1,
			nombre: 'Informe_Avance_Metodologico_v1.0.pdf',
			hito: 'Hito 3.2 - Informe de Avance',
			fecha: '18 Nov 2025 • 22:15',
			tamaño: '14.2 MB',
			formato: 'PDF',
			estado: 'En Revisión',
			badgeColor: 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
			version: 'v1.0'
		},
		{
			id: 2,
			nombre: 'Codigo_Dataset_ResNet_DenseNet.zip',
			hito: 'Hito 3.1 - Dataset & Preprocesamiento',
			fecha: '15 Oct 2025 • 18:30',
			tamaño: '48.5 MB',
			formato: 'ZIP',
			estado: 'Aprobado',
			badgeColor: 'bg-success-subtle text-success border-success-subtle',
			version: 'v1.2'
		},
		{
			id: 3,
			nombre: 'Anteproyecto_Firmado_v2.pdf',
			hito: 'Hito 2.1 - Entrega de Anteproyecto',
			fecha: '10 Jun 2025 • 09:45',
			tamaño: '3.8 MB',
			formato: 'PDF',
			estado: 'Aprobado',
			badgeColor: 'bg-success-subtle text-success border-success-subtle',
			version: 'v2.0'
		}
	];

</script>

<div class="d-flex bg-light min-vh-100">

	<main class="flex-grow-1 p-3 p-md-4 overflow-x-hidden">

		<!-- ===== Encabezado general ===== -->
		<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
			<div>
				<span class="extra-small text-muted fw-bold text-uppercase">Planificación Académica</span>
				<h1 class="h3 fw-bold text-dark mb-0">Avances, Cronograma & Documentos</h1>
			</div>
			<div class="d-flex gap-2">
				<button class="btn btn-outline-secondary btn-sm px-3 rounded-3 d-flex align-items-center gap-2">
					<i class="bi bi-calendar-event"></i> Sincronizar Calendario
				</button>
				<button class="btn btn-primary btn-sm px-3 rounded-3 d-flex align-items-center gap-2 shadow-sm">
					<i class="bi bi-cloud-upload-fill"></i> Nueva Entrega de Documento
				</button>
			</div>
		</div>

		<!-- ===== Sección: Fases del trabajo de grado ===== -->
		<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4">
			<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-4">
				<div>
					<h2 class="h6 fw-bold text-dark mb-1">Ruta Metodológica y Fases Obligatorias</h2>
					<p class="text-secondary extra-small mb-0">Progreso cronológico según el Reglamento General de Trabajos de Grado 2025-II.</p>
				</div>
				<span class="badge bg-primary-subtle text-primary border border-primary-subtle extra-small fw-semibold">
					Etapa Actual: Fase 3
				</span>
			</div>

			<div class="row g-3 text-center">
				{#each fases as fase}
					<div class="col-12 col-sm-6 col-lg-2-4">
						<div class="card border-0 bg-light p-3 rounded-3 h-100 d-flex flex-column align-items-center justify-content-between border">
							<div class="d-flex align-items-center justify-content-center mb-2">
								{#if fase.estado === 'completado'}
									<div class="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 36px; height: 36px;">
										<i class="bi bi-check-lg fs-5"></i>
									</div>
								{:else if fase.estado === 'en-curso'}
									<div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 40px; height: 40px;">
										{fase.numero}
									</div>
								{:else}
									<div class="bg-white text-muted border rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 36px; height: 36px;">
										{fase.numero}
									</div>
								{/if}
							</div>

							<div>
								<span class="extra-small text-muted fw-bold d-block text-uppercase">FASE {fase.numero} • {fase.avance}%</span>
								<strong class="text-dark small d-block mb-1">{fase.nombre}</strong>
								<span class="extra-small text-secondary d-block">{fase.fecha}</span>
							</div>

							<div class="mt-2">
								{#if fase.estado === 'en-curso'}
									<span class="badge bg-primary text-white extra-small">{fase.detalle}</span>
								{:else if fase.estado === 'completado'}
									<span class="badge bg-success-subtle text-success border border-success-subtle extra-small">{fase.detalle}</span>
								{:else}
									<span class="badge bg-light text-muted border extra-small">{fase.detalle}</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- ===== Sección: Registro general de avances (hitos) ===== -->
		<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4">
			<h3 class="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
				<i class="bi bi-list-check text-primary fs-5"></i> Registro General de Avances
			</h3>

			<div class="table-responsive">
				<table class="table table-hover align-middle mb-0">
					<thead class="table-light extra-small text-uppercase text-muted">
						<tr>
							<th>Código</th>
							<th>Nombre del Avance</th>
							<th>Versión</th>
							<th>Fecha Inicio</th>
							<th>Estado</th>
							<th>Descripción</th>
							<th>Fecha Limite</th>
							<th class="text-end">Acciones</th>
						</tr>
					</thead>
					<tbody class="small">
						{#each hitos as hito}
							<tr>
								<td><span class="badge bg-light text-dark border font-monospace">{hito.id}</span></td>
								<td><strong class="text-dark">{hito.nombre}</strong></td>
								<td><span class="text-muted extra-small">{hito.fase}</span></td>
								<td class="text-muted">{hito.fechaInicio}</td>
								<td>
									{#if hito.estado === 'Aprobado'}
										<span class="badge bg-success-subtle text-success border border-success-subtle">Aprobado</span>
									{:else if hito.estado === 'Urgente'}
										<span class="badge bg-danger text-white">Urgente</span>
									{:else}
										<span class="badge bg-secondary-subtle text-secondary border">Pendiente</span>
									{/if}
								</td>
								<td class="text-muted extra-small">{hito.Descripcion}</td>
								<td class="text-muted">{hito.fecha}</td>
								<td class="text-end">
									<button class="btn btn-sm btn-light border p-1 text-muted" aria-label="Ver detalles">
										<i class="bi bi-eye"></i>
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<!-- ===== Sección: Zona de carga de documentos ===== -->
		<div class="card border-2 border-dashed border-primary-subtle bg-white shadow-sm rounded-4 p-4 text-center mb-4">
			<div class="d-flex flex-column align-items-center justify-content-center py-3">
				<div class="bg-primary-subtle text-primary rounded-circle p-3 mb-3 d-flex align-items-center justify-content-center" style="width: 56px; height: 56px;">
					<i class="bi bi-cloud-arrow-up fs-3"></i>
				</div>
				<h2 class="h6 fw-bold text-dark mb-1">Arrastra tu archivo aquí o haz clic para examinar</h2>
				<p class="text-muted extra-small mb-3">Formatos soportados: PDF, ZIP, PYNB, CSV, XLSX (Tamaño máximo: 50MB)</p>
				<button class="btn btn-outline-primary btn-sm px-4 rounded-3 fw-medium">
					Seleccionar desde el equipo
				</button>
			</div>
		</div>

		<!-- ===== Sección: Historial de entregas / documentos ===== -->
		<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
			<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-4">
				<div>
					<h3 class="h6 fw-bold text-dark mb-1">Historial de Entregas Realizadas</h3>
					<p class="text-secondary extra-small mb-0">Documentos oficiales registrados en la plataforma con control de versiones.</p>
				</div>
				<span class="badge bg-light text-muted border extra-small">{documentos.length} Archivos Subidos</span>
			</div>

			<div class="table-responsive">
				<table class="table table-hover align-middle mb-0">
					<thead class="table-light extra-small text-uppercase text-muted">
						<tr>
							<th>Documento / Versión</th>
							<th>Avance Asociado</th>
							<th>Fecha de Radicación</th>
							<th>Tamaño</th>
							<th>Estado</th>
							<th class="text-end">Acciones</th>
						</tr>
					</thead>
					<tbody class="small">
						{#each documentos as doc}
							<tr>
								<td>
									<div class="d-flex align-items-center gap-2 min-w-0">
										{#if doc.formato === 'PDF'}
											<i class="bi bi-file-earmark-pdf text-danger fs-5 flex-shrink-0"></i>
										{:else}
											<i class="bi bi-file-earmark-zip text-primary fs-5 flex-shrink-0"></i>
										{/if}
										<div class="lh-sm min-w-0">
											<strong class="text-dark d-block text-truncate">{doc.nombre}</strong>
											<span class="badge bg-light text-secondary border extra-small">{doc.version}</span>
										</div>
									</div>
								</td>
								<td><span class="text-muted extra-small text-truncate d-block">{doc.hito}</span></td>
								<td class="text-muted extra-small">{doc.fecha}</td>
								<td class="text-muted extra-small">{doc.tamaño}</td>
								<td>
									<span class="badge {doc.badgeColor} border extra-small">
										{doc.estado}
									</span>
								</td>
								<td class="text-end">
									<div class="btn-group btn-group-sm">
										<button class="btn btn-light border text-muted" aria-label="Descargar archivo">
											<i class="bi bi-download"></i>
										</button>
										<button class="btn btn-light border text-muted" aria-label="Ver historial de versiones">
											<i class="bi bi-clock-history"></i>
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

	</main>

</div>

<style>
	.extra-small {
		font-size: 0.72rem;
	}

	.border-dashed {
		border-style: dashed !important;
	}

	@media (min-width: 992px) {
		.col-lg-2-4 {
			flex: 0 0 auto;
			width: 20%;
		}
	}
</style>