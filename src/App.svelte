<script lang="ts">
  import { onMount } from 'svelte';
  import EditorCanvas from './components/EditorCanvas.svelte';
  import NodePalette from './components/NodePalette.svelte';
  import InspectorPanel from './components/InspectorPanel.svelte';
  import RunPanel from './components/RunPanel.svelte';
  import { graphActions } from './stores/graph';

  let showPalette = true;
  let showInspector = true;
  let showRunPanel = true;

  onMount(() => {
    // Initialize with a new graph
    graphActions.createNew('New Workflow', 'AI Workflow Pipeline');
  });
</script>

<main class="h-screen w-screen flex flex-col overflow-hidden bg-dark-900">
  <!-- Header -->
  <header class="h-14 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4 flex-shrink-0">
    <div class="flex items-center space-x-3">
      <div class="text-primary-400 text-xl font-bold">
        📦 Visual Workflow Editor
      </div>
      <span class="text-dark-400 text-sm">AI Pipelines</span>
    </div>

    <div class="flex items-center space-x-2">
      <button
        class="btn btn-secondary text-sm"
        on:click={() => (showPalette = !showPalette)}
        data-testid="toggle-palette-btn"
      >
        {showPalette ? 'Hide' : 'Show'} Palette
      </button>
      <button
        class="btn btn-secondary text-sm"
        on:click={() => (showInspector = !showInspector)}
        data-testid="toggle-inspector-btn"
      >
        {showInspector ? 'Hide' : 'Show'} Inspector
      </button>
      <button
        class="btn btn-secondary text-sm"
        on:click={() => (showRunPanel = !showRunPanel)}
        data-testid="toggle-run-panel-btn"
      >
        {showRunPanel ? 'Hide' : 'Show'} Run Panel
      </button>
    </div>
  </header>

  <!-- Main Content -->
  <div class="flex-1 flex overflow-hidden">
    <!-- Left Sidebar - Node Palette -->
    {#if showPalette}
      <aside class="w-64 bg-dark-800 border-r border-dark-700 flex-shrink-0 overflow-y-auto">
        <NodePalette />
      </aside>
    {/if}

    <!-- Center - Editor Canvas -->
    <div class="flex-1 relative overflow-hidden">
      <EditorCanvas />
    </div>

    <!-- Right Sidebar - Inspector & Run Panel -->
    <aside class="w-80 bg-dark-800 border-l border-dark-700 flex flex-col flex-shrink-0">
      {#if showInspector}
        <div class="flex-1 overflow-y-auto border-b border-dark-700">
          <InspectorPanel />
        </div>
      {/if}
      {#if showRunPanel}
        <div class="flex-1 overflow-y-auto">
          <RunPanel />
        </div>
      {/if}
    </aside>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
