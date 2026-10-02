<script>
	let busqueda = $state('');
	let modalAbierto = $state(false);
	let modalVer = $state(false);
	let modalEliminar = $state(false);
	let modoEdicion = $state(false);

	let evaluacionSeleccionada = $state(null);
	let evaluacionAEliminar = $state(null);

	let formulario = $state({
		id_evaluacion: null,
		id_trabajo_grado: '',
		id_usuario: '',
		nota: '',
		veredicto: '',
		observaciones: '',
		fecha_evaluacion: '',
		estado: true
	});

	let evaluaciones = $state([
		{
			id_evaluacion: 1,
			id_trabajo_grado: 1,
			id_usuario: 15,
			nota: 4.5,
			veredicto: 'Aprobado',
			observaciones: 'El trabajo cumple con los objetivos establecidos.',
			fecha_evaluacion: '2026-06-10',
			estado: true
		},
		{
			id_evaluacion: 2,
			id_trabajo_grado: 2,
			id_usuario: 18,
			nota: 3.8,
			veredicto: 'Aprobado con observaciones',
			observaciones: 'Se recomienda mejorar la documentación del proyecto.',
			fecha_evaluacion: '2026-06-15',
			estado: true
		},
		{
			id_evaluacion: 3,
			id_trabajo_grado: 3,
			id_usuario: 21,
			nota: 2.9,
			veredicto: 'No aprobado',
			observaciones: 'El trabajo requiere ajustes antes de una nueva evaluación.',
			fecha_evaluacion: '2026-06-20',
			estado: false
		}
	]);

	let trabajosGrado = $state([
		{
			id: 1,
			titulo: 'Sistema de seguimiento de trabajos de grado'
		},
		{
			id: 2,
			titulo: 'Plataforma web para gestión académica'
		},
		{
			id: 3,
			titulo: 'Sistema de gestión de proyectos'
		}
	]);

	let usuarios = $state([
		{
			id: 15,
			nombre: 'Carlos Rodríguez'
		},
		{
			id: 18,
			nombre: 'María González'
		},
		{
			id: 21,
			nombre: 'Andrés Martínez'
		}
	]);

	let evaluacionesFiltradas = $derived(
		evaluaciones.filter((evaluacion) => {
			const texto = busqueda.toLowerCase();

			const trabajo = obtenerTituloTrabajo(evaluacion.id_trabajo_grado).toLowerCase();
			const usuario = obtenerNombreUsuario(evaluacion.id_usuario).toLowerCase();
			const veredicto = (evaluacion.veredicto || '').toLowerCase();

			return (
				String(evaluacion.id_evaluacion).includes(texto) ||
				trabajo.includes(texto) ||
				usuario.includes(texto) ||
				veredicto.includes(texto)
			);
		})
	);

	function obtenerTituloTrabajo(id) {
		const trabajo = trabajosGrado.find((item) => item.id === Number(id));
		return trabajo ? trabajo.titulo : `Trabajo #${id}`;
	}

	function obtenerNombreUsuario(id) {
		const usuario = usuarios.find((item) => item.id === Number(id));
		return usuario ? usuario.nombre : `Usuario #${id}`;
	}

	function obtenerClaseNota(nota) {
		if (nota >= 4) return 'text-success';
		if (nota >= 3) return 'text-warning';
		return 'text-danger';
	}

	function obtenerClaseEstado(estado) {
		return estado ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
	}

	function obtenerTextoEstado(estado) {
		return estado ? 'Activo' : 'Inactivo';
	}

	function abrirNuevaEvaluacion() {
		modoEdicion = false;

		formulario = {
			id_evaluacion: null,
			id_trabajo_grado: '',
			id_usuario: '',
			nota: '',
			veredicto: '',
			observaciones: '',
			fecha_evaluacion: '',
			estado: true
		};

		modalAbierto = true;
	}

	function abrirEditarEvaluacion(evaluacion) {
		modoEdicion = true;

		formulario = {
			id_evaluacion: evaluacion.id_evaluacion,
			id_trabajo_grado: evaluacion.id_trabajo_grado,
			id_usuario: evaluacion.id_usuario,
			nota: evaluacion.nota,
			veredicto: evaluacion.veredicto,
			observaciones: evaluacion.observaciones,
			fecha_evaluacion: evaluacion.fecha_evaluacion,
			estado: evaluacion.estado
		};

		modalAbierto = true;
	}

	function cerrarModal() {
		modalAbierto = false;
	}

	function verEvaluacion(evaluacion) {
		evaluacionSeleccionada = evaluacion;
		modalVer = true;
	}

	function cerrarModalVer() {
		modalVer = false;
		evaluacionSeleccionada = null;
	}

	function guardarEvaluacion() {
		if (
			!formulario.id_trabajo_grado ||
			!formulario.id_usuario ||
			formulario.nota === ''
		) {
			alert('Completa los campos obligatorios.');
			return;
		}

		const nota = Number(formulario.nota);

		if (nota < 0 || nota > 5) {
			alert('La nota debe estar entre 0 y 5.');
			return;
		}

		if (modoEdicion) {
			const indice = evaluaciones.findIndex(
				(item) => item.id_evaluacion === formulario.id_evaluacion
			);

			if (indice !== -1) {
				evaluaciones[indice] = {
					...formulario,
					id_trabajo_grado: Number(formulario.id_trabajo_grado),
					id_usuario: Number(formulario.id_usuario),
					nota: nota
				};
			}
		} else {
			const nuevoId =
				evaluaciones.length > 0
					? Math.max(...evaluaciones.map((item) => item.id_evaluacion)) + 1
					: 1;

			evaluaciones.push({
				...formulario,
				id_evaluacion: nuevoId,
				id_trabajo_grado: Number(formulario.id_trabajo_grado),
				id_usuario: Number(formulario.id_usuario),
				nota: nota
			});
		}

		cerrarModal();
	}

	function confirmarEliminar(evaluacion) {
		evaluacionAEliminar = evaluacion;
		modalEliminar = true;
	}

	function cerrarModalEliminar() {
		modalEliminar = false;
		evaluacionAEliminar = null;
	}

	function eliminarEvaluacion() {
		if (!evaluacionAEliminar) return;

		evaluaciones = evaluaciones.filter(
			(item) => item.id_evaluacion !== evaluacionAEliminar.id_evaluacion
		);

		cerrarModalEliminar();
	}
