<script>
    import { onMount } from 'svelte';
    import { sesion } from '$lib/sesion.svelte.js';
    import {
        getTrabajos,
        getAvances
    } from '$lib/api.js';

    let trabajos = $state([]);
    let avances = $state([]);

    let cargando = $state(true);
    let error = $state('');

    let usuario = $derived(sesion.usuario);

    // Obtener listas aunque el backend devuelva diferentes estructuras
    function obtenerLista(respuesta) {
        if (Array.isArray(respuesta)) return respuesta;
        if (Array.isArray(respuesta?.data)) return respuesta.data;
        if (Array.isArray(respuesta?.items)) return respuesta.items;
        return [];
    }

    // Identificar la carrera del coordinador
    let idCarrera = $derived(
        usuario?.id_carrera ??
        usuario?.carrera?.id_carrera ??
        usuario?.idCarrera ??
        null
    );

    // Filtrar los trabajos por carrera
    let trabajosCarrera = $derived(
        idCarrera
            ? trabajos.filter(
                (trabajo) =>
                    Number(trabajo.id_carrera) === Number(idCarrera)
            )
            : trabajos
    );

    // Consultar información del backend
    async function cargarDatos() {
        cargando = true;
        error = '';

        try {
            const [respuestaTrabajos, respuestaAvances] =
                await Promise.all([
                    getTrabajos(),
                    getAvances()
                ]);

            trabajos = obtenerLista(respuestaTrabajos);
            avances = obtenerLista(respuestaAvances);

        } catch (e) {
            console.error('Error al cargar el inicio del coordinador:', e);
            error = e.message || 'No fue posible cargar la información.';
        } finally {
            cargando = false;
        }
    }

    onMount(() => {
        cargarDatos();
    });

    // Trabajos pendientes de aprobación
    let pendientes = $derived(
        trabajosCarrera.filter((trabajo) => {
            const estado = String(
                trabajo.estado_tramite ?? ''
            ).toLowerCase();

            return (
                estado.includes('pendiente') ||
                estado.includes('revisión')
            ) && trabajo.estado !== false;
        })
    );

    // Trabajos próximos a vencer (próximos 7 días)
    function estaPorVencer(trabajo) {
        if (!trabajo.fecha_fin || trabajo.estado === false) {
            return false;
        }

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const fechaFin = new Date(
            String(trabajo.fecha_fin).slice(0, 10) + 'T00:00:00'
        );

        if (isNaN(fechaFin.getTime())) return false;

        const diferencia =
            (fechaFin.getTime() - hoy.getTime()) /
            (1000 * 60 * 60 * 24);

        return diferencia >= 0 && diferencia <= 7;
    }

    let porVencer = $derived(
        trabajosCarrera.filter(estaPorVencer)
    );

    // Identificar si la respuesta del backend contiene información de jurados
    function tieneJurado(trabajo) {
        const campos = [
            'id_jurado',
            'jurado_id',
            'id_usuario_jurado',
            'id_user_jurado',
            'jurado'
        ];

        for (const campo of campos) {
            if (campo in trabajo) {
                const valor = trabajo[campo];

                if (Array.isArray(valor)) return valor.length > 0;
                return valor !== null && valor !== undefined && valor !== '';
            }
        }

        return null;
    }

    let tieneInformacionJurado = $derived(
        trabajosCarrera.some((trabajo) =>
            [
                'id_jurado',
                'jurado_id',
                'id_usuario_jurado',
                'id_user_jurado',
                'jurado'
            ].some((campo) => campo in trabajo)
        )
    );

    let sinJurado = $derived(
        tieneInformacionJurado
            ? trabajosCarrera.filter(
                (trabajo) =>
                    trabajo.estado !== false &&
                    tieneJurado(trabajo) === false
            ).length
            : null
    );

    // Obtener los avances de los trabajos de la carrera
    let avancesCarrera = $derived(
        avances
            .filter((avance) =>
                trabajosCarrera.some(
                    (trabajo) =>
                        Number(trabajo.id_trabajo_grado) ===
                        Number(avance.id_trabajo_grado)
                )
            )
            .sort((a, b) => {
                const fechaA = new Date(
                    a.fecha_entrega ?? 0
                ).getTime();

                const fechaB = new Date(
                    b.fecha_entrega ?? 0
                ).getTime();

                return fechaB - fechaA;
            })
            .slice(0, 5)
    );

    // Buscar el nombre del trabajo relacionado con cada avance
    function nombreTrabajo(idTrabajo) {
        const trabajo = trabajosCarrera.find(
            (item) =>
                Number(item.id_trabajo_grado) === Number(idTrabajo)
        );

        return trabajo?.titulo ?? 'Trabajo no encontrado';
    }

    // Formatear fechas
    function formatearFecha(fecha) {
        if (!fecha) return 'Sin fecha';

        const fechaTexto = String(fecha).slice(0, 10);
        const partes = fechaTexto.split('-');

        if (partes.length !== 3) return fechaTexto;

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    let resumen = $derived([
        {
            etiqueta: 'Pendientes de aprobación',
            valor: pendientes.length,
            icono: 'bi-hourglass-split'
        },
        {
            etiqueta: 'Sin jurado asignado',
            valor: sinJurado ?? 'Por identificar',
            icono: 'bi-people'
        },
        {
            etiqueta: 'Por vencer',
            valor: porVencer.length,
            icono: 'bi-calendar-event'
        }
    ]);

    
    let accesosRapidos = [
        {
            texto: 'Crear nuevo trabajo de grado',
            icono: 'bi-plus-circle',
            ruta: '/coordinador/trabajoGrado'
        },
        {
            texto: 'Asignar jurado',
            icono: 'bi-people',
            ruta: '/coordinador/roles'
        }
    ];

</script>

<!-- BIENVENIDA -->
<section class="mb-4">
    <h4 class="fw-bold">
        Bienvenido, {usuario?.nombre ?? 'Coordinador'}
    </h4>

    <p class="text-muted mb-0">
        Aquí puedes consultar el estado de los trabajos de grado
        y los avances de tu carrera.
    </p>
</section>

<!-- MENSAJE DE ERROR -->
{#if error}
    <div class="alert alert-danger" role="alert">
        {error}

        <button
            type="button"
            class="btn btn-sm btn-outline-danger ms-2"
            onclick={cargarDatos}
        >
            Reintentar
        </button>
    </div>
{/if}

<!-- ACCESOS RÁPIDOS -->
<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">Accesos rápidos</h6>

        <div class="d-flex gap-2 flex-wrap">
            {#each accesosRapidos as acceso}
                <a
                    href={acceso.ruta}
                    class="btn btn-primary d-flex align-items-center gap-2"
                >
                    <i class="bi {acceso.icono}"></i>
                    {acceso.texto}
                </a>
            {/each}
        </div>
    </div>
</section>

<!-- RESUMEN -->
<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">
            Resumen: trabajos pendientes de aprobación (su carrera)
        </h6>

        {#if cargando}
            <p class="text-muted mb-0">
                Cargando resumen...
            </p>
        {:else}
            <div class="row g-3 mt-1">
                {#each resumen as item}
                    <div class="col-md-4">
                        <div class="border rounded p-3 text-center h-100">
                            <i class="bi {item.icono} fs-4 text-primary"></i>

                            <div class="fs-4 fw-bold mt-2">
                                {item.valor}
                            </div>

                            <div class="text-muted small">
                                {item.etiqueta}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</section>

<!-- AVANCES RECIENTES -->
<section class="card mb-4">
    <div class="card-body">
        <h6 class="fw-bold">
            Avances recientes reportados
        </h6>

        {#if cargando}
            <p class="text-muted mb-0">
                Cargando avances...
            </p>

        {:else if avancesCarrera.length === 0}
            <div class="alert alert-info mb-0">
                No hay avances recientes registrados para tu carrera.
            </div>

        {:else}
            <ul class="list-group list-group-flush">
                {#each avancesCarrera as item (item.id_avance)}
                    <li class="list-group-item d-flex justify-content-between align-items-center gap-3">
                        <div>
                            <div class="fw-semibold">
                                {nombreTrabajo(item.id_trabajo_grado)}
                            </div>

                            <div class="text-muted small">
                                {item.descripcion || item.titulo || 'Sin descripción'}
                            </div>
                        </div>

                        <span class="text-muted small text-nowrap">
                            {formatearFecha(item.fecha_entrega)}
                        </span>
                    </li>
                {/each}
            </ul>
        {/if}
    </div>
</section>

{#if !cargando && !idCarrera}
    <div class="alert alert-warning">
        No se encontró el identificador de carrera en la sesión.
        Por ahora se muestran los trabajos de todas las carreras.
        Revisa los datos guardados al iniciar sesión.
    </div>
{/if}