<script>
    const proyecto = {
		estudiante: "Owen Sanchez",
		facultad: "FACULTAD DE INGENIERÍA",
		programa: "PROGRAMA DE INGENIERÍA DE SISTEMAS Y COMPUTACIÓN",
		radicacion: "TB-2025-084",
		modalidad: "Tesis de Pregrado",
		estado: "En Desarrollo Activo",
		titulo: "Sistema de Seguimiento de trabajos de grados y tesis",
		descripcion: "Track de tesis",
		avanceGlobal: 65,
		faseActual: "Fase 3 de 5 completadas",
		hitoCritico: {
			diasRestantes: 7,
			nombre: "Entrega de Informe de Avance Metodológico y Código v1.0",
			limite: "28 de Noviembre de 2025, 23:59 hrs (Bogotá UTC-5)"
		}
	};


</script>


<div class="mb-4">
	<!-- Sub-header de ubicación y fecha -->
	<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
		<div>
			<span class="extra-small text-muted fw-bold text-uppercase tracking-wider">
				{proyecto.facultad} • {proyecto.programa}
			</span>
			<h1 class="h3 fw-bold text-dark mb-0">Bienvenida de nuevo, {proyecto.estudiante}</h1>
		</div>
		<div class="text-muted small d-flex align-items-center gap-2 bg-white px-3 py-1.5 rounded-3 border shadow-sm">
			<i class="bi bi-calendar3 text-primary"></i>
			<span>Jueves, 21 de Noviembre de 2025</span>
		</div>
	</div>

	<!-- Tarjeta Principal del Proyecto -->
	<div class="card border-0 shadow-sm rounded-4 overflow-hidden mb-3">
		<div class="card-body p-3 md-4">
			<!-- Metadatos superiores -->
			<div class="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3 mb-3">
				<div class="d-flex flex-wrap align-items-center gap-2 extra-small text-muted">
					<span class="bg-light border px-2 py-1 rounded fw-semibold text-dark text-nowrap">RADICACIÓN: {proyecto.radicacion}</span>
					<span class="d-none d-md-inline text-muted">•</span>
					<span class="text-nowrap">
                    	Modalidad: <strong>{proyecto.modalidad}</strong>
                	</span>
					<span class="d-none d-md-inline text-muted">•</span>
					<span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold py-1.5 px-2">
                    	<i class="bi bi-circle-fill extra-small me-1"></i> {proyecto.estado}
                	</span>
				</div>
				<!-- Estado Global -->
				<div class="text-end">
					<span class="extra-small text-muted text-uppercase fw-bold d-block">Estado Global</span>
					<span class="h3 fw-bold text-primary mb-0">{proyecto.avanceGlobal}%</span>
					<span class="extra-small text-muted"> consolidado</span>
				</div>
			</div>

			<!-- Título y Descripción -->
			<div class="row align-items-center mb-3">
				<div class="col-lg-9">
					<h2 class="h5 fw-bold text-dark mb-2">{proyecto.titulo}</h2>
					<p class="text-secondary small mb-0">{proyecto.descripcion}</p>
				</div>
				<div class="col-lg-3 text-lg-end mt-2 mt-lg-0">
					<span class="extra-small text-muted d-block mb-1">{proyecto.faseActual}</span>
				</div>
			</div>

			<!-- Barra de Progreso -->
			<div class="progress rounded-pill bg-light border" style="height: 10px;">
				<div 
					class="progress-bar bg-primary progress-bar-striped progress-bar-animated rounded-pill" 
					role="progressbar" 
					style="width: {proyecto.avanceGlobal}%;" 
					aria-valuenow={proyecto.avanceGlobal} 
					aria-valuemin="0" 
					aria-valuemax="100"
				></div>
			</div>
		</div>

		<!-- Alerta Inferior de Hito Crítico -->
		<div class="bg-danger-subtle border-top border-danger-subtle p-3 px-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
			<div class="d-flex align-items-center gap-3">
				<div class="bg-white text-danger rounded-3 p-2 shadow-sm d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
					<i class="bi bi-exclamation-triangle-fill fs-5"></i>
				</div>
				<div>
					<div class="d-flex align-items-center gap-2">
						<span class="badge bg-danger text-white extra-small text-uppercase">Hito Crítico Próximo</span>
						<span class="extra-small text-danger fw-bold">• Vence en {proyecto.hitoCritico.diasRestantes} días</span>
					</div>
					<strong class="text-dark small d-block">{proyecto.hitoCritico.nombre}</strong>
					<span class="extra-small text-muted">Fecha límite de radicación: {proyecto.hitoCritico.limite}</span>
				</div>
			</div>
			<button class="btn btn-primary btn-sm px-3 py-2 fw-semibold rounded-3 d-flex align-items-center gap-2 shadow-sm">
				<i class="bi bi-cloud-upload"></i> Subir Entrega Pendiente
			</button>
		</div>
	</div>
</div>

<style>
	.extra-small {
		font-size: 0.72rem;
	}
	.tracking-wider {
		letter-spacing: 0.05em;
	}
</style>