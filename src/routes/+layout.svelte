<script>
  import { page } from '$app/stores';
  import favicon from '$lib/assets/favicon.svg';
  import 'bootstrap/dist/css/bootstrap.min.css';
  import '../app.css';

  let { children } = $props();

  const nombresRutas = {
    admin: 'Administración',
    coordinador: 'Coordinación',
    docente: 'Docencia',
    estudiante: 'Estudiante',
    login: 'Iniciar sesión',
    roles: 'Roles',
    usuarios: 'Usuarios',
    evaluaciones: 'Evaluaciones',
    avances: 'Avances y entregas',
    'trabajoGrado': 'Trabajo de grado',
    'trabajos-grado': 'Trabajos de grado',
    'facultades-carreras': 'Facultades y carreras'
  };

  let titulo = $derived.by(() => {
    const segmentos = $page.url.pathname.split('/').filter(Boolean);
    if (segmentos.length === 0) return 'Inicio | GradosTrack';

    const ultimoSegmento = segmentos.at(-1);
    const nombre = nombresRutas[ultimoSegmento] ??
      ultimoSegmento.replaceAll('-', ' ').replace(/\b\w/g, letra => letra.toUpperCase());

    return `${nombre} | GradosTrack`;
  });
</script>

<svelte:head>
  <title>{titulo}</title>
  <link rel="icon" href={favicon} />
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"
  />
</svelte:head>
{@render children()}
