<script>
	import { page } from '$app/state';
	import CoordinadorNavbar from '$lib/components/CoordinadorNavbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Guard from '$lib/components/Guard.svelte';

	let { children } = $props();
	const esTablero = $derived(page.route.id === '/coordinador/tablero-datos');
</script>

<Guard roles={['coordinador']}>
	<div class={esTablero ? 'tablero-pantalla' : 'd-contents'}>
		<CoordinadorNavbar />
		<div class={esTablero ? 'tablero-contenido' : 'd-flex bg-light min-vh-100 position-relative'}>
			<main class={esTablero ? 'h-100' : 'flex-grow-1 p-3 p-md-4 overflow-x-hidden'} style="min-width: 0;">
				{@render children()}
			</main>
		</div>
		{#if !esTablero}<Footer />{/if}
	</div>
</Guard>

<style>
	.d-contents {
		display: contents;
	}
</style>
