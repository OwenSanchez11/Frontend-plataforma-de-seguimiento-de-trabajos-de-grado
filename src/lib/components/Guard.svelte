<script>
	import { goto } from '$app/navigation';
	import { sesion } from '$lib/sesion.svelte.js';

	let { roles, children } = $props();

	let permitido = $derived(roles.includes(sesion.usuario?.rol));

	$effect(() => {
		if (!sesion.usuario) {
			goto('/login');
		} else if (!permitido) {
			const inicioPorRol = {
				administrador: '/admin',
				coordinador: '/coordinador',
				docente: '/',
				estudiante: '/'
			};
			goto(inicioPorRol[sesion.usuario.rol] ?? '/login');
		}
	});
</script>

{#if permitido}
	{@render children()}
{/if}
