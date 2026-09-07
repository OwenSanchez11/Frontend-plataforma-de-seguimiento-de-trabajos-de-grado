<script>

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
		<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
			<div>
				<span class="extra-small text-muted fw-bold text-uppercase">Gestión de Archivos</span>
				<h1 class="h3 fw-bold text-dark mb-0">Entregas & Documentos</h1>
			</div>
			<button class="btn btn-primary btn-sm px-3 rounded-3 d-flex align-items-center gap-2 shadow-sm">
				<i class="bi bi-cloud-upload-fill"></i> Nueva Entrega de Documento
			</button>
		</div>

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

		<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
			<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-4">
				<div>
					<h3 class="h6 fw-bold text-dark mb-1">Historial de Entregas Realizadas</h3>
					<p class="text-secondary extra-small mb-0">Documentos oficiales registrados en la plataforma con control de versiones.</p>
				</div>
				<span class="badge bg-light text-muted border extra-small">3 Archivos Subidos</span>
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
</style>