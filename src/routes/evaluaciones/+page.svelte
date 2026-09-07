<script>

	const trabajosAsignados = [
		{
			id: 'TB-2025-084',
			estudiante: 'Valentina Morales',
			carrera: 'Ingeniería Biomédica',
			titulo: 'Sistema Inteligente de Diagnóstico Temprano en Imágenes Médicas mediante Redes Convolucionales',
			rolProfesor: 'Jurado Evaluador 1',
			estadoTramite: 'Pendiente de Calificación',
			ultimoAvance: 'Informe_Avance_Metodologico_v1.0.pdf',
			fechaEntrega: '18 Nov 2025'
		},
		{
			id: 'TB-2025-012',
			estudiante: 'Carlos Mendoza',
			carrera: 'Ingeniería de Sistemas',
			titulo: 'Plataforma IoT para Monitoreo de Calidad de Aire en Corredores Industriales',
			rolProfesor: 'Director de Tesis',
			estadoTramite: 'Aprobado sin Objeciones',
			ultimoAvance: 'Anteproyecto_Final_v2.pdf',
			fechaEntrega: '10 Nov 2025'
		}
	];

	let trabajoSeleccionado = $state(trabajosAsignados[0]);
	let notaFinal = $state('');
	let veredicto = $state('Aprobado');
	let observaciones = $state('');
	let evaluacionEnviada = $state(false);

	function guardarEvaluacion(e) {
		e.preventDefault();
		evaluacionEnviada = true;
	}
</script>


<div class="d-flex bg-light min-vh-100">

	<main class="flex-grow-1 p-3 p-md-4 overflow-x-hidden">
		<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
			<div>
				<span class="extra-small text-muted fw-bold text-uppercase">Portal de Evaluación & Jurados</span>
				<h1 class="h3 fw-bold text-dark mb-0">Gestión de Revisiones y Calificaciones</h1>
			</div>
			<span class="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 extra-small fw-semibold">
				Rol Actual: Docente / Evaluador
			</span>
		</div>

		<div class="row g-4">

			<div class="col-12 col-xl-5">
				<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
					<h2 class="h6 fw-bold text-dark mb-3">Trabajos de Grado Asignados</h2>

					<div class="d-flex flex-column gap-3">
						{#each trabajosAsignados as trabajo}
							<button
								type="button"
								class="card border p-3 rounded-3 text-start transition-all btn-hover {trabajoSeleccionado.id === trabajo.id ? 'border-primary bg-primary-subtle shadow-2xs' : 'bg-white'}"
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
								<span class="extra-small text-muted d-block mb-2">Estudiante: <strong>{trabajo.estudiante}</strong> ({trabajo.carrera})</span>
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

			<!-- Columna 2: Formulario de Evaluación Final y Retroalimentación -->
			<div class="col-12 col-xl-7">
				<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
					<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3 border-bottom pb-3">
						<div class="min-w-0">
							<span class="extra-small text-muted fw-bold text-uppercase d-block">Evaluación en curso</span>
							<h3 class="h6 fw-bold text-dark mb-0 text-truncate">{trabajoSeleccionado.estudiante}</h3>
						</div>
						<a href="#" class="btn btn-sm btn-outline-primary rounded-3 extra-small fw-medium d-flex align-items-center gap-1">
							<i class="bi bi-file-earmark-arrow-down"></i> Ver Avance: {trabajoSeleccionado.ultimoAvance}
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
							<!-- Campos basados en la tabla 'evaluacion_final' de tu Base de Datos -->
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
								<button type="button" class="btn btn-sm btn-light border rounded-3 px-3">
									Cancelar
								</button>
								<button type="submit" class="btn btn-sm btn-primary rounded-3 px-4 fw-semibold shadow-sm">
									<i class="bi bi-send-check me-1"></i> Registrar Evaluación Final
								</button>
							</div>
						</form>
					{/if}
				</div>
			</div>
		</div>
	</main>
</div>

<style>
	.extra-small {
		font-size: 0.72rem;
	}
	.btn-hover:hover {
		border-color: #0d6efd !important;
	}
</style>