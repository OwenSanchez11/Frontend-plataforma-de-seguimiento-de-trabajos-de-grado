<script>

	import {onMount} from 'svelte';
	import { getEvaluaciones, getCarreras, getFacultades, getTrabajos, getAvances, crearEvaluacion, editarEvaluacion } from '$lib/api';
	import DataTableWrapper from '$lib/components/DataTableWrapper.svelte';

	let evaluaciones = $state([]);
	let facultades = $state([]);
	let carreras = $state([]);
	let trabajosGrado = $state([]);
	let avances = $state([]);
	let guardando = $state(false);

	let idFacultad= $state('');
	let idCarrera = $state('');
	let cargando = $state(false);
	let error = $state('');

	let busqueda = $state('');
	let modalAbierto = $state(false);
	let modalVer = $state(false);
	let modalEliminar = $state(false);
	let modoEdicion = $state(false);

	let evaluacionSeleccionada = $state(null);
	let evaluacionAEliminar = $state(null);

	let carrerasFiltradas = $derived(
		idFacultad ? carreras.filter((c) => c.id_facultad === Number(idFacultad)) : carreras 
	);

	async function cargarEvaluaciones() {
		cargando = true;
		error = '';
		try{
			evaluaciones = await getEvaluaciones({ idFacultad, idCarrera });
		} catch(e) {
			error = 'No se pudieron cargar las evaluaciones';
			console.error(e);
		} finally {
			cargando = false;
		}
	}

	function cambiarFacultad() {
		idCarrera = '';
		cargarEvaluaciones();
	}
 
	onMount(async () => {
		cargarEvaluaciones();

		const [resFacultades, resCarreras, resTrabajos, resAvances] = await Promise.allSettled([
			getFacultades(),
			getCarreras(),
			getTrabajos(),
			getAvances()
		]);

		if (resFacultades.status === 'fulfilled') {
		facultades = resFacultades.value;
		} else {
			console.error(resFacultades.reason);
			error = 'No se pudieron cargar las facultades.';
		}

		if (resCarreras.status === 'fulfilled') {
		carreras = resCarreras.value;
		} else {
			console.error(resCarreras.reason);
			error = 'No se pudieron cargar las carreras.';
		}

		if (resTrabajos.status === 'fulfilled') {
			trabajosGrado = resTrabajos.value;
		} else {
			console.error(resTrabajos.reason);
			error = 'No se pudieron cargar los trabajos de grado.';
		}

		if (resAvances.status === 'fulfilled') {
			avances = resAvances.value;
		} else {
			console.error(resAvances.reason);
			error = 'No se pudieron cargar los avances.';
		}
	});

	let formulario = $state({
		id_evaluacion: null,
		id_trabajo_grado: '',
		id_avance: '',
		nota: '',
		veredicto: '',
		observaciones: '',
		fecha_evaluacion: '',
		estado: true
	});

	let evaluacionesFiltradas = $derived(
		evaluaciones.filter((evaluacion) => {
			const texto = busqueda.toLowerCase();

			const trabajo = obtenerTituloTrabajo(evaluacion.id_trabajo_grado).toLowerCase();
			const avance = obtenerTituloAvance(evaluacion.id_avance).toLowerCase();
			const veredicto = (evaluacion.veredicto || '').toLowerCase();

			return (
				String(evaluacion.id_evaluacion).includes(texto) ||
				trabajo.includes(texto) ||
				avance.includes(texto) ||
				veredicto.includes(texto)
			);
		})
	);

	function obtenerTituloTrabajo(id) {
		const trabajo = trabajosGrado.find((item) => item.id_trabajo_grado === Number(id));
		return trabajo ? trabajo.titulo : `Trabajo #${id}`;
	}

	function obtenerTituloAvance(id) {
		const avance = avances.find((item) => Number(item.id_avance) === Number(id));
		return avance ? avance.titulo : `Avance #${id}`;
	}

	let avancesDelTrabajo = $derived(
		formulario.id_trabajo_grado
			? avances.filter((avance) => Number(avance.id_trabajo_grado) === Number(formulario.id_trabajo_grado))
			: []
	);

	function cambiarTrabajoSeleccionado() {
		formulario.id_avance = '';
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
			id_avance: '',
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
			id_avance: evaluacion.id_avance ?? '',
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

	async function guardarEvaluacion() {
		console.log('formulario:', $state.snapshot(formulario));
		if (
			!formulario.id_trabajo_grado ||
			!formulario.id_avance ||
			!formulario.veredicto ||
			formulario.nota === '' ||
			formulario.nota == null
		) {
			alert('Completa los campos obligatorios.');
			return;
		}

		const nota = Number(formulario.nota);

		if (nota < 0 || nota > 5) {
			alert('La nota debe estar entre 0 y 5.');
			return;
		}

		const datos = {
			id_trabajo_grado: Number(formulario.id_trabajo_grado),
			id_avance: Number(formulario.id_avance),
			nota,
			veredicto: formulario.veredicto || null,
			observaciones: formulario.observaciones || null,
			fecha_evaluacion: formulario.fecha_evaluacion || null,
			estado: formulario.estado

		}

		guardando = true;

		try {
			if(modoEdicion) {
				await editarEvaluacion(formulario.id_evaluacion, datos);
			} else{
				await crearEvaluacion(datos);
			}
			await cargarEvaluaciones();
			cerrarModal();
		} catch (error) {
			console.error(error);
			alert(error.message || 'No se pudo guardar la evaluación.');
		} finally {
			guardando = false;
		}
	}

	async function desactivarEvaluacion() {
		if (!evaluacionAEliminar) return;

		try {
			await editarEvaluacion(evaluacionAEliminar.id_evaluacion, {
				...evaluacionAEliminar,
				estado:false
			
			});
			await cargarEvaluaciones();
			cerrarModalEliminar();
				
		} catch (error) {
			console.error(error);
			alert(error.message || 'No se pudo desactivar la evaluación.');
		}
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

	const escaparHtml = (valor) => String(valor ?? '').replace(/[&<>"']/g, (caracter) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[caracter]);

	let filasTabla = $derived(evaluacionesFiltradas.map((ev) => ({
		id_evaluacion: ev.id_evaluacion,
		evaluacionHtml: `<div class="fw-semibold">${escaparHtml(obtenerTituloTrabajo(ev.id_trabajo_grado))}</div><small class="text-muted">${escaparHtml(obtenerTituloAvance(ev.id_avance))}</small>`,
		notaHtml: `<span class="${obtenerClaseNota(ev.nota)}">${escaparHtml(ev.nota ?? 'Sin nota')} / 5.0</span>`,
		veredictoHtml: `<span>${escaparHtml(ev.veredicto || 'Pendiente')}</span>`,
		fechaHtml: `<span class="text-muted small">${escaparHtml(ev.fecha_evaluacion || 'Sin fecha')}</span>`,
		estadoHtml: `<span class="badge ${ev.estado ? 'text-bg-success' : 'text-bg-secondary'}">${obtenerTextoEstado(ev.estado)}</span>`,
		accionesHtml: `<div class="d-flex justify-content-end gap-1"><button class="btn btn-sm btn-light" title="Ver detalles" aria-label="Ver evaluación" data-accion="detalle" data-id="${escaparHtml(ev.id_evaluacion)}"><i class="bi bi-eye"></i></button><button class="btn btn-sm btn-light" title="Editar" aria-label="Editar evaluación" data-accion="editar" data-id="${escaparHtml(ev.id_evaluacion)}"><i class="bi bi-pencil"></i></button>${ev.estado ? `<button class="btn btn-sm btn-light text-danger" title="Desactivar" aria-label="Desactivar evaluación" data-accion="desactivar" data-id="${escaparHtml(ev.id_evaluacion)}"><i class="bi bi-slash-circle"></i></button>` : ''}</div>`
	})));

	const columnasEvaluaciones = [
		{ data: 'id_evaluacion', title: 'ID' },
		{ data: 'evaluacionHtml', title: 'Trabajo de grado' },
		{ data: 'notaHtml', title: 'Nota', orderable: false },
		{ data: 'veredictoHtml', title: 'Veredicto' },
		{ data: 'fechaHtml', title: 'Fecha' },
		{ data: 'estadoHtml', title: 'Estado', orderable: false, searchable: false },
		{ data: 'accionesHtml', title: 'Acciones', orderable: false, searchable: false }
	]

	function manejarAccionTabla(accion, id) {
		const evaluacion = evaluaciones.find((item) => String(item.id_evaluacion) === String(id));
		if (!evaluacion) return;

		if (accion === 'detalle') verEvaluacion(evaluacion);
		if (accion === 'editar') abrirEditarEvaluacion(evaluacion);
		if (accion === 'desactivar') confirmarEliminar(evaluacion);
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

				<div class="col-12 col-md-4">
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

				<div class="col-6 col-md-3">
					<select 
						class="form-select" 
						aria-label="Filtrar por facultad" 
						bind:value={idFacultad} 
						onchange={cambiarFacultad}
					>
						<option value="">Todas las facultades</option>
						{#each facultades as f}
							<option value={f.id_facultad}>{f.nombre_facultad}</option>
						{/each}
					</select>
				</div>

				<div class="col-6 col-md-3">
					<select class="form-select" aria-label="filtrar por carreras" bind:value={idCarrera} onchange={cargarEvaluaciones}>
						<option value="">Todas las carreras</option>
						{#each carrerasFiltradas as c}
							<option value={c.id_carrera}>{c.nombre_carrera}</option>
						{/each}
					</select>
				</div>


				<div class="col-12 col-md-2 text-md-end">
					<span class="text-muted small">
						{evaluacionesFiltradas.length} evaluacion(es)
					</span>
				</div>
			</div>
		</div>
	</div>

	 {#if cargando}
        <p class="text-center py-5 text-muted mb-0">Cargando evaluaciones...</p>
    {:else if error}
        <p class="text-center py-5 text-danger mb-0">{error}</p>
    {:else}
		<div class="table-responsive">
			<DataTableWrapper columnas={columnasEvaluaciones} filas={filasTabla} onAccion={manejarAccionTabla} />
		</div>
	{/if}
		

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
				onchange={cambiarTrabajoSeleccionado}
							>
								<option value="">Seleccionar trabajo...</option>

								{#each trabajosGrado as trabajo}
									<option value={trabajo.id_trabajo_grado}>
										{trabajo.titulo}
									</option>
								{/each}
							</select>
						</div>

						<div class="col-md-6">
							<label for="avance" class="form-label fw-semibold">
								Avance *
							</label>

							<select
								id="avance"
								class="form-select"
								bind:value={formulario.id_avance}
							>
								<option value="">Seleccionar avance...</option>

								{#each avancesDelTrabajo as avance (avance.id_avance)}
									<option value={avance.id_avance}>
										#{avance.id_avance} · {avance.titulo}{avance.numero_version ? ` (v${avance.numero_version})` : ''}
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
						disabled={guardando}
					>
						<i class="bi bi-check-lg me-1"></i>
						{guardando ? 'Guardando...' : modoEdicion ? 'Guardar cambios' : 'Crear evaluación'}
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

						<div class="col-12">
							<div class="detail-box">
								<small class="text-muted d-block mb-1">Avance evaluado</small>
								<strong>{obtenerTituloAvance(evaluacionSeleccionada.id_avance)}</strong>
								<small class="text-muted d-block">ID: {evaluacionSeleccionada.id_avance}</small>
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
						Desactivar evaluación
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
						¿Deseas desactivar esta evaluación?
					</h5>

					<p class="text-muted mb-0">
						La evaluación #{evaluacionAEliminar.id_evaluacion} será desactivada
						podrás reactivarla editandola
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
						onclick={desactivarEvaluacion}
					>
						<i class="bi bi-trash me-1"></i>
						desactivar
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

	.modal-content {
		background-color: #fff;
		color: #212529;
		opacity: 1;
		padding: 0.75rem;
		border-radius: 1rem;
		overflow: hidden;
	}

	.modal-header,
	.modal-body,
	.modal-footer {
		background-color: #fff;
	}

	.modal-content .form-control,
	.modal-content .form-select {
		background-color: #fff;
		color: #212529;
		border-color: #ced4da;
	}

	.modal-content .form-control::placeholder {
		color: #6c757d;
		opacity: 1;
	}

	.modal-content .form-select option {
		background-color: #fff;
		color: #212529;
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