</script>

<div class="container-fluid py-2">

	<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
		<div>
			<h2 class="fw-bold text-dark mb-1">Evaluaciones</h2>
			<p class="text-muted mb-0">
				Gestión y seguimiento de las evaluaciones de los trabajos de grado.
			</p>
		</div>

		<button
			class="btn btn-primary d-flex align-items-center gap-2"
			type="button"
			onclick={abrirNuevaEvaluacion}
		>
			<i class="bi bi-plus-lg"></i>
			Nueva evaluación
		</button>
	</div>

	<div class="card border-0 shadow-sm mb-4">
		<div class="card-body">
			<div class="row g-3 align-items-center">

				<div class="col-12 col-md-6">
					<div class="input-group">
						<span class="input-group-text bg-light border-end-0">
							<i class="bi bi-search text-muted"></i>
						</span>

						<input
							type="search"
							class="form-control border-start-0 bg-light"
							placeholder="Buscar evaluación..."
							bind:value={busqueda}
						/>
					</div>
				</div>

				<div class="col-12 col-md-6 text-md-end">
					<span class="text-muted small">
						{evaluacionesFiltradas.length} evaluación(es)
					</span>
				</div>

			</div>
		</div>
	</div>

	<div class="card border-0 shadow-sm">
		<div class="card-body p-0">

			<div class="table-responsive">
				<table class="table table-hover align-middle mb-0">

					<thead class="table-light">
						<tr>
							<th class="px-3">ID</th>
							<th>Trabajo de grado</th>
							<th>Evaluador</th>
							<th>Nota</th>
							<th>Veredicto</th>
							<th>Fecha</th>
							<th>Estado</th>
							<th class="text-end px-3">Acciones</th>
						</tr>
					</thead>

					<tbody>
						{#if evaluacionesFiltradas.length > 0}

							{#each evaluacionesFiltradas as evaluacion}
								<tr>

									<td class="px-3 fw-semibold">
										#{evaluacion.id_evaluacion}
									</td>

									<td>
										<div class="fw-semibold text-dark">
											{obtenerTituloTrabajo(evaluacion.id_trabajo_grado)}
										</div>

										<small class="text-muted">
											ID trabajo: {evaluacion.id_trabajo_grado}
										</small>
									</td>

									<td>
										<div class="fw-semibold">
											{obtenerNombreUsuario(evaluacion.id_usuario)}
										</div>

										<small class="text-muted">
											ID usuario: {evaluacion.id_usuario}
										</small>
									</td>

									<td>
										<span class="fw-bold fs-6 {obtenerClaseNota(evaluacion.nota)}">
											{evaluacion.nota}
										</span>
										<span class="text-muted"> / 5.0</span>
									</td>

									<td>
										{#if evaluacion.veredicto}
											<span class="badge bg-primary-subtle text-primary">
												{evaluacion.veredicto}
											</span>
										{:else}
											<span class="text-muted">Sin veredicto</span>
										{/if}
									</td>

									<td>
										{evaluacion.fecha_evaluacion || 'Sin fecha'}
									</td>

									<td>
										<span class="badge {obtenerClaseEstado(evaluacion.estado)}">
											{obtenerTextoEstado(evaluacion.estado)}
										</span>
									</td>

									<td class="text-end px-3">
										<div class="d-flex justify-content-end gap-1">

											<button
												type="button"
												class="btn btn-sm btn-light"
												title="Ver"
												onclick={() => verEvaluacion(evaluacion)}
											>
												<i class="bi bi-eye"></i>
											</button>

											<button
												type="button"
												class="btn btn-sm btn-light"
												title="Editar"
												onclick={() => abrirEditarEvaluacion(evaluacion)}
											>
												<i class="bi bi-pencil"></i>
											</button>

											<button
												type="button"
												class="btn btn-sm btn-light text-danger"
												title="Eliminar"
												onclick={() => confirmarEliminar(evaluacion)}
											>
												<i class="bi bi-trash"></i>
											</button>

										</div>
									</td>

								</tr>
							{/each}

						{:else}

							<tr>
								<td colspan="8" class="text-center py-5">
									<div class="text-muted">
										<i class="bi bi-clipboard-x fs-1 d-block mb-2"></i>
										No se encontraron evaluaciones.
									</div>
								</td>
							</tr>

						{/if}
					</tbody>

				</table>
			</div>

		</div>
	</div>

</div>


<!-- MODAL CREAR / EDITAR -->

{#if modalAbierto}
	<div class="modal-backdrop-custom" onclick={cerrarModal} role="presentation">

		<div
			class="modal-dialog modal-lg modal-dialog-centered"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>

			<div class="modal-content border-0 shadow-lg">

				<div class="modal-header">
					<h5 class="modal-title fw-bold">
						{modoEdicion ? 'Editar evaluación' : 'Nueva evaluación'}
					</h5>

					<button
						type="button"
						class="btn-close"
						aria-label="Cerrar"
						onclick={cerrarModal}
					></button>
				</div>

				<div class="modal-body">

					<div class="row g-3">

						<div class="col-12">
							<label for="trabajoGrado" class="form-label fw-semibold">
								Trabajo de grado *
							</label>

							<select
								id="trabajoGrado"
								class="form-select"
								bind:value={formulario.id_trabajo_grado}
							>
								<option value="">Seleccionar trabajo...</option>

								{#each trabajosGrado as trabajo}
									<option value={trabajo.id}>
										{trabajo.titulo}
									</option>
								{/each}
							</select>
						</div>

						<div class="col-md-6">
							<label for="usuario" class="form-label fw-semibold">
								Evaluador *
							</label>

							<select
								id="usuario"
								class="form-select"
								bind:value={formulario.id_usuario}
							>
								<option value="">Seleccionar usuario...</option>

								{#each usuarios as usuarioItem}
									<option value={usuarioItem.id}>
										{usuarioItem.nombre}
									</option>
								{/each}
							</select>
						</div>

						<div class="col-md-6">
							<label for="nota" class="form-label fw-semibold">
								Nota *
							</label>

							<input
								id="nota"
								type="number"
								class="form-control"
								min="0"
								max="5"
								step="0.1"
								placeholder="Ej: 4.5"
								bind:value={formulario.nota}
							/>

							<small class="text-muted">
								La nota debe estar entre 0 y 5.
							</small>
						</div>

						<div class="col-md-6">
							<label for="veredicto" class="form-label fw-semibold">
								Veredicto
							</label>

							<select
								id="veredicto"
								class="form-select"
								bind:value={formulario.veredicto}
							>
								<option value="">Seleccionar veredicto...</option>
								<option value="Aprobado">Aprobado</option>
								<option value="Aprobado con observaciones">
									Aprobado con observaciones
								</option>
								<option value="No aprobado">No aprobado</option>
							</select>
						</div>

						<div class="col-md-6">
							<label for="fechaEvaluacion" class="form-label fw-semibold">
								Fecha de evaluación
							</label>

							<input
								id="fechaEvaluacion"
								type="date"
								class="form-control"
								bind:value={formulario.fecha_evaluacion}
							/>
						</div>

						<div class="col-12">
							<label for="observaciones" class="form-label fw-semibold">
								Observaciones
							</label>

							<textarea
								id="observaciones"
								class="form-control"
								rows="4"
								placeholder="Escribe las observaciones de la evaluación..."
								bind:value={formulario.observaciones}
							></textarea>
						</div>

						<div class="col-12">
							<div class="form-check form-switch">
								<input
									id="estado"
									class="form-check-input"
									type="checkbox"
									bind:checked={formulario.estado}
								/>

								<label for="estado" class="form-check-label fw-semibold">
									Evaluación activa
								</label>
							</div>
						</div>

					</div>

				</div>

				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-light"
						onclick={cerrarModal}
					>
						Cancelar
					</button>

					<button
						type="button"
						class="btn btn-primary"
						onclick={guardarEvaluacion}
					>
						<i class="bi bi-check-lg me-1"></i>
						{modoEdicion ? 'Guardar cambios' : 'Crear evaluación'}
					</button>
				</div>

			</div>

		</div>

	</div>
{/if}


<!-- MODAL VER -->

{#if modalVer && evaluacionSeleccionada}
	<div class="modal-backdrop-custom" onclick={cerrarModalVer} role="presentation">

		<div
			class="modal-dialog modal-lg modal-dialog-centered"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>

			<div class="modal-content border-0 shadow-lg">

				<div class="modal-header">
					<h5 class="modal-title fw-bold">
						Detalle de evaluación #{evaluacionSeleccionada.id_evaluacion}
					</h5>

					<button
						type="button"
						class="btn-close"
						aria-label="Cerrar"
						onclick={cerrarModalVer}
					></button>
				</div>

				<div class="modal-body">

					<div class="row g-3">

						<div class="col-12">
							<div class="detail-box">
								<small class="text-muted d-block mb-1">
									Trabajo de grado
								</small>

								<strong>
									{obtenerTituloTrabajo(
										evaluacionSeleccionada.id_trabajo_grado
									)}
								</strong>
							</div>
						</div>

						<div class="col-md-6">
							<div class="detail-box">
								<small class="text-muted d-block mb-1">
									Evaluador
								</small>

								<strong>
									{obtenerNombreUsuario(
										evaluacionSeleccionada.id_usuario
									)}
								</strong>
							</div>
						</div>

						<div class="col-md-6">
							<div class="detail-box">
								<small class="text-muted d-block mb-1">
									Nota
								</small>

								<strong class="fs-4 {obtenerClaseNota(evaluacionSeleccionada.nota)}">
									{evaluacionSeleccionada.nota} / 5.0
								</strong>
							</div>
						</div>

						<div class="col-md-6">
							<div class="detail-box">
								<small class="text-muted d-block mb-1">
									Veredicto
								</small>

								<strong>
									{evaluacionSeleccionada.veredicto || 'Sin veredicto'}
								</strong>
							</div>
						</div>

						<div class="col-md-6">
							<div class="detail-box">
								<small class="text-muted d-block mb-1">
									Fecha de evaluación
								</small>

								<strong>
									{evaluacionSeleccionada.fecha_evaluacion || 'Sin fecha'}
								</strong>
							</div>
						</div>

						<div class="col-12">
							<div class="detail-box">
								<small class="text-muted d-block mb-1">
									Observaciones
								</small>

								<p class="mb-0">
									{evaluacionSeleccionada.observaciones ||
										'Sin observaciones registradas.'}
								</p>
							</div>
						</div>

						<div class="col-12">
							<div class="detail-box d-flex align-items-center justify-content-between">
								<span class="fw-semibold">Estado</span>

								<span
									class="badge {obtenerClaseEstado(
										evaluacionSeleccionada.estado
									)}"
								>
									{obtenerTextoEstado(evaluacionSeleccionada.estado)}
								</span>
							</div>
						</div>

					</div>

				</div>

				<div class="modal-footer">
					<button
						type="button"
						class="btn btn-light"
						onclick={cerrarModalVer}
					>
						Cerrar
					</button>
				</div>

			</div>

		</div>

	</div>
{/if}


<!-- MODAL ELIMINAR -->

{#if modalEliminar && evaluacionAEliminar}
	<div class="modal-backdrop-custom" onclick={cerrarModalEliminar} role="presentation">

		<div
			class="modal-dialog modal-dialog-centered"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>

			<div class="modal-content border-0 shadow-lg">

				<div class="modal-header">
					<h5 class="modal-title fw-bold">
						Eliminar evaluación
					</h5>

					<button
						type="button"
						class="btn-close"
						aria-label="Cerrar"
						onclick={cerrarModalEliminar}
					></button>
				</div>

				<div class="modal-body text-center py-4">

					<div class="text-danger mb-3">
						<i class="bi bi-exclamation-triangle-fill fs-1"></i>
					</div>

					<h5 class="fw-bold">
						¿Deseas eliminar esta evaluación?
					</h5>

					<p class="text-muted mb-0">
						La evaluación #{evaluacionAEliminar.id_evaluacion} será eliminada
						de los datos de prueba.
					</p>

				</div>

				<div class="modal-footer justify-content-center">

					<button
						type="button"
						class="btn btn-light"
						onclick={cerrarModalEliminar}
					>
						Cancelar
					</button>

					<button
						type="button"
						class="btn btn-danger"
						onclick={eliminarEvaluacion}
					>
						<i class="bi bi-trash me-1"></i>
						Eliminar
					</button>

				</div>

			</div>

		</div>

	</div>
{/if}


<style>
	.modal-backdrop-custom {
		position: fixed;
		inset: 0;
		z-index: 1050;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		overflow-y: auto;
	}

	.modal-dialog {
		width: 100%;
		max-width: 900px;
		margin: auto;
	}

	.detail-box {
		background: #f8f9fa;
		border-radius: 0.75rem;
		padding: 1rem;
		border: 1px solid #e9ecef;
	}

	.table th {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		color: #6c757d;
		white-space: nowrap;
	}

	.table td {
		font-size: 0.9rem;
	}

	.badge {
		font-weight: 600;
		padding: 0.45em 0.7em;
	}

	@media (max-width: 767.98px) {
		.table {
			min-width: 950px;
		}

		.modal-backdrop-custom {
			align-items: flex-start;
			padding-top: 2rem;
		}
	}
</style>