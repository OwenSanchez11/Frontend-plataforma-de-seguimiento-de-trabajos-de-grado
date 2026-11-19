<script>
	import { Capacitor, registerPlugin } from '@capacitor/core';
	import { onMount } from 'svelte';
	import { descargarReporteTrabajos, enviarReporteTrabajos, getCarrerasReporte, visualizarReporteTrabajos } from '$lib/api';

	const guardarReporte = registerPlugin('GuardarReporte');

	function leerPdfComoBase64(pdf) {
		return new Promise((resolve, reject) => {
			const lector = new FileReader();
			lector.onload = () => resolve(lector.result.split(',')[1]);
			lector.onerror = () => reject(new Error('No se pudo preparar el PDF para guardarlo.'));
			lector.readAsDataURL(pdf);
		});
	}

	let carreras = $state([]);
	let aviso = $state('');
	let filtros = $state({ id_carrera: '', estado_tramite: '', desde: '', hasta: '' });
	let destinatario = $state('');
	let accion = $state('');
	let error = $state('');
	let resultado = $state('');
	let vistaPrevia = $state(null);
	let filtrosVista = $state('');
	const filtroActual = $derived(JSON.stringify(filtros));

	onMount(async () => {
		try {
			carreras = await getCarrerasReporte();
		} catch (excepcion) {
			aviso = excepcion.message;
		}
	});

	async function generar(evento) {
		evento.preventDefault();
		if (accion) return;
		error = '';
		resultado = '';
		if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
			error = 'La fecha inicial debe ser anterior o igual a la fecha final.';
			return;
		}
		const seleccion = Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor));
		accion = evento.submitter?.value ?? 'vista';
		try {
			if (accion === 'vista') {
				vistaPrevia = await visualizarReporteTrabajos(seleccion);
				filtrosVista = filtroActual;
			} else if (accion === 'correo') {
				const correo = destinatario.trim();
				await enviarReporteTrabajos({ ...seleccion, destinatario: correo });
				resultado = `El servicio de correo aceptó el envío a ${correo}.`;
			} else {
				const pdf = await descargarReporteTrabajos(seleccion);
				if (Capacitor.getPlatform() === 'android') {
					const contenido = await leerPdfComoBase64(pdf);
					const { guardado } = await guardarReporte.guardar({ contenido });
					if (guardado) resultado = 'Se guardó el PDF.';
					return;
				}
				const url = URL.createObjectURL(pdf);
				const enlace = document.createElement('a');
				enlace.href = url;
				enlace.download = 'trabajos-de-grado.pdf';
				document.body.append(enlace);
				enlace.click();
				enlace.remove();
				setTimeout(() => URL.revokeObjectURL(url), 1000);
				resultado = 'Se inició la descarga del PDF.';
			}
		} catch (excepcion) {
			error = excepcion.message;
		} finally {
			accion = '';
		}
	}
</script>

