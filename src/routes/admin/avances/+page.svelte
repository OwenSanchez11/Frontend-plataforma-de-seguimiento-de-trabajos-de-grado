<script>
	let busqueda = $state('');
	let modalAbierto = $state(false);
	let modalVer = $state(false);
	let modalEliminar = $state(false);
	let modoEdicion = $state(false);

	let avanceSeleccionado = $state(null);
	let avanceAEliminar = $state(null);

	let formulario = $state({
		id_avance: null,
		id_trabajo_grado: '',
		titulo: '',
		subido_por: '',
		descripcion: '',
		numero_version: '',
		nombre_archivo: '',
		ruta_archivo: '',
		tamano_bytes: '',
		fecha_inicio: '',
		fecha_limite: '',
		estado: true
	});

	let avances = $state([
		{
			id_avance: 1,
			id_trabajo_grado: 1,
			titulo: 'Planteamiento del proyecto',
			subido_por: 15,
			descripcion: 'Primer avance correspondiente al planteamiento y definición del proyecto.',
			numero_version: 1,
			nombre_archivo: 'planteamiento_proyecto.pdf',
			ruta_archivo: '/archivos/avances/planteamiento_proyecto.pdf',
			tamano_bytes: 2457600,
			fecha_inicio: '2026-02-10T08:00',
			fecha_limite: '2026-03-10T23:59',
			estado: true
		},
		{
			id_avance: 2,
			id_trabajo_grado: 2,
			titulo: 'Diseño de la solución',
			subido_por: 18,
			descripcion: 'Documento con el diseño inicial de la solución propuesta.',
			numero_version: 2,
			nombre_archivo: 'diseno_solucion.pdf',
			ruta_archivo: '/archivos/avances/diseno_solucion.pdf',
			tamano_bytes: 3845120,
			fecha_inicio: '2026-03-15T09:30',
			fecha_limite: '2026-04-15T23:59',
			estado: true
		},
		{
			id_avance: 3,
			id_trabajo_grado: 3,
			titulo: 'Implementación del sistema',
			subido_por: 21,
			descripcion: 'Avance relacionado con la implementación de los módulos principales.',
			numero_version: 3,
			nombre_archivo: 'implementacion_sistema.zip',
			ruta_archivo: '/archivos/avances/implementacion_sistema.zip',
			tamano_bytes: 12582912,
			fecha_inicio: '2026-04-20T10:00',
			fecha_limite: '2026-05-20T23:59',
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

	let avancesFiltrados = $derived(
		avances.filter((avance) => {
			const texto = busqueda.toLowerCase();

			const trabajo = obtenerTituloTrabajo(avance.id_trabajo_grado).toLowerCase();
			const usuario = obtenerNombreUsuario(avance.subido_por).toLowerCase();
			const titulo = (avance.titulo || '').toLowerCase();
			const archivo = (avance.nombre_archivo || '').toLowerCase();

			return (
				String(avance.id_avance).includes(texto) ||
				trabajo.includes(texto) ||
				usuario.includes(texto) ||
				titulo.includes(texto) ||
				archivo.includes(texto)
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

	function obtenerClaseEstado(estado) {
		return estado ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger';
	}

	function obtenerTextoEstado(estado) {
		return estado ? 'Activo' : 'Inactivo';
	}

	function formatearTamano(bytes) {
		if (!bytes || bytes <= 0) return 'Sin tamaño';

		if (bytes < 1024) {
			return `${bytes} B`;
		}

		if (bytes < 1024 * 1024) {
			return `${(bytes / 1024).toFixed(2)} KB`;
		}

		if (bytes < 1024 * 1024 * 1024) {
			return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
		}

		return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
	}

	function formatearFecha(fecha) {
		if (!fecha) return 'Sin fecha';

		const fechaFormateada = new Date(fecha);

		if (Number.isNaN(fechaFormateada.getTime())) {
			return fecha;
		}

		return fechaFormateada.toLocaleString('es-CO', {
			dateStyle: 'short',
			timeStyle: 'short'
		});
	}

	function abrirNuevoAvance() {
		modoEdicion = false;

		formulario = {
			id_avance: null,
			id_trabajo_grado: '',
			titulo: '',
			subido_por: '',
			descripcion: '',
			numero_version: '',
			nombre_archivo: '',
			ruta_archivo: '',
			tamano_bytes: '',
			fecha_inicio: '',
			fecha_limite: '',
			estado: true
		};

		modalAbierto = true;
	}

	function abrirEditarAvance(avance) {
		modoEdicion = true;

		formulario = {
			id_avance: avance.id_avance,
			id_trabajo_grado: avance.id_trabajo_grado,
			titulo: avance.titulo,
			subido_por: avance.subido_por,
			descripcion: avance.descripcion,
			numero_version: avance.numero_version,
			nombre_archivo: avance.nombre_archivo,
			ruta_archivo: avance.ruta_archivo,
			tamano_bytes: avance.tamano_bytes,
			fecha_inicio: avance.fecha_inicio,
			fecha_limite: avance.fecha_limite,
			estado: avance.estado
		};

		modalAbierto = true;
	}

	function cerrarModal() {
		modalAbierto = false;
	}

	function verAvance(avance) {
		avanceSeleccionado = avance;
		modalVer = true;
	}

	function cerrarModalVer() {
		modalVer = false;
		avanceSeleccionado = null;
	}

	function guardarAvance() {
		if (
			!formulario.id_trabajo_grado ||
			!formulario.titulo.trim() ||
			!formulario.subido_por
		) {
			alert('Completa los campos obligatorios.');
			return;
		}

		if (modoEdicion) {
			const indice = avances.findIndex(
				(item) => item.id_avance === formulario.id_avance
			);

			if (indice !== -1) {
				avances[indice] = {
					...formulario,
					id_trabajo_grado: Number(formulario.id_trabajo_grado),
					subido_por: Number(formulario.subido_por),
					numero_version:
						formulario.numero_version === ''
							? null
							: Number(formulario.numero_version),
					tamano_bytes:
						formulario.tamano_bytes === ''
							? null
							: Number(formulario.tamano_bytes)
				};
			}
		} else {
			const nuevoId =
				avances.length > 0
					? Math.max(...avances.map((item) => item.id_avance)) + 1
					: 1;

			avances.push({
				...formulario,
				id_avance: nuevoId,
				id_trabajo_grado: Number(formulario.id_trabajo_grado),
				subido_por: Number(formulario.subido_por),
				numero_version:
					formulario.numero_version === ''
						? null
						: Number(formulario.numero_version),
				tamano_bytes:
					formulario.tamano_bytes === ''
						? null
						: Number(formulario.tamano_bytes)
			});
		}

		cerrarModal();
	}

	function confirmarEliminar(avance) {
		avanceAEliminar = avance;
		modalEliminar = true;
	}

	function cerrarModalEliminar() {
		modalEliminar = false;
		avanceAEliminar = null;
	}

	function eliminarAvance() {
		if (!avanceAEliminar) return;

		avances = avances.filter(
			(item) => item.id_avance !== avanceAEliminar.id_avance
		);

		cerrarModalEliminar();
	}
</script>

<div class="container-fluid py-2">

	<div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
		<div>
			<h2 class="fw-bold text-dark mb-1">Avances</h2>
			<p class="text-muted mb-0">
				Gestión y seguimiento de los avances de los trabajos de grado.
			</p>
		</div>

		<button
			class="btn btn-primary d-flex align-items-center gap-2"
			type="button"
			onclick={abrirNuevoAvance}
		>
			<i class="bi bi-plus-lg"></i>
			Nuevo avance
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
							placeholder="Buscar avance..."
							bind:value={busqueda}
						/>

					</div>
				</div>

				<div class="col-12 col-md-6 text-md-end">
					<span class="text-muted small">
						{avancesFiltrados.length} avance(s)
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
							<th>Avance</th>
							<th>Trabajo de grado</th>
							<th>Subido por</th>
							<th>Versión</th>
							<th>Archivo</th>
							<th>Fecha límite</th>
							<th>Estado</th>
							<th class="text-end px-3">Acciones</th>
						</tr>
					</thead>

					<tbody>

						{#if avancesFiltrados.length > 0}

							{#each avancesFiltrados as avance}

								<tr>

									<td class="px-3 fw-semibold">
										#{avance.id_avance}
									</td>

									<td>
										<div class="fw-semibold text-dark">
											{avance.titulo}
										</div>

										{#if avance.descripcion}
											<small class="text-muted">
												{avance.descripcion.length > 55
													? `${avance.descripcion.substring(0, 55)}...`
													: avance.descripcion}
											</small>
										{/if}
									</td>

									<td>
										<div class="fw-semibold">
											{obtenerTituloTrabajo(avance.id_trabajo_grado)}
										</div>

										<small class="text-muted">
											ID: {avance.id_trabajo_grado}
										</small>
									</td>

									<td>
										<div class="fw-semibold">
											{obtenerNombreUsuario(avance.subido_por)}
										</div>

										<small class="text-muted">
											ID: {avance.subido_por}
										</small>
									</td>

									<td>
										<span class="badge bg-primary-subtle text-primary">
											v{avance.numero_version || 1}
										</span>
									</td>

									<td>
										<div class="fw-semibold text-truncate archivo-nombre">
											{avance.nombre_archivo || 'Sin archivo'}
										</div>

										<small class="text-muted">
											{formatearTamano(avance.tamano_bytes)}
										</small>
									</td>

									<td>
										{formatearFecha(avance.fecha_limite)}
									</td>

									<td>
										<span class="badge {obtenerClaseEstado(avance.estado)}">
											{obtenerTextoEstado(avance.estado)}
										</span>
									</td>

									<td class="text-end px-3">

										<div class="d-flex justify-content-end gap-1">

											<button
												type="button"
												class="btn btn-sm btn-light"
												title="Ver"
												onclick={() => verAvance(avance)}
											>
												<i class="bi bi-eye"></i>
											</button>

											<button
												type="button"
												class="btn btn-sm btn-light"
												title="Editar"
												onclick={() => abrirEditarAvance(avance)}
											>
												<i class="bi bi-pencil"></i>
											</button>

											<button
												type="button"
												class="btn btn-sm btn-light text-danger"
												title="Eliminar"
												onclick={() => confirmarEliminar(avance)}
											>
												<i class="bi bi-trash"></i>
											</button>

										</div>

									</td>

								</tr>

							{/each}

						{:else}

							<tr>
								<td colspan="9" class="text-center py-5">

									<div class="text-muted">
										<i class="bi bi-graph-up fs-1 d-block mb-2"></i>
										No se encontraron avances.
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

	<div
		class="modal-backdrop-custom"
		onclick={cerrarModal}
		role="presentation"
	>

		<div
			class="modal-dialog modal-xl modal-dialog-centered"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>

			<div class="modal-content border-0 shadow-lg">

				<div class="modal-header">

					<h5 class="modal-title fw-bold">
						{modoEdicion ? 'Editar avance' : 'Nuevo avance'}
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

						<div class="col-md-6">

							<label for="trabajoGrado" class="form-label fw-semibold">
								Trabajo de grado *
							</label>

							<select
								id="trabajoGrado"
								class="form-select"
								bind:value={formulario.id_trabajo_grado}
							>

								<option value="">
									Seleccionar trabajo...
								</option>

								{#each trabajosGrado as trabajo}

									<option value={trabajo.id}>
										{trabajo.titulo}
									</option>

								{/each}

							</select>

						</div>

						<div class="col-md-6">

							<label for="subidoPor" class="form-label fw-semibold">
								Subido por *
							</label>

							<select
								id="subidoPor"
								class="form-select"
								bind:value={formulario.subido_por}
							>

								<option value="">
									Seleccionar usuario...
								</option>

								{#each usuarios as usuario}

									<option value={usuario.id}>
										{usuario.nombre}
									</option>

								{/each}

							</select>

						</div>

						<div class="col-12">

							<label for="titulo" class="form-label fw-semibold">
								Título *
							</label>

							<input
								id="titulo"
								type="text"
								class="form-control"
								placeholder="Ej: Planteamiento del proyecto"
								bind:value={formulario.titulo}
							/>

						</div>

						<div class="col-md-6">

							<label for="numeroVersion" class="form-label fw-semibold">
								Número de versión
							</label>

							<input
								id="numeroVersion"
								type="number"
								class="form-control"
								min="1"
								placeholder="Ej: 1"
								bind:value={formulario.numero_version}
							/>

						</div>

						<div class="col-md-6">

							<label for="tamanoBytes" class="form-label fw-semibold">
								Tamaño del archivo (bytes)
							</label>

							<input
								id="tamanoBytes"
								type="number"
								class="form-control"
								min="0"
								placeholder="Ej: 2457600"
								bind:value={formulario.tamano_bytes}
							/>

						</div>

						<div class="col-md-6">

							<label for="nombreArchivo" class="form-label fw-semibold">
								Nombre del archivo
							</label>

							<input
								id="nombreArchivo"
								type="text"
								class="form-control"
								placeholder="Ej: avance_1.pdf"
								bind:value={formulario.nombre_archivo}
							/>

						</div>

						<div class="col-md-6">

							<label for="rutaArchivo" class="form-label fw-semibold">
								Ruta del archivo
							</label>

							<input
								id="rutaArchivo"
								type="text"
								class="form-control"
								placeholder="/archivos/avances/archivo.pdf"
								bind:value={formulario.ruta_archivo}
							/>

						</div>

						<div class="col-md-6">

							<label for="fechaInicio" class="form-label fw-semibold">
								Fecha de inicio
							</label>

							<input
								id="fechaInicio"
								type="datetime-local"
								class="form-control"
								bind:value={formulario.fecha_inicio}
							/>

						</div>

						<div class="col-md-6">

							<label for="fechaLimite" class="form-label fw-semibold">
								Fecha límite
							</label>

							<input
								id="fechaLimite"
								type="datetime-local"
								class="form-control"
								bind:value={formulario.fecha_limite}
							/>

						</div>

						<div class="col-12">

							<label for="descripcion" class="form-label fw-semibold">
								Descripción
							</label>

							<textarea
								id="descripcion"
								class="form-control"
								rows="4"
								placeholder="Describe el avance..."
								bind:value={formulario.descripcion}
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
									Avance activo
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
						onclick={guardarAvance}
					>
						<i class="bi bi-check-lg me-1"></i>

						{modoEdicion
							? 'Guardar cambios'
							: 'Crear avance'}
					</button>

				</div>

			</div>

		</div>

	</div>

{/if}


<!-- MODAL VER -->

{#if modalVer && avanceSeleccionado}

	<div
		class="modal-backdrop-custom"
		onclick={cerrarModalVer}
		role="presentation"
	>

		<div
			class="modal-dialog modal-xl modal-dialog-centered"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>

			<div class="modal-content border-0 shadow-lg">

				<div class="modal-header">

					<h5 class="modal-title fw-bold">
						Detalle del avance #{avanceSeleccionado.id_avance}
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
									Título
								</small>

								<strong>
									{avanceSeleccionado.titulo}
								</strong>

							</div>

						</div>

						<div class="col-md-6">

							<div class="detail-box">

								<small class="text-muted d-block mb-1">
									Trabajo de grado
								</small>

								<strong>
									{obtenerTituloTrabajo(
										avanceSeleccionado.id_trabajo_grado
									)}
								</strong>

							</div>

						</div>

						<div class="col-md-6">

							<div class="detail-box">

								<small class="text-muted d-block mb-1">
									Subido por
								</small>

								<strong>
									{obtenerNombreUsuario(
										avanceSeleccionado.subido_por
									)}
								</strong>

							</div>

						</div>

						<div class="col-md-4">

							<div class="detail-box">

								<small class="text-muted d-block mb-1">
									Versión
								</small>

								<strong>
									{avanceSeleccionado.numero_version || 'Sin versión'}
								</strong>

							</div>

						</div>

						<div class="col-md-4">

							<div class="detail-box">

								<small class="text-muted d-block mb-1">
									Tamaño
								</small>

								<strong>
									{formatearTamano(
										avanceSeleccionado.tamano_bytes
									)}
								</strong>

							</div>

						</div>

						<div class="col-md-4">

							<div class="detail-box">

								<small class="text-muted d-block mb-1">
									Estado
								</small>

								<span
									class="badge {obtenerClaseEstado(
										avanceSeleccionado.estado
									)}"
								>
									{obtenerTextoEstado(
										avanceSeleccionado.estado
									)}
								</span>

							</div>

						</div>

						<div class="col-12">

							<div class="detail-box">

								<small class="text-muted d-block mb-1">
									Descripción
								</small>

								<p class="mb-0">
									{avanceSeleccionado.descripcion ||
										'Sin descripción registrada.'}
								</p>

							</div>

						</div>

						<div class="col-md-6">

							<div class="detail-box">

								<small class="text-muted d-block mb-1">
									Nombre del archivo
								</small>

								<strong>
									{avanceSeleccionado.nombre_archivo ||
										'Sin archivo'}
								</strong>

							</div>

						</div>

						<div class="col-md-6">

							<div class="detail-box">

								<small class="text-muted d-block mb-1">
									Ruta del archivo
								</small>

								<strong class="text-break">
									{avanceSeleccionado.ruta_archivo ||
										'Sin ruta'}
								</strong>

							</div>

						</div>

						<div class="col-md-6">

							<div class="detail-box">

								<small class="text-muted d-block mb-1">
									Fecha de inicio
								</small>

								<strong>
									{formatearFecha(
										avanceSeleccionado.fecha_inicio
									)}
								</strong>

							</div>

						</div>

						<div class="col-md-6">

							<div class="detail-box">

								<small class="text-muted d-block mb-1">
									Fecha límite
								</small>

								<strong>
									{formatearFecha(
										avanceSeleccionado.fecha_limite
									)}
								</strong>

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

{#if modalEliminar && avanceAEliminar}

	<div
		class="modal-backdrop-custom"
		onclick={cerrarModalEliminar}
		role="presentation"
	>

		<div
			class="modal-dialog modal-dialog-centered"
			onclick={(e) => e.stopPropagation()}
			role="presentation"
		>

			<div class="modal-content border-0 shadow-lg">

				<div class="modal-header">

					<h5 class="modal-title fw-bold">
						Eliminar avance
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
						¿Deseas eliminar este avance?
					</h5>

					<p class="text-muted mb-0">
						El avance #{avanceAEliminar.id_avance} será eliminado
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
						onclick={eliminarAvance}
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
		max-width: 1100px;
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

	.archivo-nombre {
		max-width: 180px;
	}

	@media (max-width: 767.98px) {
		.table {
			min-width: 1200px;
		}

		.modal-backdrop-custom {
			align-items: flex-start;
			padding-top: 2rem;
		}

		.archivo-nombre {
			max-width: 150px;
		}
	}
</style>