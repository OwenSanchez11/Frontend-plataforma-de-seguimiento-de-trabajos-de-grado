<script>
	import { onMount } from 'svelte';
	import {
		getTrabajoPorEstudiante,
		getAvancePorTrabajo,
		actualizarAvance,
		crearRetroalimentacion
	} from '$lib/api';
	import { sesion } from '$lib/sesion.svelte';
	import { esAprobado, textoEstado, claseEstado, diasRestantes } from '$lib/avances';

	let trabajoGrado = $state(null);
	let integrantes = $state([]);
	let avances = $state([]);
	let cargando = $state(true);
	let error = $state('');
	let sinTrabajo = $state(false);

	// Pestaña activa: 'resumen' o 'avances'
	let pestana = $state('resumen');

	// Formulario de carga de documento (modal)
	let avanceElegido = $state(null); // avance cuyo formulario está abierto
	let formNombre = $state('');
	let formEnlace = $state('');
	let formTamanoMB = $state('');
	let guardando = $state(false);
	let errorSubida = $state('');

	// Solicitud de modificación (modal)
	let solicitudAbierta = $state(false);
	let solAvance = $state('');
	let solMotivo = $state('');
	let solEnviando = $state(false);
	let solError = $state('');
	let solicitudOk = $state(false);

	// Todo lo que no esté aprobado sigue pendiente
	let pendientes = $derived(avances.filter((a) => !esAprobado(a)));
	let conArchivo = $derived(avances.filter((a) => a.ruta_archivo));
	// Pestaña Avances: registro por fecha límite e historial por entrega más reciente
	let avancesOrdenados = $derived(
		[...avances].sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite))
	);
	let historial = $derived(
		[...conArchivo].sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega))
	);

	// El texto debe ser idéntico al nombre en la tabla rol_proyecto
	let director = $derived(integrantes.find((p) => p.rol_proyecto === 'Director'));
	// Comité = quienes tienen rol de proyecto (director y jurados)
	let comite = $derived(integrantes.filter((p) => p.rol_proyecto));

	function formatearFecha(f) {
		if (!f) return '-';
		return new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
	}

	function formatearFechaCorta(f) {
		if (!f) return '-';
		return new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function extension(nombre) {
		return nombre?.split('.').pop()?.toUpperCase() ?? '';
	}

	function formatearTamano(bytes) {
		if (!bytes) return '';
		return (bytes / 1024 / 1024).toFixed(1) + ' MB';
	}

	function nombreCompleto(p) {
		return `${p.nombre} ${p.apellido ?? ''}`.trim();
	}

	function iniciales(p) {
		return ((p.nombre?.[0] ?? '') + (p.apellido?.[0] ?? '')).toUpperCase();
	}

	// Solo se puede cargar si está pendiente, vencido, rechazado o en progreso
	const puedeCargar = (a) => ['Pendiente', 'Vencido', 'Rechazado', 'En progreso'].includes(textoEstado(a));

	function abrirModal(a) {
		avanceElegido = a;
		formNombre = '';
		formEnlace = '';
		formTamanoMB = '';
		errorSubida = '';
	}

	function cerrarModal() {
		if (!guardando) avanceElegido = null;
	}

	// Si el estudiante elige un archivo, se rellenan nombre y tamaño (el archivo en sí no se envía)
	function alElegirArchivo(e) {
		const f = e.target.files[0];
		if (!f) return;
		formNombre = f.name;
		formTamanoMB = (f.size / 1024 / 1024).toFixed(2);
	}

	async function enviar(e) {
		e.preventDefault();
		const base = avanceElegido;
		const nombre = formNombre.trim();
		if (!nombre) {
			errorSubida = 'Escribe el nombre del documento.';
			return;
		}

		const mb = parseFloat(formTamanoMB);
		const cambios = {
			nombre_archivo: nombre,
			ruta_archivo: formEnlace.trim() || `https://ejemplo.com/archivos/${encodeURIComponent(nombre)}`,
			tamano_bytes: Number.isFinite(mb) && mb > 0 ? Math.round(mb * 1024 * 1024) : 0,
			fecha_entrega: new Date().toISOString(),
			numero_version: (base.numero_version ?? 0) + 1,
			dictamen: null
		};

		guardando = true;
		errorSubida = '';
		try {
			await actualizarAvance(base.id_avance, {
				...base,
				...cambios,
				id_trabajo_grado: trabajoGrado.id_trabajo_grado,
				subido_por: sesion.usuario.id_user
			});
			avances = avances.map((x) => (x.id_avance === base.id_avance ? { ...x, ...cambios } : x));
			avanceElegido = null;
		} catch (err) {
			errorSubida = err.message;
		} finally {
			guardando = false;
		}
	}

	// Ficha técnica: se arma en el navegador con los datos ya cargados
	function descargarFicha() {
		const t = trabajoGrado;
		const lineas = [
			'FICHA TÉCNICA DEL TRABAJO DE GRADO',
			'',
			`Título: ${t.titulo}`,
			`Radicación: ${t.radicacion}`,
			`Modalidad: ${t.modalidad}`,
			`Estado: ${t.estado}`,
			`Director: ${director ? nombreCompleto(director) : 'Sin asignar'}`,
			`Inicio: ${formatearFecha(t.fecha_inicio)}`,
			`Cierre estimado: ${formatearFecha(t.fecha_estimada_fin ?? t.fecha_fin)}`,
			'',
			'EQUIPO',
			...integrantes.map((p) => `- ${nombreCompleto(p)} (${p.rol_proyecto ?? 'Estudiante'}) - ${p.correo}`),
			'',
			'AVANCES',
			...avances.map(
				(a) => `- ${a.titulo} (v${a.numero_version}) - ${textoEstado(a)} - límite ${formatearFecha(a.fecha_limite)}`
			)
		];

		const blob = new Blob([lineas.join('\n')], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `ficha_tecnica_${t.radicacion ?? 'trabajo'}.txt`;
		link.click();
		URL.revokeObjectURL(url);
	}

	function abrirSolicitud() {
		solAvance = '';
		solMotivo = '';
		solError = '';
		solicitudAbierta = true;
	}

	function cerrarSolicitud() {
		if (!solEnviando) solicitudAbierta = false;
	}

	function cerrarTodo() {
		cerrarModal();
		cerrarSolicitud();
	}

	async function enviarSolicitud(e) {
		e.preventDefault();
		const motivo = solMotivo.trim();
		if (!solAvance || !motivo) {
			solError = 'Elige el avance y escribe el motivo.';
			return;
		}

		solEnviando = true;
		solError = '';
		try {
			await crearRetroalimentacion({
				id_avance: Number(solAvance),
				id_usuario: sesion.usuario.id_user,
				comentario: `Solicitud de modificación: ${motivo}`
			});
			solicitudAbierta = false;
			solicitudOk = true;
		} catch (err) {
			solError = err.message;
		} finally {
			solEnviando = false;
		}
	}

	onMount(async () => {
		try {
			const usuario = sesion.usuario;
			if (!usuario || usuario.rol !== 'estudiante') {
				error = 'Esta página está disponible únicamente para estudiantes.';
				return;
			}

			const data = await getTrabajoPorEstudiante(usuario.id_user);
			trabajoGrado = data?.trabajo ?? null;
			integrantes = Array.isArray(data?.equipo) ? data.equipo : [];
			sinTrabajo = !trabajoGrado;

			if (trabajoGrado) {
				const lista = await getAvancePorTrabajo(trabajoGrado.id_trabajo_grado);
				avances = Array.isArray(lista) ? lista : [];
			}
		} catch (e) {
			if (e.status === 404) {
				sinTrabajo = true;
			} else {
				error = e.message;
			}
		} finally {
			cargando = false;
		}
	});
</script>


<svelte:window onkeydown={(e) => e.key === 'Escape' && cerrarTodo()} />

<div class="d-flex bg-light min-vh-100">
	<main class="flex-grow-1 p-4 overflow-x-hidden">
		<div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
			<div>
				<span class="extra-small text-muted fw-bold text-uppercase">Gestión del proyecto</span>
				<h1 class="h3 fw-bold text-dark mb-0">Mi trabajo de Grado</h1>
			</div>
			<div class="d-flex gap-2">
	
				<button
					class="btn btn-primary btn-sm px-3 rounded-3 d-flex align-items-center gap-2"
					onclick={abrirSolicitud}
					disabled={!trabajoGrado}
				>
					<i class="bi bi-pencil-square"></i>Solicitud de Modificación
				</button>
			</div>
		</div>

		{#if cargando}
			<div class="text-center py-5 text-muted">Cargando...</div>
		{:else if error}
			<div class="alert alert-warning">{error}</div>
		{:else if sinTrabajo}
			<div class="alert alert-info">Aún no tienes un trabajo de grado asignado.</div>
		{:else if trabajoGrado}
			{#if solicitudOk}
				<div class="alert alert-success d-flex align-items-center justify-content-between py-2 small" role="alert">
					<span><i class="bi bi-check-circle me-2"></i>Solicitud enviada. Tu director y el coordinador podrán verla en Retroalimentaciones.</span>
					<button type="button" class="btn-close" aria-label="Cerrar aviso" onclick={() => (solicitudOk = false)}></button>
				</div>
			{/if}

			<!-- Tarjeta principal -->
			<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4">
				<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-3">
					<span class="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold py-1.5 px-2.5">
						<i class="bi bi-circle-fill me-1 extra-small"></i>{trabajoGrado.estado_tramite}
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
						<span class="small fw-semibold text-dark d-block text-truncate">
							{director ? nombreCompleto(director) : 'Sin asignar'}
						</span>
					</div>
					<div class="col-6 col-md-3">
						<span class="extra-small text-muted d-block text-uppercase fw-bold">Inicio</span>
						<span class="small fw-semibold text-dark d-block text-truncate">{formatearFecha(trabajoGrado.fecha_inicio)}</span>
					</div>
					<div class="col-6 col-md-3">
						<span class="extra-small text-muted d-block text-uppercase fw-bold">Cierre Estimado</span>
						<span class="small fw-semibold text-dark d-block text-truncate">{formatearFecha(trabajoGrado.fecha_estimada_fin ?? trabajoGrado.fecha_fin)}</span>
					</div>
				</div>
			</div>

			<!-- Pestañas -->
			<ul class="nav nav-pills gap-2 mb-4">
				<li class="nav-item">
					<button
						type="button"
						class="nav-link btn-sm rounded-pill px-3 {pestana === 'resumen' ? 'active' : 'bg-white border text-secondary'}"
						onclick={() => (pestana = 'resumen')}
					>
						<i class="bi bi-grid me-1"></i> Resumen
					</button>
				</li>
				<li class="nav-item">
					<button
						type="button"
						class="nav-link btn-sm rounded-pill px-3 {pestana === 'avances' ? 'active' : 'bg-white border text-secondary'}"
						onclick={() => (pestana = 'avances')}
					>
						<i class="bi bi-list-check me-1"></i> Avances y Entregas
						<span class="badge rounded-pill ms-1 {pestana === 'avances' ? 'bg-white text-primary' : 'bg-light text-muted border'}">{avances.length}</span>
					</button>
				</li>
			</ul>

			{#if pestana === 'resumen'}
			<!-- Repositorio (datos de prueba) -->
			<div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
				<h3 class="h6 fw-bold text-dark mb-3 d-flex align-items-center gap-2">
					<i class="bi bi-github text-primary fs-5"></i>Repositorio y control de versiones
				</h3>

				<div class="bg-light p-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3 border">
					<div class="bg-white p-2 rounded-2 border text-dark">
						<i class="bi bi-code-slash fs-5"></i>
					</div>
					<div>
						<span class="fw-semibold text-dark d-block small">github.com/universidad/tesis-resnet-denseNet</span>
						<span class="extra-small text-muted">Último commit: hace 2 días (Rama main)</span>
					</div>
					<a href="https://github.com" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-white border shadow-sm fw-medium d-flex align-items-center gap-1">
						Abrir Repositorio <i class="bi bi-box-arrow-up-right extra-small ms-1"></i>
					</a>
				</div>
			</div>

			<!-- Equipo vinculado -->
			<div class="card border-0 shadow-sm rounded-4 p-4 mb-4">
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
							{#each integrantes as persona (persona.id_user)}
								<tr>
									<td>
										<div class="d-flex align-items-center gap-2">
											<div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px;">
												{iniciales(persona)}
											</div>
											<div>
												<strong class="text-dark d-block">{nombreCompleto(persona)}</strong>
											</div>
										</div>
									</td>
									<td>
										<span class="badge bg-light text-dark border fw-medium">{persona.rol_proyecto ?? 'Estudiante'}</span>
									</td>
									<td class="text-muted">{persona.correo}</td>
									<td class="text-end">
										<a href="mailto:{persona.correo}" aria-label="Enviar correo a {nombreCompleto(persona)}" title="Enviar correo" class="btn btn-sm btn-light border p-1 text-muted">
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
				<!-- Entregables pendientes (desde avances) -->
				<div class="col-12 col-xl-8">
					<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 h-100">
						<div class="mb-4">
							<h3 class="h5 fw-bold text-dark mb-1">Entregables Activos y Requisitos Pendientes</h3>
							<p class="text-secondary small mb-0">Subidas habilitadas según el calendario de radicación actual.</p>
						</div>

						{#if pendientes.length === 0}
							<div class="text-muted small text-center py-4">No tienes entregables pendientes.</div>
						{:else}
							{#each pendientes as a (a.id_avance)}
								{@const dias = diasRestantes(a.fecha_limite)}
								{@const urgente = puedeCargar(a) && dias !== null && dias >= 0 && dias <= 7}
								<div class="border rounded-3 p-3 mb-3 bg-light-subtle">
									<div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
										<div class="d-flex align-items-center gap-2">
											{#if urgente}
												<span class="badge bg-danger text-white extra-small fw-bold">URGENTE • {dias} DÍAS</span>
											{:else}
												<span class="badge border extra-small fw-bold {claseEstado(a)}">{textoEstado(a).toUpperCase()}</span>
											{/if}
											<span class="extra-small text-muted fw-semibold">v{a.numero_version}</span>
										</div>
										<span class="extra-small fw-semibold d-flex align-items-center gap-1 {urgente ? 'text-danger' : 'text-muted'}">
											<i class="bi bi-clock-history"></i> Plazo: {formatearFecha(a.fecha_limite)}
										</span>
									</div>

									<h4 class="h6 fw-bold text-dark mb-1">{a.titulo}</h4>
									<p class="extra-small text-muted mb-3">{a.descripcion ?? ''}</p>

									<div class="d-flex justify-content-end pt-2 border-top">
										{#if puedeCargar(a)}
											<button
												class="btn btn-sm btn-primary px-3 py-1.5 fw-semibold d-flex align-items-center gap-1"
												onclick={() => abrirModal(a)}
											>
												<i class="bi bi-cloud-upload"></i> Cargar Documento
											</button>
										{:else}
											<span class="extra-small text-muted">Documento en revisión</span>
										{/if}
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>

				<div class="col-12 col-xl-4 d-flex flex-column gap-4">
					<!-- Comité asignado -->
					<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
						<div class="d-flex align-items-center justify-content-between mb-3">
							<h3 class="h6 fw-bold text-dark mb-0">Comité Asignado</h3>
							<span class="badge bg-light text-primary border extra-small">{comite.length} Miembros</span>
						</div>

						<div class="d-flex flex-column gap-3">
							{#each comite as miembro, i (miembro.id_user)}
								{#if i > 0}
									<hr class="my-0 text-muted opacity-25" />
								{/if}
								<div class="d-flex align-items-center gap-3">
									<div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 40px; height: 40px;">
										{iniciales(miembro)}
									</div>
									<div class="lh-sm min-w-0">
										<div class="d-flex align-items-center gap-2">
											<strong class="text-dark extra-small text-truncate">{nombreCompleto(miembro)}</strong>
											<span class="badge bg-primary text-white extra-small">{miembro.rol_proyecto}</span>
										</div>
										<a href="mailto:{miembro.correo}" class="extra-small text-decoration-none text-muted text-truncate d-block">{miembro.correo}</a>
									</div>
								</div>
							{/each}
						</div>
					</div>

				</div>
			</div>
			{:else}
				<!-- Pestaña Avances: registro general -->
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
									<th>Fecha Límite</th>
								</tr>
							</thead>
							<tbody class="small">
								{#each avancesOrdenados as a (a.id_avance)}
									<tr>
										<td><span class="badge bg-light text-dark border font-monospace">#{a.id_avance}</span></td>
										<td><strong class="text-dark">{a.titulo}</strong></td>
										<td><span class="text-muted extra-small">v{a.numero_version}</span></td>
										<td class="text-muted">{formatearFechaCorta(a.fecha_inicio)}</td>
										<td><span class="badge border {claseEstado(a)}">{textoEstado(a)}</span></td>
										<td class="text-muted extra-small">{a.descripcion ?? '-'}</td>
										<td class="text-muted">{formatearFechaCorta(a.fecha_limite)}</td>
									</tr>
								{:else}
									<tr><td colspan="7" class="text-center text-muted py-3">Aún no hay avances registrados.</td></tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>

				<!-- Pestaña Avances: historial de entregas -->
				<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-4">
					<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-4">
						<div>
							<h3 class="h6 fw-bold text-dark mb-1">Historial de Entregas Realizadas</h3>
							<p class="text-secondary extra-small mb-0">Documentos registrados en la plataforma con control de versiones.</p>
						</div>
						<span class="badge bg-light text-muted border extra-small">{historial.length} Archivos Subidos</span>
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
									<th class="text-end">Descargar</th>
								</tr>
							</thead>
							<tbody class="small">
								{#each historial as doc (doc.id_avance)}
									<tr>
										<td>
											<div class="d-flex align-items-center gap-2 min-w-0">
												{#if extension(doc.nombre_archivo) === 'PDF'}
													<i class="bi bi-file-earmark-pdf text-danger fs-5 flex-shrink-0"></i>
												{:else}
													<i class="bi bi-file-earmark-zip text-primary fs-5 flex-shrink-0"></i>
												{/if}
												<div class="lh-sm min-w-0">
													<strong class="text-dark d-block text-truncate">{doc.nombre_archivo}</strong>
													<span class="badge bg-light text-secondary border extra-small">v{doc.numero_version}</span>
												</div>
											</div>
										</td>
										<td><span class="text-muted extra-small text-truncate d-block">{doc.titulo}</span></td>
										<td class="text-muted extra-small">{formatearFechaCorta(doc.fecha_entrega)}</td>
										<td class="text-muted extra-small">{formatearTamano(doc.tamano_bytes) || '-'}</td>
										<td><span class="badge border extra-small {claseEstado(doc)}">{textoEstado(doc)}</span></td>
										<td class="text-end">
											<a href={doc.ruta_archivo} target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-light border text-muted" aria-label="Descargar {doc.nombre_archivo}">
												<i class="bi bi-download"></i>
											</a>
										</td>
									</tr>
								{:else}
									<tr><td colspan="6" class="text-center text-muted py-3">Aún no has subido documentos.</td></tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/if}

			<!-- Ventana (modal) para cargar documento -->
			{#if avanceElegido}
				<div class="modal d-block" role="dialog" aria-modal="true" aria-labelledby="titulo-modal" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
					<div class="modal-dialog modal-dialog-centered">
						<form class="modal-content border-0 rounded-4 shadow" onsubmit={enviar}>
							<div class="modal-header border-0 pb-0">
								<div>
									<h5 class="modal-title fw-bold" id="titulo-modal">Cargar documento</h5>
									<p class="extra-small text-muted mb-0">
										{avanceElegido.titulo} • se registrará como v{(avanceElegido.numero_version ?? 0) + 1}
									</p>
								</div>
								<button type="button" class="btn-close" aria-label="Cerrar" onclick={cerrarModal}></button>
							</div>

							<div class="modal-body">
								<div class="mb-3">
									<label class="form-label small fw-semibold" for="f-archivo">Elegir archivo (opcional)</label>
									<input id="f-archivo" type="file" class="form-control form-control-sm" onchange={alElegirArchivo} />
									<div class="form-text extra-small">Solo rellena el nombre y el tamaño; el archivo no se sube.</div>
								</div>

								<div class="mb-3">
									<label class="form-label small fw-semibold" for="f-nombre">Nombre del documento *</label>
									<input id="f-nombre" type="text" class="form-control form-control-sm" placeholder="Informe_Avance_v1.pdf" bind:value={formNombre} required />
								</div>

								<div class="row g-3">
									<div class="col-12 col-sm-7">
										<label class="form-label small fw-semibold" for="f-enlace">Enlace (opcional)</label>
										<input id="f-enlace" type="text" class="form-control form-control-sm" placeholder="https://..." bind:value={formEnlace} />
									</div>
									<div class="col-12 col-sm-5">
										<label class="form-label small fw-semibold" for="f-tamano">Tamaño en MB (opcional)</label>
										<input id="f-tamano" type="number" step="0.01" min="0" class="form-control form-control-sm" placeholder="2.5" bind:value={formTamanoMB} />
									</div>
								</div>

								{#if errorSubida}
									<div class="alert alert-danger py-2 small mt-3 mb-0">{errorSubida}</div>
								{/if}
							</div>

							<div class="modal-footer border-0 pt-0">
								<button type="button" class="btn btn-sm btn-outline-secondary px-3" onclick={cerrarModal} disabled={guardando}>Cancelar</button>
								<button type="submit" class="btn btn-sm btn-primary px-3 fw-semibold" disabled={guardando}>
									{#if guardando}
										<span class="spinner-border spinner-border-sm me-1"></span> Guardando...
									{:else}
										<i class="bi bi-cloud-upload me-1"></i> Guardar entrega
									{/if}
								</button>
							</div>
						</form>
					</div>
				</div>
			{/if}

			<!-- Ventana (modal) para solicitar una modificación -->
			{#if solicitudAbierta}
				<div class="modal d-block" role="dialog" aria-modal="true" aria-labelledby="titulo-solicitud" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
					<div class="modal-dialog modal-dialog-centered">
						<form class="modal-content border-0 rounded-4 shadow" onsubmit={enviarSolicitud}>
							<div class="modal-header border-0 pb-0">
								<div>
									<h5 class="modal-title fw-bold" id="titulo-solicitud">Solicitud de modificación</h5>
									<p class="extra-small text-muted mb-0">Explica qué avance debe corregirse y por qué.</p>
								</div>
								<button type="button" class="btn-close" aria-label="Cerrar" onclick={cerrarSolicitud}></button>
							</div>

							<div class="modal-body">
								<div class="mb-3">
									<label class="form-label small fw-semibold" for="s-avance">Avance a modificar *</label>
									<select id="s-avance" class="form-select form-select-sm" bind:value={solAvance} required>
										<option value="" disabled>Selecciona un avance</option>
										{#each avances as a (a.id_avance)}
											<option value={a.id_avance}>{a.titulo} (v{a.numero_version})</option>
										{/each}
									</select>
								</div>

								<div class="mb-1">
									<label class="form-label small fw-semibold" for="s-motivo">Motivo *</label>
									<textarea
										id="s-motivo"
										class="form-control form-control-sm"
										rows="4"
										placeholder="Describe el cambio que necesitas..."
										bind:value={solMotivo}
										required
									></textarea>
								</div>

								{#if solError}
									<div class="alert alert-danger py-2 small mt-3 mb-0">{solError}</div>
								{/if}
							</div>

							<div class="modal-footer border-0 pt-0">
								<button type="button" class="btn btn-sm btn-outline-secondary px-3" onclick={cerrarSolicitud} disabled={solEnviando}>Cancelar</button>
								<button type="submit" class="btn btn-sm btn-primary px-3 fw-semibold" disabled={solEnviando}>
									{#if solEnviando}
										<span class="spinner-border spinner-border-sm me-1"></span> Enviando...
									{:else}
										<i class="bi bi-send me-1"></i> Enviar solicitud
									{/if}
								</button>
							</div>
						</form>
					</div>
				</div>
			{/if}
		{/if}
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