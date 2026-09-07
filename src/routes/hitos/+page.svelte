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
</script>

<div class="d-flex bg-light min-vh-100">

	<main class="flex-grow-1 p-3 p-md-4 overflow-x-hidden">
		<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
			<div>
				<span class="extra-small text-muted fw-bold text-uppercase">Planificación Académica</span>
				<h1 class="h3 fw-bold text-dark mb-0">Avances & Cronograma</h1>
			</div>
			<button class="btn btn-outline-secondary btn-sm px-3 rounded-3 d-flex align-items-center gap-2">
				<i class="bi bi-calendar-event"></i> Sincronizar Calendario
			</button>
		</div>

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

		<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
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
	</main>
</div>

<style>
	.extra-small {
		font-size: 0.72rem;
	}

	@media (min-width: 992px) {
		.col-lg-2-4 {
			flex: 0 0 auto;
			width: 20%;
		}
	}
</style>