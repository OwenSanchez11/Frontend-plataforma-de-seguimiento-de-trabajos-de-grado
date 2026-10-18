<script>
	import Guard from '$lib/components/Guard.svelte';

	let { children } = $props();
</script>

<Guard roles={['docente']}>
	{@render children()}
</Guard>
