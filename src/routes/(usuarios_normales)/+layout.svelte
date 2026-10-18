<script>
	import NavBar from '$lib/components/NavBar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Guard from '$lib/components/Guard.svelte';

	let { children } = $props();
</script>

<Guard roles={['estudiante', 'docente']}>
	<NavBar />
	<div class="d-flex bg-light min-vh-100 position-relative">
		<main class="flex-grow-1 p-3 p-md-4 overflow-x-hidden">
			{@render children()}
		</main>
	</div>
	<Footer />
</Guard>
