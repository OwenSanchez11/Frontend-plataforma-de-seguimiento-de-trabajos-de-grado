<svelte:head>
	<title>Tablero de datos | GradosTrack</title>
</svelte:head>

<h1 class="visually-hidden">Tablero de datos</h1>

<iframe
	class="d-block w-100 h-100 border-0 bg-white"
	title="Tablero de datos de Power BI"
	src="https://app.powerbi.com/reportEmbed?reportId=a3210235-c7a4-4177-8335-07412b874f44&amp;autoAuth=true&amp;ctid=740be6bd-fd36-470e-94d9-0f0c777fadb9"
	allowfullscreen
></iframe>

<style>
	:global(.tablero-pantalla) {
		display: grid;
		grid-template-rows: auto minmax(auto, 1fr);
		min-height: 100dvh;
	}

	:global(.tablero-contenido) {
		min-width: 0;
		/* Keep room for the 16:9 report canvas and the Power BI page tabs. */
		min-height: max(20rem, calc(56.25vw + 2.5rem));
	}
</style>
