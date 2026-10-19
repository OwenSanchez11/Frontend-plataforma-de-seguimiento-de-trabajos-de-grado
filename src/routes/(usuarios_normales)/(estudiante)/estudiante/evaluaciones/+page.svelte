<script>
	import { onMount } from 'svelte';
	import { getMisEvaluaciones } from '$lib/api';
	import Banner from '$lib/components/Banner.svelte';
	import TarjetaResumen from '$lib/components/TarjetaResumen.svelte';

	let evaluaciones = $state([]);
	let cargando = $state(true);
	let sinTrabajo = $state(false);
	let error = $state('');

	let reciente = $derived(evaluaciones[0] ?? null);
	let historial = $derived(evaluaciones.slice(1));
	let promedio = $derived(evaluaciones.length
		? evaluaciones.reduce((total, ev) => total + (Number(ev.nota) || 0), 0) / evaluaciones.length
		: 0);

	onMount(async () => {
		try {
			const respuesta = await getMisEvaluaciones();
			evaluaciones = obtenerLista(respuesta).sort((a, b) =>
				new Date(b.fecha_evaluacion ?? 0) - new Date(a.fecha_evaluacion ?? 0)
			);
		} catch (e) {
			if (e.status === 404) sinTrabajo = true;
			else error = 'No pudimos cargar tus evaluaciones. Intenta de nuevo en unos minutos.';
		} finally {
			cargando = false;
		}
	});

	function obtenerLista(respuesta) {
		if (Array.isArray(respuesta)) return respuesta;
		for (const clave of ['evaluaciones', 'data', 'items']) {
			if (Array.isArray(respuesta?.[clave])) return respuesta[clave];
		}
		return [];
	}

	function fechaCorta(fecha) {
		if (!fecha) return 'Sin fecha';
		const valor = String(fecha).slice(0, 10);
		const date = new Date(`${valor}T00:00:00`);
		return Number.isNaN(date.getTime()) ? 'Sin fecha' : date.toLocaleDateString('es-CO', {
			day: 'numeric', month: 'long', year: 'numeric'
		});
	}

	function nota(ev) {
		const valor = Number(ev?.nota);
		return Number.isFinite(valor) ? valor.toFixed(1) : '—';
	}

	function claseVeredicto(veredicto) {
		const valor = String(veredicto ?? '').toLowerCase();
		if (valor.includes('no ') || valor.includes('repro') || valor.includes('rechaz')) return 'danger';
		if (valor.includes('aprob')) return 'success';
		return 'primary';
	}
</script>

<svelte:head>
	<title>Evaluaciones | GradTrack</title>
	<meta name="description" content="Consulta los resultados de evaluación de tu trabajo de grado." />
</svelte:head>