<section class="reportes mx-auto py-2 py-md-4" aria-labelledby="titulo-reportes">
	<header class="reportes-encabezado d-flex align-items-center gap-3 p-3 p-md-4 mb-4 rounded-4">
		<div class="reportes-icono rounded-3">
			<i class="bi bi-file-earmark-pdf" aria-hidden="true"></i>
		</div>
		<div>
			<h1 id="titulo-reportes" class="h3 fw-bold mb-1">Reportes</h1>
			<p class="mb-0">Trabajos de grado</p>
		</div>
	</header>

	<form class="card border-0 rounded-4 shadow-sm" onsubmit={generar}>
		<div class="card-body p-3 p-md-4">
			{#if aviso}<p role="status" class="text-muted">{aviso}</p>{/if}
			<fieldset class="row g-3" disabled={Boolean(accion)} aria-busy={Boolean(accion)}>
				<legend class="h6 fw-semibold mb-0">
					<i class="bi bi-funnel me-2 text-primary" aria-hidden="true"></i>Filtros del reporte
				</legend>
				<div class="col-md-6">
					<label class="form-label" for="reporte-carrera">Carrera</label>
					<select class="form-select" id="reporte-carrera" bind:value={filtros.id_carrera}>
						<option value="">Todas las permitidas</option>
						{#each carreras as carrera (carrera.id_carrera)}
							<option value={String(carrera.id_carrera)}>{carrera.nombre_carrera}</option>
						{/each}
					</select>
				</div>
				<div class="col-md-6">
					<label class="form-label" for="reporte-estado">Estado del trámite</label>
					<select class="form-select" id="reporte-estado" bind:value={filtros.estado_tramite}>
						<option value="">Todos</option>
						<option>En proceso</option>
						<option>Finalizado</option>
						<option>Cancelado</option>
					</select>
				</div>
				<div class="col-md-6">
					<label class="form-label" for="reporte-desde">Fecha de inicio desde</label>
					<input type="date" class="form-control" id="reporte-desde" bind:value={filtros.desde} />
				</div>
				<div class="col-md-6">
					<label class="form-label" for="reporte-hasta">Fecha de inicio hasta</label>
					<input type="date" class="form-control" id="reporte-hasta" bind:value={filtros.hasta} />
				</div>
				<div class="col-12 d-grid d-sm-flex gap-2 my-4">
					<button class="btn btn-outline-primary rounded-3 px-3" type="submit" value="vista" formnovalidate>
						{#if accion === 'vista'}
							<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
						{:else}
							<i class="bi bi-eye me-2" aria-hidden="true"></i>
						{/if}
						{accion === 'vista' ? 'Consultando…' : 'Visualizar reporte'}
					</button>
					<button class="btn btn-primary rounded-3 px-3" type="submit" value="pdf" formnovalidate>
						{#if accion === 'pdf'}
							<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
						{:else}
							<i class="bi bi-file-earmark-pdf-fill me-2" aria-hidden="true"></i>
						{/if}
						{accion === 'pdf' ? 'Generando…' : 'Descargar PDF'}
					</button>
				</div>
				<div class="col-12 mt-0">
					<div class="reportes-correo rounded-3 p-3">
						<label class="form-label fw-semibold" for="reporte-destinatario">
							<i class="bi bi-envelope me-2 text-primary" aria-hidden="true"></i>Correo de destino
						</label>
						<div class="d-flex flex-column flex-sm-row gap-2">
							<input type="email" class="form-control" id="reporte-destinatario"
								autocomplete="email" bind:value={destinatario} maxlength="254" required />
							<button class="btn btn-outline-primary text-nowrap rounded-3" type="submit" value="correo">
								{#if accion === 'correo'}
									<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
								{:else}
									<i class="bi bi-send me-2" aria-hidden="true"></i>
								{/if}
								{accion === 'correo' ? 'Enviando…' : 'Enviar por correo'}
							</button>
						</div>
					</div>
				</div>
			</fieldset>
			{#if error}<p class="alert alert-danger mt-3 mb-0" role="alert">{error}</p>{/if}
			{#if resultado}<p class="alert alert-success mt-3 mb-0" role="status">{resultado}</p>{/if}
		</div>
	</form>

	{#if vistaPrevia && filtrosVista === filtroActual}
		<section class="card border-0 rounded-4 shadow-sm mt-4" aria-labelledby="titulo-vista-reporte">
			<div class="card-body p-3 p-md-4">
				<h2 id="titulo-vista-reporte" class="h5 fw-semibold">Vista previa</h2>
				<p role="status" class="text-secondary mb-3">Total de trabajos: {vistaPrevia.length}</p>
				{#if vistaPrevia.length}
					<div class="table-responsive">
						<table class="table table-striped align-middle mb-0">
							<thead class="table-light">
								<tr>
									<th scope="col">Título</th>
									<th scope="col">Carrera</th>
									<th scope="col">Facultad</th>
									<th scope="col">Estado</th>
									<th scope="col">Fecha de inicio</th>
								</tr>
							</thead>
							<tbody>
								{#each vistaPrevia as trabajo (trabajo.id_trabajo_grado)}
									<tr>
										<td>{trabajo.titulo}</td>
										<td>{trabajo.nombre_carrera ?? '—'}</td>
										<td>{trabajo.nombre_facultad ?? '—'}</td>
										<td>{trabajo.estado_tramite ?? '—'}</td>
										<td class="text-nowrap">{trabajo.fecha_inicio ?? '—'}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="mb-0">No hay trabajos para los filtros seleccionados.</p>
				{/if}
			</div>
		</section>
	{/if}
</section>

<style>
	.reportes {
		max-width: 56rem;
	}

	.reportes-encabezado {
		background: linear-gradient(115deg, #142857, #194997);
		color: #fff;
	}

	.reportes-encabezado p {
		color: #dce9ff;
	}

	.reportes-icono {
		display: grid;
		flex-shrink: 0;
		width: 3.25rem;
		height: 3.25rem;
		place-items: center;
		background: rgb(255 255 255 / 16%);
		font-size: 1.5rem;
	}

	.reportes-correo {
		background: #f1f6ff;
	}

	.reportes-correo input {
		min-width: 0;
	}
</style>
