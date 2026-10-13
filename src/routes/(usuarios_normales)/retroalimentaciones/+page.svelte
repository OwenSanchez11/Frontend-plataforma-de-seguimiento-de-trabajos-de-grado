<script>
	import { onMount } from "svelte";
	import { getTrabajoPorEstudiante , getRetroalimentacionPorTrabajo, crearRetroalimentacion} from "$lib/api";
	import { sesion } from "$lib/sesion.svelte";
	import { textoEstado, claseEstado } from '$lib/avances';

	let observaciones = $state([]);
	let integrantes = $state([]);
	let cargando = $state(true);
	let error = $state('')
	let sinTrabajo = $state(false);
	let evaluadores =  $derived(integrantes.filter((p) => p.rol_proyecto));
	let porAtender = $derived(observaciones.filter((o) => textoEstado(o) !== 'Aprobado'));
	let idTrabajo = null;
	let respondiendoA = $state(null);
	let respuesta = $state('')
	let enviando = $state(false);
	let errorRespuesta = $state('');
	let respuestaGuardada = $state(false);


	function nombreCompleto(p) {
		return `${p.nombre} ${p.apellido ?? ''}`.trim();
	}

	function iniciales(p) {
		return ((p.nombre?.[0] ?? '') + (p.apellido?.[0] ?? '')).toUpperCase();
	}

	onMount(async () => {
		try {
			const usuario = sesion.usuario;
			if (!usuario || usuario.rol !== 'estudiante') {
				error = 'Esta página está disponible únicamente para estudiantes.';
				return;
			}
			const data = await getTrabajoPorEstudiante(usuario.id_user);
			const trabajo = data?.trabajo ?? null;
			sinTrabajo = !trabajo;
			integrantes = Array.isArray(data?.equipo) ? data.equipo : []

			if (trabajo) {
				idTrabajo = trabajo.id_trabajo_grado;
				const lista = await getRetroalimentacionPorTrabajo(trabajo.id_trabajo_grado);
				observaciones = Array.isArray(lista) ? lista : [];
			}

		} catch (e) {
			if (e.status === 404) sinTrabajo = true;
			else error = e.message;
		} finally {
			cargando = false;
		}

	})

	function formatearFecha(f) {
		if (!f) return '-';
		return new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function formatearFechaHora(f) {
		if (!f) return '-';
		const d = new Date(f);
		return formatearFecha(f) + ' • ' + d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
	}

	const idAutorDe = (o) => o.id_user ?? o.id_usuario ?? o.usuario?.id_user ?? o.usuario?.id;
	const idIntegranteDe = (p) => p.id_user ?? p.id_usuario ?? p.id;
	const mismoId = (a, b) => a != null && b != null && String(a) === String(b);
	const autorDe = (o) => integrantes.find((p) => mismoId(idIntegranteDe(p), idAutorDe(o)));
	const totalDe = (p) => observaciones.filter((o) => mismoId(idAutorDe(o), idIntegranteDe(p))).length;
	const esRespuestaDelEstudiante = (o) => mismoId(idAutorDe(o), sesion.usuario?.id_user);
	// La respuesta no debe depender de que el autor aparezca en la lista del equipo.
	const puedeResponder = (o) => !esRespuestaDelEstudiante(o) && o.id_avance != null;

	function colorBorde(o) {
		switch (textoEstado(o)) {
			case 'Aprobado':
				return 'success';
			case 'Rechazado':
				return 'danger';
			case 'En progreso':
			case 'Entregado':
				return 'warning';
			default:
				return 'secondary';
		}
	}
	function ultimaRevision(p) {
		return observaciones
			.filter((o) => mismoId(idAutorDe(o), idIntegranteDe(p)))
			.map((o) => o.created_at)
			.sort()
			.at(-1) ?? null
	}


	function abrirRespuesta(obs) {
		respondiendoA = obs;
		respuesta = '';
		errorRespuesta = '';
		respuestaGuardada = false;
	}

	function cerrarRespuesta() {
		if (!enviando) respondiendoA = null
	}

	async function enviarRespuesta(e) {
		e.preventDefault();
		const texto = respuesta.trim();
		if (!texto) {
			errorRespuesta = 'Escribe tu respuesta';
			return;
		}
		enviando = true
		errorRespuesta = '';
		try {
			if (!respondiendoA?.id_avance) {
				throw new Error('Esta observación no tiene un avance asociado y no se puede guardar la respuesta.');
			}
			const comentario = `Respuesta: ${texto}`;
			const datos = {
				id_avance: Number(respondiendoA.id_avance),
				id_usuario: Number(sesion.usuario.id_user),
				comentario
			};
			const creada = await crearRetroalimentacion(datos);
			const observacionGuardada = {
				...respondiendoA,
				...(creada && typeof creada === 'object' ? creada : {}),
				id_retroalimentacion: creada?.id_retroalimentacion ?? `local-${Date.now()}`,
				id_avance: datos.id_avance,
				id_user: datos.id_usuario,
				comentario,
				created_at: creada?.created_at ?? new Date().toISOString(),
				fecha_entrega: null,
				dictamen: null
			};
			observaciones = [...observaciones, observacionGuardada];
			respondiendoA = null;
			respuesta = '';
			respuestaGuardada = true;

			// El POST ya se guardó; si el GET de actualización falla, conservamos la respuesta
			// en pantalla y no mostramos un error que sugiera volver a enviarla.
			try {
				const lista = await getRetroalimentacionPorTrabajo(idTrabajo);
				if (Array.isArray(lista)) observaciones = lista;
			} catch {
				// La respuesta quedó guardada por el POST.
			}
		} catch(error) {
			errorRespuesta = error.message;
		} finally {
			enviando = false;
		}
	}

</script>

<div class="d-flex bg-light min-vh-100">

	<main class="flex-grow-1 p-3 p-md-4 overflow-x-hidden">
		<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-3 mb-4">
			<div>
				<span class="extra-small text-muted fw-bold text-uppercase">Evaluación & Seguimiento</span>
				<h1 class="h3 fw-bold text-dark mb-0">Retroalimentaciones & Jurados</h1>
			</div>
		</div>
		{#if cargando}
			<div class="text-center py-5 text-muted">Cargando...</div>
		{:else if error}
			<div class="alert alert-warning">{error}</div>
		{:else if sinTrabajo}
			<div class="alert alert-info">Aún no tienes un trabajo de grado asignado.</div>
		{:else}
			{#if respuestaGuardada}
				<div class="alert alert-success py-2">Tu respuesta se guardó correctamente.</div>
			{/if}
			<div class="row g-3 mb-4">
				<div class="col-6 col-md-4">
					<div class="card border-0 shadow-sm rounded-4 p-3 h-100">
						<span class="extra-small text-muted fw-bold text-uppercase">Observaciones</span>
						<span class="h4 fw-bold text-dark mb-0">{observaciones.length}</span>
					</div>
				</div>
				<div class="col-6 col-md-4">
					<div class="card border-0 shadow-sm rounded-4 p-3 h-100">
						<span class="extra-small text-muted fw-bold text-uppercase">Por atender</span>
						<span class="h4 fw-bold text-warning-emphasis mb-0">{porAtender.length}</span>
					</div>
				</div>
				<div class="col-12 col-md-4">
					<div class="card border-0 shadow-sm rounded-4 p-3 h-100">
						<span class="extra-small text-muted fw-bold text-uppercase">Evaluadores</span>
						<span class="h4 fw-bold text-dark mb-0">{evaluadores.length}</span>
					</div>
				</div>
			</div>
			
			<div class="row g-3 mb-4">
				{#each evaluadores as prof (prof.id_user)}
					<div class="col-12 col-md-6 col-lg-4">
						<div class="card border-0 shadow-sm rounded-4 p-3 h-100 d-flex flex-column justify-content-between">
							<div>
								<div class="d-flex align-items-center justify-content-between mb-3">
									<span class="badge bg-light text-dark border extra-small">{prof.rol_proyecto}</span>
									<span class="extra-small text-muted">
										{ultimaRevision(prof) ? formatearFecha(ultimaRevision(prof)) : 'Sin revisiones'}
									</span>
								</div>

								<div class="d-flex align-items-center gap-3 mb-3">
									<div class="bg-primary-subtle text-primary rounded-circle p-2 d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style="width: 44px; height: 44px;">
										{iniciales(prof)}
									</div>
									<div class="lh-sm min-w-0">
										<strong class="text-dark d-block text-truncate">{nombreCompleto(prof)}</strong>
										<span class="extra-small text-muted d-block text-truncate">{prof.correo}</span>
									</div>
								</div>
							</div>

							<div class="pt-2 border-top d-flex align-items-center justify-content-between gap-2">
								<span class="badge bg-light text-secondary border extra-small">{totalDe(prof)} observaciones</span>
								<a href="mailto:{prof.correo}" class="btn btn-sm btn-light border p-1 text-muted" aria-label="Enviar correo a {nombreCompleto(prof)}">
									<i class="bi bi-envelope"></i>
								</a>
							</div>
						</div>
					</div>
				{:else}
					<div class="col-12 text-muted small">Aún no hay director ni jurados asignados.</div>
				{/each}
			</div>
				
			<div class="card border-0 shadow-sm rounded-4 p-3 p-md-4">
				<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-between gap-2 mb-4">
					<div>
						<h2 class="h6 fw-bold text-dark mb-1">Historial de Observaciones Formales</h2>
						<p class="text-secondary extra-small mb-0">Retroalimentaciones emitidos sobre entregables y avances del trabajo de grado.</p>
					</div>
					<span class="badge bg-light text-muted border extra-small">{observaciones.length} Observaciones</span>
				</div>

				<div class="d-flex flex-column gap-3">
					{#each observaciones as obs (obs.id_retroalimentacion)}
						{@const autor = autorDe(obs)}
						<div class="border rounded-3 p-3 bg-white shadow-2xs">
							<div class="border rounded-3 p-3 bg-white shadow-2xs" style="border-left: 4px solid var(--bs-{colorBorde(obs)}) !important;">
								<div class="d-flex align-items-center gap-2 flex-wrap">
									<strong class="text-dark small">{autor ? nombreCompleto(autor) : 'Evaluador'}</strong>
									{#if autor?.rol_proyecto}
										<span class="badge bg-light text-secondary border extra-small">{autor.rol_proyecto}</span>
									{/if}
									<span class="extra-small text-muted">• {obs.avance_titulo} (v{obs.numero_version})</span>
								</div>
								<span class="extra-small text-muted">{formatearFechaHora(obs.created_at)}</span>
							</div>

							<p class="small text-secondary bg-light p-3 rounded-3 border mb-3">"{obs.comentario}"</p>

							<div class="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-2 pt-2 border-top">
								<span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle extra-small">
									Por responder
								</span>

								{#if puedeResponder(obs)}
									<button
										class="btn btn-sm btn-outline-primary px-3 rounded-3 fw-medium extra-small d-flex align-items-center justify-content-center gap-1"
										onclick={() => abrirRespuesta(obs)}
									>
										<i class="bi bi-reply"></i> Responder Observación
									</button>
								{/if}
							</div>
						</div>
					{:else}
						<div class="text-muted small text-center py-3">Aún no tienes observaciones.</div>
					{/each}
				</div>
			</div>

			{#if respondiendoA}
				<div class="modal d-block" role="dialog" aria-modal="true" aria-labelledby="titulo-respuesta" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
					<div class="modal-dialog modal-dialog-centered">
						<form class="modal-content border-0 rounded-4 shadow" onsubmit={enviarRespuesta}>
							<div class="modal-header border-0 pb-0">
								<div>
									<h5 class="modal-title fw-bold" id="titulo-respuesta">Responder observación</h5>
									<p class="extra-small text-muted mb-0">{respondiendoA.avance_titulo} (v{respondiendoA.numero_version})</p>
								</div>
								<button type="button" class="btn-close" aria-label="Cerrar" onclick={cerrarRespuesta}></button>
							</div>

							<div class="modal-body">
								<p class="small text-secondary bg-light p-3 rounded-3 border">"{respondiendoA.comentario}"</p>

								<label class="form-label small fw-semibold" for="r-texto">Tu respuesta *</label>
								<textarea
									id="r-texto"
									class="form-control form-control-sm"
									rows="4"
									placeholder="Escribe tu respuesta..."
									bind:value={respuesta}
									required
								></textarea>

								{#if errorRespuesta}
									<div class="alert alert-danger py-2 small mt-3 mb-0">{errorRespuesta}</div>
								{/if}
							</div>

							<div class="modal-footer border-0 pt-0">
								<button type="button" class="btn btn-sm btn-outline-secondary px-3" onclick={cerrarRespuesta} disabled={enviando}>Cancelar</button>
								<button type="submit" class="btn btn-sm btn-primary px-3 fw-semibold" disabled={enviando}>
									{#if enviando}
										<span class="spinner-border spinner-border-sm me-1"></span> Enviando...
									{:else}
										<i class="bi bi-send me-1"></i> Enviar respuesta
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
</style>