<div class="evaluaciones-page">
	<div class="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
		<div>
			<span class="small text-uppercase text-secondary fw-semibold">Mi proceso académico</span>
			<h1 class="h3 fw-bold mb-1">Evaluaciones y resultados</h1>
			<p class="text-secondary mb-0">Consulta las calificaciones y observaciones de tu trabajo de grado.</p>
		</div>
		<span class="badge rounded-pill bg-white text-secondary border px-3 py-2">
			<i class="bi bi-shield-check text-primary me-1"></i> Información académica
		</span>
	</div>

	{#if cargando}
		<div class="card border-0 shadow-sm rounded-4 text-center py-5" role="status">
			<div class="spinner-border text-primary mx-auto" aria-hidden="true"></div>
			<span class="text-secondary mt-3">Cargando evaluaciones…</span>
		</div>
	{:else if sinTrabajo}
		<div class="alert alert-info border-0 rounded-4"><i class="bi bi-info-circle me-2"></i>Aún no tienes un trabajo de grado asignado.</div>
	{:else if error}
		<div class="alert alert-danger rounded-4"><i class="bi bi-exclamation-circle me-2"></i>{error}</div>
	{:else if !reciente}
		<Banner etiqueta="SEGUIMIENTO ACADÉMICO" titulo="Evaluación de tu trabajo de grado" descripcion="Aquí aparecerán las calificaciones y observaciones que registre tu equipo evaluador." />
		<div class="card border-0 shadow-sm rounded-4 empty-state">
			<div class="card-body text-center py-5 px-4">
				<div class="empty-icon mx-auto mb-3"><i class="bi bi-clipboard2-check"></i></div>
				<h2 class="h5 fw-bold">Aún no hay evaluaciones registradas</h2>
				<p class="text-secondary mb-0 mx-auto" style="max-width: 440px">Cuando tu director o jurado registre una evaluación, podrás consultar aquí la nota, el veredicto y sus observaciones.</p>
			</div>
		</div>
	{:else}
		<Banner
			etiqueta="RESULTADO MÁS RECIENTE"
			titulo={reciente.titulo_avance ?? reciente.titulo ?? 'Evaluación de trabajo de grado'}
			descripcion="Resultado registrado para tu proceso de trabajo de grado. Revisa la nota y las observaciones del evaluador."
			stats={[
				{ etiqueta: 'Nota más reciente', valor: nota(reciente) },
				{ etiqueta: 'Evaluaciones', valor: String(evaluaciones.length) },
				{ etiqueta: 'Promedio', valor: promedio.toFixed(1) }
			]}
		>
			{#snippet acciones()}
				<div class="hero-veredicto">
					<span class="small opacity-75 d-block mb-1">VEREDICTO</span>
					<span class="badge rounded-pill text-bg-{claseVeredicto(reciente.veredicto)} px-3 py-2">{reciente.veredicto ?? 'Pendiente'}</span>
				</div>
			{/snippet}
		</Banner>

		<div class="row g-3 g-xl-4 mb-4">
			<div class="col-12 col-md-4">
				<TarjetaResumen titulo="Calificación más reciente" icono="bi-award" tono="warning">
					{#snippet children()}
						<div class="d-flex align-items-baseline gap-2"><span class="display-6 fw-bold">{nota(reciente)}</span><span class="text-secondary">/ 5.0</span></div>
						<div class="progress mt-3" style="height: 6px" aria-label="Calificación sobre cinco">
							<div class="progress-bar bg-warning" style="width: {Math.max(0, Math.min(100, (Number(reciente.nota) || 0) * 20))}%"></div>
						</div>
					{/snippet}
					{#snippet pie()}Actualizada el {fechaCorta(reciente.fecha_evaluacion)}{/snippet}
				</TarjetaResumen>
			</div>
			<div class="col-12 col-md-4">
				<TarjetaResumen titulo="Evaluaciones registradas" icono="bi-journal-check" tono="primary">
					{#snippet children()}<div class="display-6 fw-bold">{evaluaciones.length}</div><p class="text-secondary small mb-0">Resultados disponibles en tu historial</p>{/snippet}
				</TarjetaResumen>
			</div>
			<div class="col-12 col-md-4">
				<TarjetaResumen titulo="Promedio acumulado" icono="bi-graph-up-arrow" tono="success">
					{#snippet children()}<div class="d-flex align-items-baseline gap-2"><span class="display-6 fw-bold">{promedio.toFixed(1)}</span><span class="text-secondary">/ 5.0</span></div><p class="text-secondary small mb-0">Promedio de las notas registradas</p>{/snippet}
				</TarjetaResumen>
			</div>
		</div>

		<div class="row g-3 g-xl-4 align-items-start">
			<section class="col-12 col-xl-8" aria-labelledby="detalle-titulo">
				<div class="card border-0 shadow-sm rounded-4 h-100">
					<div class="card-body p-4">
						<div class="d-flex justify-content-between align-items-start gap-3 mb-3">
							<div><h2 class="h5 fw-bold mb-1" id="detalle-titulo">Detalle de la evaluación</h2><p class="small text-secondary mb-0">Calificación y comentarios del equipo evaluador.</p></div>
							<span class="badge bg-primary-subtle text-primary rounded-pill">#{reciente.id_evaluacion ?? '—'}</span>
						</div>
						<div class="result-row"><span>Avance evaluado</span><strong>{reciente.titulo_avance ?? reciente.titulo ?? (reciente.id_avance ? `Avance #${reciente.id_avance}` : 'Trabajo de grado')}</strong></div>
						<div class="result-row"><span>Fecha de evaluación</span><strong>{fechaCorta(reciente.fecha_evaluacion)}</strong></div>
						<div class="result-row"><span>Calificación</span><strong class="text-primary">{nota(reciente)} / 5.0</strong></div>
						<div class="result-row"><span>Veredicto</span><strong>{reciente.veredicto ?? 'Sin veredicto'}</strong></div>
						<div class="mt-4">
							<h3 class="h6 fw-bold">Observaciones</h3>
							<div class="observaciones">{reciente.observaciones || 'El evaluador no dejó observaciones.'}</div>
						</div>
					</div>
				</div>
			</section>

			<aside class="col-12 col-xl-4" aria-labelledby="resumen-titulo">
				<div class="card border-0 shadow-sm rounded-4">
					<div class="card-body p-4">
						<h2 class="h6 fw-bold mb-3" id="resumen-titulo"><i class="bi bi-info-circle text-primary me-2"></i>Resumen del resultado</h2>
						<div class="summary-panel mb-3"><span class="small text-secondary d-block mb-1">Estado de la evaluación</span><span class="badge text-bg-{claseVeredicto(reciente.veredicto)}">{reciente.veredicto ?? 'Registrada'}</span></div>
						<div class="summary-panel"><span class="small text-secondary d-block mb-1">Escala de calificación</span><strong>{promedio.toFixed(1)} / 5.0</strong><p class="small text-secondary mb-0 mt-1">Tu promedio se calcula con las evaluaciones registradas.</p></div>
				</div>
			</div>
			</aside>
		</div>

		{#if historial.length}
			<section class="card border-0 shadow-sm rounded-4 mt-4" aria-labelledby="historial-titulo">
				<div class="card-body p-4">
					<div class="d-flex justify-content-between align-items-center gap-2 mb-3"><div><h2 class="h5 fw-bold mb-1" id="historial-titulo">Historial de evaluaciones</h2><p class="small text-secondary mb-0">Resultados anteriores de tu proceso.</p></div><span class="badge bg-light text-secondary border">{historial.length} anteriores</span></div>
					<div class="vstack gap-3">
						{#each historial as evaluacion, indice (evaluacion.id_evaluacion ?? indice)}
							<article class="history-item">
								<div class="d-flex flex-wrap justify-content-between align-items-start gap-3">
									<div><h3 class="h6 fw-semibold mb-1">{evaluacion.titulo_avance ?? evaluacion.titulo ?? (evaluacion.id_avance ? `Avance #${evaluacion.id_avance}` : 'Evaluación de trabajo de grado')}</h3><span class="small text-secondary">{fechaCorta(evaluacion.fecha_evaluacion)}</span></div>
									<div class="d-flex align-items-center gap-2"><strong class="fs-4">{nota(evaluacion)}</strong><span class="badge text-bg-{claseVeredicto(evaluacion.veredicto)}">{evaluacion.veredicto ?? 'Registrada'}</span></div>
								</div>
								{#if evaluacion.observaciones}<p class="small text-secondary mt-3 mb-0">{evaluacion.observaciones}</p>{/if}
							</article>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	{/if}
</div>

<style>
	.evaluaciones-page { max-width: 1440px; margin: 0 auto; }
	.hero-veredicto { min-width: 150px; padding: .9rem 1rem; border: 1px solid rgba(255,255,255,.14); border-radius: 1rem; background: rgba(255,255,255,.08); }
	.result-row { display: flex; justify-content: space-between; gap: 1rem; padding: .85rem 0; border-bottom: 1px solid #edf0f5; }
	.result-row span { color: #667085; font-size: .9rem; }
	.result-row strong { text-align: right; }
	.observaciones, .summary-panel { padding: 1rem; border-radius: .9rem; background: #f3f6fc; white-space: pre-line; }
	.history-item { padding: 1rem; border: 1px solid #edf0f5; border-radius: .9rem; }
	.empty-state { background: linear-gradient(135deg, #fff, #f6f8fc); }
	.empty-icon { width: 3.5rem; height: 3.5rem; display: grid; place-items: center; border-radius: 1rem; background: #eaf0ff; color: #2458c6; font-size: 1.5rem; }
	@media (max-width: 575.98px) { .result-row { align-items: flex-start; flex-direction: column; gap: .25rem; } .result-row strong { text-align: left; } }
</style>
