<script lang="ts">
	import Placeholder from '~/lib/neuralforge/ui/Placeholder.svelte';
</script>

<svelte:head><title>Agent Lab — NeuralForge AI</title></svelte:head>

<Placeholder
	title="Agent Lab"
	intro="A deterministic multi-agent workflow simulator. Watch a Planner, Researcher, Analyst, Executor, Reviewer, and Coordinator collaborate on a task — with dependencies, parallel execution, and controlled failures."
	planned={[
		'Interactive agent + task dependency graph',
		'Sequential and parallel task execution',
		'Queued / running / completed / failed / cancelled / blocked states',
		'Retry policies with configurable limits and timeout simulation',
		'Failure injection, cancellation, and replay',
		'Execution history and final output aggregation'
	]}
/>
