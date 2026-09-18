<script>

    const trabajoGrado= {
        titulo: "Sistema Inteligente de Diagnóstico Temprano en Imágenes Médicas mediante Redes Convolucionales",
		radicacion: "TB-2025-084",
		modalidad: "Tesis de Pregrado",
		estado: "En Desarrollo Activo",
		director: "Dr. Roberto Silva",
		lineaInvestigacion: "Procesamiento de Imágenes Médicas e Inteligencia Artificial",
		fechaInicio: "10 de Febrero de 2025",
		fechaEstimadaFin: "15 de Diciembre de 2025"
    } 

    const integrantes = [
		{ nombre: "Owen Sanchez", rol: "Autor Principal", codigo: "2021102003", correo: "ojsanchez@universidad.edu.co" },
		{ nombre: "Dr. Roberto Silva", rol: "Director de Tesis", departamento: "Ing. Biomédica", correo: "rsilva@universidad.edu.co" },
		{ nombre: "Dra. Elena Gómez", rol: "Jurado Evaluador 1", departamento: "Ciencias de la Computación", correo: "egomez@universidad.edu.co" }
	];


</script>

    <div class="d-flex bg-light min-vh-100">

        <main class="flex-grow-1 p-4 overflow-x-hidden">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
                <div>
                    <span class="extra-small text-muted fw-bold text-uppercase">Gestión del proyecto</span>
                    <h1 class="h3 fw-bold text-dark mb-0">Mi trabajo de Grado</h1>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-outline-secondary btn-sm px-3 rounded.3 f-flex align-items-center gap-2">
                        <i class="bi bi-download"></i>Descargar Técnica
                    </button>
                    <button class="btn btn-primary btn-sm px-3 rounded-3 d-flex align-items-center gap-2">
                        <i class="bi bi-pencil-square"></i>Solicitud de Modificación
                    </button>
                </div>
            </div>

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
                        <span class="small fw-semibold text-dark d-block text-truncate">{trabajoGrado.director}</span>
				    </div>
                    <div class="col-6 col-md-3">
                        <span class="extra-small text-muted d-block text-uppercase fw-bold">Inicio</span>
                        <span class="small fw-semibold text-dark d-block text-truncate">{trabajoGrado.fechaInicio}</span>
                    </div>
                    <div class="col-6 col-md-3">
                        <span class="extra-small text-muted d-block text-uppercase fw-bold">Cierre Estimado</span>
                        <span class="small fw-semibold text-dark d-block text-truncate">{trabajoGrado.fechaEstimadaFin}</span>
                    </div>
                </div>
            </div>


            <div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <h3 class="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                    <i class="bi bi-github text-primary fs-5"></i>Repositorio y control de versiones
                </h3>

                <div class="bg-light p-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3 border">
                    <div class="bg-white p-2 rounded-2 border text-dark">
                        <i class="bi-bi-code-sladh fs-5"></i>
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

            <div class="card border-0 shadow.-sm rounded-4 p-4">
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
                            {#each integrantes as persona}
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px;">
                                                {persona.nombre.charAt(0)}
                                            </div>
                                            <div>
                                                <strong class="text-dark d-block">{persona.nombre}</strong>
                                                {#if persona.codigo}
                                                    <span class="extra-small text-muted">Cód: {persona.codigo}</span>
                                                {/if}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span class="badge bg-light text-dark border fw-medium">{persona.rol}</span>
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
		<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
			<div class="d-flex align-items-center justify-content-between mb-3">
				<h3 class="h6 fw-bold text-dark mb-0">Comité Asignado</h3>
				<span class="badge bg-light text-primary border extra-small">3 Miembros</span>
			</div>

			<div class="d-flex flex-column gap-3">
				<div class="d-flex align-items-center gap-3">
					<div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 40px; height: 40px;">
						RS
					</div>
					<div class="lh-sm min-w-0">
						<div class="d-flex align-items-center gap-2">
							<strong class="text-dark extra-small text-truncate">Dr. Roberto Silva</strong>
							<span class="badge bg-primary text-white extra-small">Director</span>
						</div>
						<span class="extra-small text-muted d-block text-truncate">Docente Titular • Dpto. Bio.</span>
						<a href="mailto:rsilva@universidad.edu.co" class="extra-small text-decoration-none text-muted text-truncate d-block">rsilva@universidad.edu.co</a>
					</div>
				</div>

				<hr class="my-0 text-muted opacity-25" />

				<div class="d-flex align-items-center gap-3">
					<div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 40px; height: 40px;">
						EG
					</div>
					<div class="lh-sm min-w-0">
						<div class="d-flex align-items-center gap-2">
							<strong class="text-dark extra-small text-truncate">Dra. Elena Gómez</strong>
							<span class="badge bg-light text-dark border extra-small">Jurado 1</span>
						</div>
						<span class="extra-small text-muted d-block text-truncate">Dpto. Ciencias de la Comp.</span>
						<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle extra-small mt-1">Ajustes Requeridos</span>
					</div>
				</div>

                <hr class="my-0 text-muted opacity-25" />

                <div class="d-flex align-items-center gap-3">
					<div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 40px; height: 40px;">
						OS
					</div>
					<div class="lh-sm min-w-0">
						<div class="d-flex align-items-center gap-2">
							<strong class="text-dark extra-small text-truncate">Owen Sanchez</strong>
							<span class="badge bg-primary text-white extra-small">Estudiante</span>
						</div>
						<span class="extra-small text-muted d-block text-truncate">Estudiante Titular • Dpto. Ingeniería de sistemas.</span>
						<a href="mailto:rsilva@universidad.edu.co" class="extra-small text-decoration-none text-muted text-truncate d-block">rsilva@universidad.edu.co</a>
					</div>
				</div>

			</div>
		</div>

		<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
			<div class="d-flex align-items-center justify-content-between mb-3">
				<h3 class="h6 fw-bold text-dark mb-0">Documentos Oficiales</h3>
				<span class="badge bg-light text-muted border extra-small">3 Archivos</span>
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