<script>
	import { onMount } from 'svelte';
	import Banner from '$lib/components/Banner.svelte';
	import AccesoRapido from '$lib/components/AccesoRapido.svelte';
	import {
		getAvancePorTrabajo,
		getTrabajoPorEstudiante,
		getTrabajoPorDocente,
		getCarreras
	} from '$lib/api';
	import { esAprobado } from '$lib/avances';
	import { inicioDelDia, parsearFechaLocal } from '$lib/fechas';
	import { sesion } from '$lib/sesion.svelte.js';

	const rutas = {
		docente: {
			evaluaciones: '/docente/equipo_trabajo',
			avances: '/docente/entregas_docente',
			retroalimentaciones: '/docente/retroalimentaciones',
			evaluaciones: '/docente/evaluaciones',
			equipo: '/docente/equipo_trabajo'
		},
		estudiante: {
			trabajos: '/estudiante/trabajoGrado',
			avances: '/estudiante/trabajoGrado?vista=avances',
			retroalimentaciones: '/estudiante/retroalimentaciones',
			evaluaciones: '/estudiante/evaluaciones'
		}
	};

	const hoy = inicioDelDia(new Date());

	let cargando = $state(true);
	let error = $state('');
	let sinTrabajo = $state(false);
	let carreras = $state([]);
	let trabajo = $state(null); 
	let avances = $state([]); 
	let asignados = $state([]); 

	let usuario = $derived(sesion.usuario);
	let esEstudiante = $derived(usuario?.rol === 'estudiante');
	let esDocente = $derived(usuario?.rol === 'profesor' || usuario?.rol === 'docente');

	let nombreCompleto = $derived([usuario?.nombre, usuario?.apellido].filter(Boolean).join(' ') || 'Usuario');
	let contexto = $derived([usuario?.facultad, usuario?.programa].filter(Boolean).join(' · '));
	let nombreCarrera = $derived(
		usuario?.carrera?.nombre_carrera ||
		usuario?.carrera?.nombre ||
		(typeof usuario?.carrera === 'string' ? usuario.carrera : '') ||
		usuario?.programa ||
		carreras.find((carrera) => String(carrera.id_carrera) === String(usuario?.id_carrera))?.nombre_carrera ||
		'—'
	);

	/* ---------- Helpers ---------- */
	const dictamenDe = (a) => String(a.dictamen ?? '').toLowerCase();
	const dias = (fecha) => Math.round((inicioDelDia(fecha) - hoy) / 86400000);
	const textoDias = (n) => (n === 0 ? 'Hoy' : n === 1 ? 'Mañana' : `${n} días`);
	const urgencia = (n) => (n <= 3 ? 'urgente' : n <= 7 ? 'pronto' : 'holgado');
	const formatoFecha = (d) =>
		d ? d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }) : '—';
	const esPendiente = (a) => !esAprobado(a) && a.limite && inicioDelDia(a.limite) >= hoy;
	const porFechaLimite = (a, b) => a.limite - b.limite;

	function prepararAvances(lista) {
		return (Array.isArray(lista) ? lista : [])
			.filter((a) => a.estado)
			.map((a) => ({ ...a, limite: parsearFechaLocal(a.fecha_limite) }));
	}

	/* ---------- Estudiante ---------- */
	let aprobados = $derived(avances.filter(esAprobado).length);
	let porcentaje = $derived(avances.length ? Math.round((aprobados / avances.length) * 100) : 0);
	let pendientes = $derived(avances.filter(esPendiente).sort(porFechaLimite));
	let proxima = $derived(pendientes[0] ?? null);
	let desglose = $derived([
		{ etiqueta: 'Aprobados', color: '#198754', n: avances.filter((a) => dictamenDe(a) === 'aprobado').length },
		{ etiqueta: 'En progreso', color: '#f59e0b', n: avances.filter((a) => dictamenDe(a) === 'en progreso').length },
		{ etiqueta: 'Rechazados', color: '#dc3545', n: avances.filter((a) => dictamenDe(a) === 'rechazado').length },
		{ etiqueta: 'Sin dictamen', color: '#adb5bd', n: avances.filter((a) => !dictamenDe(a)).length }
	]);

	/* ---------- Profesor ---------- */
	// "Por revisar" = avances con documento entregado y sin dictamen. Cambia el criterio si el tuyo es otro.
	let porRevisar = $derived(
		asignados
			.flatMap((x) =>
				x.avances.filter((a) => a.fecha_entrega && !dictamenDe(a)).map((a) => ({ ...a, trabajo: x.trabajo }))
			)
			.sort((a, b) => String(a.fecha_entrega).localeCompare(String(b.fecha_entrega)))
	);
	let resumenDocente = $derived(
		asignados.map((x) => {
			const aprob = x.avances.filter(esAprobado).length;
			return {
				trabajo: x.trabajo,
				porcentaje: x.avances.length ? Math.round((aprob / x.avances.length) * 100) : 0,
				prox: x.avances.filter(esPendiente).sort(porFechaLimite)[0] ?? null
			};
		})
	);
	let proxVencimientoDocente = $derived(
		resumenDocente.map((r) => r.prox).filter(Boolean).sort(porFechaLimite)[0] ?? null
	);

	const v = (valor) => (cargando ? '—' : valor);

	let stats = $derived(
		esDocente
			? [
					{ etiqueta: 'Trabajos asignados', valor: v(asignados.length) },
					{ etiqueta: 'Entregas por revisar', valor: v(porRevisar.length) },
					{
						etiqueta: 'Próximo vencimiento',
						valor: v(proxVencimientoDocente ? textoDias(dias(proxVencimientoDocente.limite)) : 'Sin pendientes')
					}
				]
			: [
					{ etiqueta: 'Avance global', valor: v(`${porcentaje}%`), porcentaje: cargando ? 0 : porcentaje },
					{ etiqueta: 'Avances aprobados', valor: v(`${aprobados} de ${avances.length}`) },
					{ etiqueta: 'Próxima entrega', valor: v(proxima ? textoDias(dias(proxima.limite)) : 'Sin pendientes') }
				]
	);

	let accesos = $derived(
	esDocente
		? [
			{ texto: 'Mis trabajos', icono: 'bi-mortarboard', href: `${rutas.docente.evaluaciones}?vista=trabajos` },
			{ texto: 'Avances', icono: 'bi-folder2-open', href: rutas.docente.avances },
			{ texto: 'Evaluaciones', icono: 'bi-clipboard-check', href: rutas.docente.evaluaciones },
			{ texto: 'Equipo de trabajo', icono: 'bi bi-people-fill', href: rutas.docente.equipo }
		]
		: [
			{ texto: 'Mi trabajo', icono: 'bi-mortarboard', href: rutas.estudiante.trabajos },
			{ texto: 'Avances', icono: 'bi-folder2-open', href: rutas.estudiante.avances },
			{ texto: 'Evaluaciones', icono: 'bi-clipboard-check', href: rutas.estudiante.evaluaciones }
		]
	);

	onMount(async () => {
		try {
			const u = sesion.usuario;
			if (u?.id_carrera && !u?.carrera?.nombre_carrera) {
				try {
					const respuesta = await getCarreras();
					carreras = Array.isArray(respuesta) ? respuesta : [];
				} catch {
					carreras = [];
				}
			}

			if (u?.rol === 'estudiante') {
				const asignacion = await getTrabajoPorEstudiante(u.id_user);
				trabajo = asignacion?.trabajo ?? null;
				if (!trabajo) {
					sinTrabajo = true;
					return;
				}
				avances = prepararAvances(await getAvancePorTrabajo(trabajo.id_trabajo_grado));
			} else if (u?.rol === 'profesor' || u?.rol === 'docente') {
				const respuesta = await getTrabajoPorDocente(u.id_user);
				const lista = Array.isArray(respuesta) ? respuesta : (respuesta?.trabajos ?? []);
				if (!lista.length) {
					sinTrabajo = true;
					return;
				}
				asignados = await Promise.all(
					lista.map(async (item) => {
						const t = item.trabajo ?? item;
						try {
							return { trabajo: t, avances: prepararAvances(await getAvancePorTrabajo(t.id_trabajo_grado)) };
						} catch {
							return { trabajo: t, avances: [] };
						}
					})
				);
			}
		} catch (e) {
			if (e.status === 404) sinTrabajo = true;
			else error = e.message || 'No fue posible cargar tu información.';
		} finally {
			cargando = false;
		}
	});
