<script>
	// Datos mock de los Jurados y Evaluadores
	const evaluadores = [
		{
			id: 1,
			nombre: 'Dr. Roberto Silva',
			rol: 'Director de Tesis',
			departamento: 'Dpto. Ingeniería Biomédica',
			correo: 'rsilva@universidad.edu.co',
			estadoConcepto: 'Aprobado sin Objeciones',
			badgeColor: 'bg-success-subtle text-success border-success-subtle',
			ultimaRevision: '14 Nov 2025'
		},
		{
			id: 2,
			nombre: 'Dra. Elena Gómez',
			rol: 'Jurado Evaluador 1',
			departamento: 'Dpto. Ciencias de la Computación',
			correo: 'egomez@universidad.edu.co',
			estadoConcepto: 'Ajustes Requeridos',
			badgeColor: 'bg-warning-subtle text-warning-emphasis border-warning-subtle',
			ultimaRevision: '19 Nov 2025'
		},
		{
			id: 3,
			nombre: 'Ing. Marcos Paz',
			rol: 'Jurado Evaluador 2',
			departamento: 'Comité de Bioética & Validación',
			correo: 'mpaz@universidad.edu.co',
			estadoConcepto: 'Concepto Favorable',
			badgeColor: 'bg-info-subtle text-info-emphasis border-info-subtle',
			ultimaRevision: '10 Nov 2025'
		}
	];

	// Observaciones y comentarios detallados
	const observaciones = [
		{
			id: 101,
			evaluador: 'Dra. Elena Gómez',
			rol: 'Jurado Evaluador 1',
			hito: 'Hito 3.1 - Configuración de Dataset',
			fecha: '19 Nov 2025 • 15:40',
			tipo: 'Ajuste Metodológico',
			mensaje:
				'Se requiere ampliar la justificación de la arquitectura ResNet respecto al pre-procesamiento del dataset DICOM en el Capítulo 3. Por favor incluir validación cruzada k-fold para respaldar los métricos de precisión.',
			adjunto: 'Observaciones_Capitulo3_EG.pdf',
			estado: 'Pendiente de Corrección'
		},
		{
			id: 102,
			evaluador: 'Dr. Roberto Silva',
			rol: 'Director de Tesis',
			hito: 'Hito 2.1 - Entrega de Anteproyecto',
			fecha: '14 Nov 2025 • 11:20',
			tipo: 'Aprobación',
			mensaje:
				'Revisión de horas de laboratorio de simulación en cluster GPU aprobadas formalmente. El cronograma ajustado cumple con los requerimientos de la facultad.',
			adjunto: null,
			estado: 'Atendido'
		}
	];
</script>

<div class="d-flex bg-light min-vh-100">

	<main class="flex-grow-1 p-3 p-md-4 overflow-x-hidden">
		<!-- Header de la pantalla -->
		<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
			<div>
				<span class="extra-small text-muted fw-bold text-uppercase">Evaluación & Seguimiento</span>
				<h1 class="h3 fw-bold text-dark mb-0">Retroalimentaciones & Jurados</h1>
			</div>
			<button class="btn btn-primary btn-sm px-3 rounded-3 d-flex align-items-center gap-2">
				<i class="bi bi-chat-left-dots"></i> Solicitar Tutoría Extraordinaria
			</button>
		</div>

		<!-- 1. Tarjetas del Jurado Evaluador (Grid 3 columnas) -->
		<div class="row g-3 mb-4">
			{#each evaluadores as prof}
				<div class="col-12 col-md-6 col-lg-4">
					<div class="card border-0 shadow-sm rounded-4 p-3 h-100 d-flex flex-column justify-content-between">
						<div>
							<div class="d-flex align-items-center justify-content-between mb-3">
								<span class="badge bg-light text-dark border extra-small">{prof.rol}</span>
								<span class="extra-small text-muted">{prof.ultimaRevision}</span>
							</div>

							<div class="d-flex align-items-center gap-3 mb-3">
								<div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 44px; height: 44px;">
									{prof.nombre.split(' ').map((n) => n[0]).slice(-2).join('')}
								</div>
								<div class="lh-sm min-w-0">
									<strong class="text-dark d-block text-truncate">{prof.nombre}</strong>
									<span class="extra-small text-muted d-block text-truncate">{prof.departamento}</span>
								</div>
							</div>
						</div>

						<div class="pt-2 border-top d-flex align-items-center justify-content-between gap-2">
							<span class="badge {prof.badgeColor} border extra-small text-truncate">
								{prof.estadoConcepto}
							</span>
							<a href="mailto:{prof.correo}" class="btn btn-sm btn-light border p-1 text-muted" aria-label="Enviar correo">
								<i class="bi bi-envelope"></i>
							</a>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- 2. Lista de Observaciones Oficiales -->
		<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
			<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-4">
				<div>
					<h2 class="h6 fw-bold text-dark mb-1">Historial de Observaciones Formales</h2>
					<p class="text-secondary extra-small mb-0">Retroalimentaciones emitidos sobre entregables y avances del trabajo de grado.</p>
				</div>
				<span class="badge bg-light text-muted border extra-small">2 Observaciones Activas</span>
			</div>

			<div class="d-flex flex-column gap-3">
				{#each observaciones as obs}
					<div class="border rounded-3 p-3 bg-white shadow-2xs">
						<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-2">
							<div class="d-flex align-items-center gap-2 flex-wrap">
								<strong class="text-dark small">{obs.evaluador}</strong>
								<span class="badge bg-light text-secondary border extra-small">{obs.rol}</span>
								<span class="extra-small text-muted">• {obs.hito}</span>
							</div>
							<span class="extra-small text-muted">{obs.fecha}</span>
						</div>

						<!-- Contenido del mensaje -->
						<p class="small text-secondary bg-light p-3 rounded-3 border mb-3">
							"{obs.mensaje}"
						</p>

						<!-- Acciones y Adjuntos -->
						<div class="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-2 pt-2 border-top">
							<div class="d-flex align-items-center gap-2 flex-wrap">
								{#if obs.estado === 'Pendiente de Corrección'}
									<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle extra-small">
										<i class="bi bi-clock me-1"></i>{obs.estado}
									</span>
								{:else}
									<span class="badge bg-success-subtle text-success border border-success-subtle extra-small">
										<i class="bi bi-check-circle me-1"></i>{obs.estado}
									</span>
								{/if}

								{#if obs.adjunto}
									<button class="btn btn-sm btn-link text-decoration-none p-0 extra-small text-primary d-flex align-items-center gap-1">
										<i class="bi bi-file-earmark-pdf"></i> {obs.adjunto}
									</button>
								{/if}
							</div>

							<button class="btn btn-sm btn-outline-primary px-3 rounded-3 fw-medium extra-small d-flex align-items-center justify-content-center gap-1">
								<i class="bi bi-reply"></i> Responder Observación
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</main>
</div>

<style>
	.extra-small {
		font-size: 0.72rem;
	}
</style>