<script>
	import { onMount } from 'svelte';
	import Banner from '$lib/components/Banner.svelte';
	import BannerBienvenida from '$lib/components/BannerBienvenida.svelte';
	import { getAvancePorTrabajo, getTrabajoPorEstudiante, getCarreras } from '$lib/api';
	import { esAprobado } from '$lib/avances';
	import { inicioDelDia, parsearFechaLocal } from '$lib/fechas';
	import { sesion } from '$lib/sesion.svelte.js';

	let proyecto = $state(null);
	let avances = $state([]);
	let cargando = $state(true);
	let error = $state('');
	let sinTrabajo = $state(false);
	let carreras = $state([]);
	let usuario = $derived(sesion.usuario);
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

	onMount(async () => {
		try {
			const usuarioActual = sesion.usuario;
			if (usuarioActual?.id_carrera && !usuarioActual?.carrera?.nombre_carrera) {
				try {
					const respuestaCarreras = await getCarreras();
					carreras = Array.isArray(respuestaCarreras) ? respuestaCarreras : [];
				} catch {
					carreras = [];
				}
			}
			if (!usuarioActual || usuarioActual.rol !== 'estudiante') return;

			const asignacion = await getTrabajoPorEstudiante(usuarioActual.id_user);
			const trabajo = asignacion?.trabajo ?? null;
			if (!trabajo) {
				sinTrabajo = true;
				return;
			}

			const respuestaAvances = await getAvancePorTrabajo(trabajo.id_trabajo_grado);
			avances = Array.isArray(respuestaAvances) ? respuestaAvances : [];
			const avancesActivos = avances.filter((avance) => avance.estado);
			const hoy = inicioDelDia(new Date());
			const pendientes = avancesActivos
				.map((avance) => ({ ...avance, fechaLimiteLocal: parsearFechaLocal(avance.fecha_limite) }))
				.filter((avance) => !esAprobado(avance) && avance.fechaLimiteLocal && inicioDelDia(avance.fechaLimiteLocal) >= hoy)
				.sort((a, b) => a.fechaLimiteLocal - b.fechaLimiteLocal);
			const aprobados = avancesActivos.filter(esAprobado).length;
			const avanceGlobal = avancesActivos.length ? Math.round((aprobados / avancesActivos.length) * 100) : 0;

			proyecto = {
				radicacion: trabajo.radicacion ?? trabajo.codigo ?? trabajo.id_trabajo_grado,
				modalidad: trabajo.modalidad ?? trabajo.nombre_modalidad ?? 'Trabajo de grado',
				estado: trabajo.estado_tramite ?? 'En desarrollo',
				titulo: trabajo.titulo ?? 'Trabajo de grado asignado',
				descripcion: trabajo.descripcion ?? '',
				avanceGlobal,
				faseActual: `Fase ${aprobados} de ${avancesActivos.length} completadas`,
				hitoCritico: pendientes[0] ? { nombre: pendientes[0].titulo, limite: pendientes[0].fechaLimiteLocal } : null
			};
		} catch (e) {
			if (e.status === 404) sinTrabajo = true;
			else error = e.message || 'No fue posible cargar tu trabajo de grado.';
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
			descripcion={contexto}
			stats={[
				{ etiqueta: 'Carrera', valor: nombreCarrera },
				{ etiqueta: 'Correo', valor: usuario?.email ?? usuario?.correo ?? '—' },
				{ etiqueta: 'Rol', valor: usuario?.rol ?? '—' }
			]}
		/>
		<BannerBienvenida {usuario} {proyecto} {avances} {cargando} />
		{#if error}
			<div class="alert alert-danger small">{error}</div>
		{:else if sinTrabajo && !cargando}
			<div class="alert alert-info small">Aún no tienes un trabajo de grado asignado.</div>
		{/if}
	</main>
</div>