</script>

<div class="d-flex bg-light min-vh-100">
	<main class="flex-grow-1 p-4 overflow-x-hidden">
		<Banner
			etiqueta={usuario?.rol ?? 'Usuario'}
			titulo={`Bienvenido de nuevo, ${nombreCompleto}`}
			descripcion={nombreCarrera !== '—' ? nombreCarrera : contexto}
			{stats}
		>
			{#snippet acciones()}
				{#if esDocente}
					<a class="btn btn-warning fw-semibold" href={rutas.evaluaciones}>Revisar entregas</a>
				{:else}
					<a class="btn btn-warning fw-semibold" href={rutas.avances}>Subir un avance</a>
				{/if}
			{/snippet}
		</Banner>

		{#if error}
			<div class="alert alert-danger small">{error}</div>
		{/if}

		<div class="row g-4">
			<div class="col-lg-8">
				{#if esEstudiante}
					<!-- ============ ESTUDIANTE ============ -->
					{#if sinTrabajo && !cargando}
						<section class="panel p-4 text-center">
							<i class="bi bi-journal-bookmark fs-1 text-secondary"></i>
							<h2 class="h5 mt-2">Aún no tienes un trabajo de grado asignado</h2>
							<p class="text-secondary mb-0">
								Cuando tu coordinador lo asigne, aquí verás tu avance y tus próximas entregas.
							</p>
						</section>
					{:else}
						<section
							class="panel destacado p-4 mb-4 {proxima ? urgencia(dias(proxima.limite)) : 'holgado'}"
						>
							{#if cargando}
								<div class="placeholder-glow">
									<span class="placeholder col-3 mb-3"></span>
									<span class="placeholder col-9 d-block mb-2"></span>
									<span class="placeholder col-6 d-block"></span>
								</div>
							{:else if proxima}
								{@const n = dias(proxima.limite)}
								<div class="d-flex flex-column flex-sm-row gap-4 align-items-sm-center">
									<div class="text-center bloque-cifra">
										{#if n <= 1}
											<div class="cifra cifra-texto">{textoDias(n)}</div>
										{:else}
											<div class="cifra">{n}</div>
											<div class="text-secondary">días</div>
										{/if}
									</div>
									<div>
										<p class="text-secondary small mb-1">Tu próxima entrega</p>
										<h2 class="h4 mb-1">{proxima.titulo}</h2>
										<p class="text-secondary mb-3">Vence el {formatoFecha(proxima.limite)}</p>
										<a class="btn btn-primary" href={rutas.avances}>Subir documento</a>
									</div>
								</div>

								{#if pendientes.length > 1}
									<hr class="my-4" />
									<p class="fw-semibold mb-2">Más adelante</p>
									<ul class="list-unstyled mb-0">
										{#each pendientes.slice(1, 4) as p}
											<li class="d-flex justify-content-between align-items-center py-2 border-top">
												<span>{p.titulo}</span>
												<span class="text-secondary small">
													{formatoFecha(p.limite)}
													<span class="badge text-bg-light border ms-2">{textoDias(dias(p.limite))}</span>
												</span>
											</li>
										{/each}
									</ul>
								{/if}
							{:else if avances.length}
								<div class="d-flex align-items-center gap-3">
									<i class="bi bi-check-circle-fill fs-1 text-success"></i>
									<div>
										<h2 class="h5 mb-1">Estás al día</h2>
										<p class="text-secondary mb-0">No tienes entregas pendientes con fecha límite próxima.</p>
									</div>
								</div>
							{:else}
								<div class="d-flex align-items-center gap-3">
									<i class="bi bi-hourglass-split fs-1 text-secondary"></i>
									<div>
										<h2 class="h5 mb-1">Todavía no hay avances registrados</h2>
										<p class="text-secondary mb-0">Tu coordinador los creará y aparecerán aquí con su fecha límite.</p>
									</div>
								</div>
							{/if}
						</section>

						{#if !cargando && trabajo}
							<section class="panel p-4">
								<p class="text-secondary small mb-1">Tu trabajo de grado</p>
								<h2 class="h5 mb-3">{trabajo.titulo ?? 'Trabajo de grado asignado'}</h2>

								{#if avances.length}
									<div
										class="progress mb-3"
										style="height:10px"
										role="img"
										aria-label="Estado de los avances por dictamen"
									>
										{#each desglose as d}
											{#if d.n}
												<div class="progress-bar" style="width:{(d.n / avances.length) * 100}%; background:{d.color}"></div>
											{/if}
										{/each}
									</div>
									<ul class="list-inline mb-0 small">
										{#each desglose as d}
											<li class="list-inline-item me-3">
												<span class="punto" style="background:{d.color}"></span>
												{d.etiqueta}: <strong>{d.n}</strong>
											</li>
										{/each}
									</ul>
								{:else}
									<p class="text-secondary mb-0">Aún no hay avances para mostrar.</p>
								{/if}
							</section>
						{/if}
					{/if}
				{:else if esDocente}
					<!-- ============ PROFESOR ============ -->
					{#if sinTrabajo && !cargando}
						<section class="panel p-4 text-center">
							<i class="bi bi-journal-bookmark fs-1 text-secondary"></i>
							<h2 class="h5 mt-2">Aún no tienes trabajos de grado asignados</h2>
							<p class="text-secondary mb-0">
								Cuando te vinculen a un equipo de trabajo, aquí verás sus entregas y vencimientos.
							</p>
						</section>
					{:else}
						<section class="panel destacado p-4 mb-4 {porRevisar.length ? 'pronto' : 'holgado'}">
							{#if cargando}
								<div class="placeholder-glow">
									<span class="placeholder col-3 mb-3"></span>
									<span class="placeholder col-9 d-block mb-2"></span>
									<span class="placeholder col-6 d-block"></span>
								</div>
							{:else if porRevisar.length}
								<div class="d-flex flex-column flex-sm-row gap-4 align-items-sm-center mb-4">
									<div class="text-center bloque-cifra">
										<div class="cifra">{porRevisar.length}</div>
									</div>
									<div>
										<h2 class="h4 mb-1">
											{porRevisar.length === 1 ? 'entrega espera' : 'entregas esperan'} tu dictamen
										</h2>
										<p class="text-secondary mb-0">Las más antiguas aparecen primero.</p>
									</div>
								</div>
								<ul class="list-unstyled mb-0">
									{#each porRevisar.slice(0, 4) as a}
										<li class="d-flex justify-content-between align-items-center gap-3 py-2 border-top">
											<div>
												<div class="fw-semibold">{a.titulo}</div>
												<div class="text-secondary small">
													{a.trabajo.titulo ?? 'Trabajo de grado'} · entregado el {formatoFecha(parsearFechaLocal(a.fecha_entrega))}
												</div>
											</div>
											<a class="btn btn-sm btn-outline-primary flex-none" href={rutas.evaluaciones}>Revisar</a>
										</li>
									{/each}
								</ul>
							{:else}
								<div class="d-flex align-items-center gap-3">
									<i class="bi bi-check-circle-fill fs-1 text-success"></i>
									<div>
										<h2 class="h5 mb-1">No tienes entregas por revisar</h2>
										<p class="text-secondary mb-0">Te avisaremos aquí cuando un estudiante suba un documento nuevo.</p>
									</div>
								</div>
							{/if}
						</section>

						{#if !cargando && resumenDocente.length}
							<section class="panel p-4">
								<h2 class="h5 mb-3">Tus trabajos</h2>
								<ul class="list-unstyled mb-0">
									{#each resumenDocente.slice(0, 5) as r}
										<li class="py-3 border-top">
											<div class="d-flex justify-content-between align-items-start gap-3 mb-2">
												<span class="fw-semibold">{r.trabajo.titulo ?? 'Trabajo de grado'}</span>
												<span class="text-secondary small text-nowrap">
													{r.prox ? `Vence en ${textoDias(dias(r.prox.limite)).toLowerCase()}` : 'Sin pendientes'}
												</span>
											</div>
											<div class="d-flex align-items-center gap-2">
												<div class="progress flex-grow-1" style="height:6px">
													<div class="progress-bar" style="width:{r.porcentaje}%; background:#12356b"></div>
												</div>
												<small class="text-secondary">{r.porcentaje}%</small>
											</div>
										</li>
									{/each}
								</ul>
							</section>
						{/if}
					{/if}
				{/if}
			</div>

			<!-- ============ ACCESOS (ambos roles) ============ -->
			<aside class="col-lg-4">
				<h2 class="h6 text-secondary mb-3">Accesos rápidos</h2>
				<div class="d-grid gap-2">
					{#each accesos as a}
						<AccesoRapido texto={a.texto} detalle={a.detalle} icono={a.icono} href={a.href} />
					{/each}
				</div>
			</aside>
		</div>
	</main>
</div>

<style>
	.panel {
		background: #fff;
		border: 1px solid #e3e8f0;
		border-radius: 1rem;
	}
	.destacado {
		border-left: 6px solid #adb5bd;
	}
	.destacado.holgado {
		border-left-color: #198754;
	}
	.destacado.pronto {
		border-left-color: #f59e0b;
	}
	.destacado.urgente {
		border-left-color: #dc3545;
	}
	.bloque-cifra {
		min-width: 7rem;
	}
	.cifra {
		font-size: 4.5rem;
		font-weight: 800;
		line-height: 1;
		letter-spacing: -0.03em;
		color: #0b1f44;
	}
	.cifra-texto {
		font-size: 2.5rem;
	}
	.punto {
		display: inline-block;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
	}
	.flex-none {
		flex: none;
	}
</style>
