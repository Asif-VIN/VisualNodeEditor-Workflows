<script lang="ts">
  import { editorStore } from '../stores/editor';
  import { graphStore, graphActions } from '../stores/graph';

  let selectedNode: any = null;

  $: {
    const state = $editorStore;
    if (state.editor && state.selectedNodes.size === 1) {
      const nodeId = Array.from(state.selectedNodes)[0];
      selectedNode = state.editor.getNode(nodeId);
    } else {
      selectedNode = null;
    }
  }

  function handleControlChange() {
    // Update graph when controls change
    const state = $editorStore;
    if (state.editor && state.area) {
      setTimeout(() => {
        graphActions.updateFromEditor(state.editor, state.area);
      }, 100);
    }
  }

  function handleExport() {
    const json = graphActions.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const text = await file.text();
        const success = graphActions.importJSON(text);
        if (success) {
          alert('Graph imported successfully!');
          // Reload editor
          location.reload();
        } else {
          alert('Failed to import graph. Invalid format.');
        }
      }
    };
    input.click();
  }
</script>

<div class="p-4 h-full flex flex-col" data-testid="inspector-panel">
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-lg font-semibold text-dark-100">Inspector</h2>
    <div class="flex space-x-1">
      <button
        class="btn btn-secondary text-xs px-2 py-1"
        on:click={handleExport}
        title="Export graph"
        data-testid="export-btn"
      >
        💾
      </button>
      <button
        class="btn btn-secondary text-xs px-2 py-1"
        on:click={handleImport}
        title="Import graph"
        data-testid="import-btn"
      >
        📂
      </button>
    </div>
  </div>

  {#if selectedNode}
    <div class="flex-1 overflow-y-auto space-y-4">
      <!-- Node Info -->
      <div class="panel p-3">
        <h3 class="font-semibold text-sm text-dark-100 mb-2">Node Info</h3>
        <div class="space-y-2 text-sm">
          <div>
            <span class="text-dark-400">Type:</span>
            <span class="text-dark-100 ml-2">{selectedNode.label}</span>
          </div>
          <div>
            <span class="text-dark-400">ID:</span>
            <span class="text-dark-100 ml-2 font-mono text-xs">{selectedNode.id}</span>
          </div>
        </div>
      </div>

      <!-- Controls -->
      {#if Object.keys(selectedNode.controls || {}).length > 0}
        <div class="panel p-3">
          <h3 class="font-semibold text-sm text-dark-100 mb-3">Controls</h3>
          <div class="space-y-3">
            {#each Object.entries(selectedNode.controls) as [key, control]}
              <div>
                <label class="block text-xs text-dark-400 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                {#if control.type === 'text'}
                  {#if key.includes('rules') || key.includes('parameters') || key.includes('policies') || key.includes('filters')}
                    <textarea
                      bind:value={control.value}
                      on:input={handleControlChange}
                      class="input text-xs font-mono"
                      rows="4"
                      data-testid="control-{key}"
                    />
                  {:else}
                    <input
                      type="text"
                      bind:value={control.value}
                      on:input={handleControlChange}
                      class="input text-sm"
                      data-testid="control-{key}"
                    />
                  {/if}
                {:else if control.type === 'number'}
                  <input
                    type="number"
                    bind:value={control.value}
                    on:input={handleControlChange}
                    class="input text-sm"
                    data-testid="control-{key}"
                  />
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Inputs/Outputs -->
      <div class="panel p-3">
        <h3 class="font-semibold text-sm text-dark-100 mb-2">Connections</h3>
        <div class="space-y-2 text-xs">
          <div>
            <span class="text-dark-400">Inputs:</span>
            <span class="text-dark-100 ml-2">
              {Object.keys(selectedNode.inputs || {}).length}
            </span>
          </div>
          <div>
            <span class="text-dark-400">Outputs:</span>
            <span class="text-dark-100 ml-2">
              {Object.keys(selectedNode.outputs || {}).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center text-dark-400 text-sm">
        <div class="text-4xl mb-2">👆</div>
        <p>Select a node to inspect</p>
      </div>
    </div>
  {/if}

  <!-- Graph Stats -->
  <div class="mt-4 pt-4 border-t border-dark-700">
    <h3 class="font-semibold text-sm text-dark-100 mb-2">Graph Stats</h3>
    <div class="text-xs text-dark-400 space-y-1">
      <div>Nodes: {$graphStore.current?.meta.nodesCount || 0}</div>
      <div>Connections: {$graphStore.current?.meta.connectionsCount || 0}</div>
      <div class="pt-2">
        {#if $graphStore.isDirty}
          <span class="badge badge-warning">Unsaved Changes</span>
        {:else}
          <span class="badge badge-success">Saved</span>
        {/if}
      </div>
    </div>
  </div>
</div>
