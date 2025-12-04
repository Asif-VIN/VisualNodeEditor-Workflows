<script lang="ts">
  import { onMount } from 'svelte';
  import { editorStore } from '../stores/editor';
  import { executionStore, executionActions } from '../stores/execution';
  import { GraphExecutor } from '../engine/executor';
  import { validateGraph } from '../engine/validation';
  import type { LogEntry } from '../types/graph';

  let executor: GraphExecutor;
  let validationResult: any = null;
  let expandedLogs = new Set<number>();

  onMount(() => {
    executor = new GraphExecutor();
  });

  async function handleRun() {
    const state = $editorStore;
    if (!state.editor) return;

    executionActions.setRunning(true);
    executionActions.reset();

    try {
      const nodes = new Map();
      state.editor.getNodes().forEach((node: any) => {
        nodes.set(node.id, node);
      });

      const connections = Array.from(state.editor.getConnections());

      // Validate first
      validationResult = validateGraph(nodes, connections);

      if (!validationResult.valid) {
        alert(
          `Graph validation failed:\n${validationResult.errors.map((e: any) => e.message).join('\n')}`
        );
        executionActions.setRunning(false);
        return;
      }

      // Execute
      const result = await executor.executeGraph(nodes, connections, true);
      executionActions.setResult(result);
    } catch (error: any) {
      console.error('Execution error:', error);
      alert(`Execution failed: ${error.message}`);
    } finally {
      executionActions.setRunning(false);
    }
  }

  async function handleValidate() {
    const state = $editorStore;
    if (!state.editor) return;

    const nodes = new Map();
    state.editor.getNodes().forEach((node: any) => {
      nodes.set(node.id, node);
    });

    const connections = Array.from(state.editor.getConnections());
    validationResult = validateGraph(nodes, connections);
  }

  function toggleLogExpand(index: number) {
    if (expandedLogs.has(index)) {
      expandedLogs.delete(index);
    } else {
      expandedLogs.add(index);
    }
    expandedLogs = expandedLogs; // Trigger reactivity
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'success':
        return 'bg-green-900 text-green-200';
      case 'error':
        return 'bg-red-900 text-red-200';
      case 'running':
        return 'bg-blue-900 text-blue-200';
      default:
        return 'bg-dark-700 text-dark-300';
    }
  }

  function formatDuration(ms: number) {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }
</script>

<div class="p-4 h-full flex flex-col" data-testid="run-panel">
  <h2 class="text-lg font-semibold mb-4 text-dark-100">Execution</h2>

  <!-- Control Buttons -->
  <div class="space-y-2 mb-4">
    <button
      class="btn btn-primary w-full"
      on:click={handleRun}
      disabled={$executionStore.isRunning}
      data-testid="run-btn"
    >
      {#if $executionStore.isRunning}
        ⏳ Running...
      {:else}
        ▶️ Run Graph
      {/if}
    </button>
    <button
      class="btn btn-secondary w-full text-sm"
      on:click={handleValidate}
      data-testid="validate-btn"
    >
      ✅ Validate Graph
    </button>
  </div>

  <!-- Validation Results -->
  {#if validationResult}
    <div class="mb-4 panel p-3">
      <h3 class="font-semibold text-sm mb-2">
        {#if validationResult.valid}
          <span class="text-green-400">✅ Valid Graph</span>
        {:else}
          <span class="text-red-400">❌ Validation Failed</span>
        {/if}
      </h3>

      {#if validationResult.errors.length > 0}
        <div class="space-y-1 mb-2">
          <div class="text-xs font-semibold text-red-400">Errors:</div>
          {#each validationResult.errors as error}
            <div class="text-xs text-red-300 bg-red-900/20 p-2 rounded">
              {error.message}
            </div>
          {/each}
        </div>
      {/if}

      {#if validationResult.warnings.length > 0}
        <div class="space-y-1">
          <div class="text-xs font-semibold text-yellow-400">Warnings:</div>
          {#each validationResult.warnings as warning}
            <div class="text-xs text-yellow-300 bg-yellow-900/20 p-2 rounded">
              {warning.message}
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}

  <!-- Execution Results -->
  {#if $executionStore.result}
    <div class="mb-4 panel p-3">
      <h3 class="font-semibold text-sm mb-2">Results</h3>
      <div class="space-y-2 text-xs">
        <div>
          <span class="text-dark-400">Status:</span>
          <span class={`badge ml-2 ${$executionStore.result.success ? 'badge-success' : 'badge-error'}`}>
            {$executionStore.result.success ? 'Success' : 'Failed'}
          </span>
        </div>
        <div>
          <span class="text-dark-400">Duration:</span>
          <span class="text-dark-100 ml-2">
            {formatDuration($executionStore.result.duration)}
          </span>
        </div>
        <div>
          <span class="text-dark-400">Logs:</span>
          <span class="text-dark-100 ml-2">
            {$executionStore.result.logs.length} entries
          </span>
        </div>
      </div>

      {#if $executionStore.result.errors && $executionStore.result.errors.length > 0}
        <div class="mt-3">
          <div class="text-xs font-semibold text-red-400 mb-1">Errors:</div>
          {#each $executionStore.result.errors as error}
            <div class="text-xs text-red-300 bg-red-900/20 p-2 rounded mb-1">
              {error.message}
            </div>
          {/each}
        </div>
      {/if}

      {#if Object.keys($executionStore.result.outputs).length > 0}
        <div class="mt-3">
          <div class="text-xs font-semibold text-dark-100 mb-1">Outputs:</div>
          <div class="text-xs bg-dark-900 p-2 rounded font-mono overflow-x-auto">
            <pre class="text-dark-200">{JSON.stringify($executionStore.result.outputs, null, 2)}</pre>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Execution Logs -->
  {#if $executionStore.result && $executionStore.result.logs.length > 0}
    <div class="flex-1 overflow-y-auto">
      <h3 class="font-semibold text-sm mb-2 text-dark-100">Execution Logs</h3>
      <div class="space-y-2">
        {#each $executionStore.result.logs as log, index}
          <div class="panel p-2">
            <button
              class="w-full text-left"
              on:click={() => toggleLogExpand(index)}
              data-testid="log-item-{index}"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <span class={`badge ${getStatusColor(log.status)}`}>
                    {log.status}
                  </span>
                  <span class="text-xs font-semibold text-dark-100">
                    {log.nodeType}
                  </span>
                </div>
                <span class="text-xs text-dark-400">
                  {formatDuration(log.duration)}
                </span>
              </div>
              <div class="text-xs text-dark-300 mt-1">
                {log.message}
              </div>
            </button>

            {#if expandedLogs.has(index)}
              <div class="mt-2 pt-2 border-t border-dark-700 text-xs space-y-1">
                <div>
                  <span class="text-dark-400">Node ID:</span>
                  <span class="text-dark-200 font-mono ml-1">{log.nodeId}</span>
                </div>
                <div>
                  <span class="text-dark-400">Timestamp:</span>
                  <span class="text-dark-200 ml-1">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {#if log.data}
                  <div class="mt-2">
                    <div class="text-dark-400 mb-1">Data:</div>
                    <pre class="bg-dark-900 p-2 rounded text-dark-200 overflow-x-auto">{JSON.stringify(log.data, null, 2)}</pre>
                  </div>
                {/if}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {:else}
    <div class="flex-1 flex items-center justify-center">
      <div class="text-center text-dark-400 text-sm">
        <div class="text-4xl mb-2">🚀</div>
        <p>Run the graph to see execution logs</p>
      </div>
    </div>
  {/if}
</div>
