<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEditor } from '../rete/setup';
  import { editorActions, editorStore } from '../stores/editor';
  import { graphActions, graphStore } from '../stores/graph';

  let container: HTMLElement;
  let editor: any;
  let area: any;
  let unsubscribe: (() => void) | undefined;

  onMount(async () => {
    if (container) {
      const result = await createEditor(container);
      editor = result.editor;
      area = result.area;

      editorActions.setEditor(editor, area);

      // Listen for changes and update graph store
      editor.addPipe((context: any) => {
        if (
          context.type === 'noderemoved' ||
          context.type === 'nodeadded' ||
          context.type === 'connectioncreated' ||
          context.type === 'connectionremoved'
        ) {
          // Debounce graph updates
          setTimeout(() => {
            graphActions.updateFromEditor(editor, area);
          }, 100);
        }
        return context;
      });

      // Load graph if exists
      const currentGraph = $graphStore.current;
      if (currentGraph && currentGraph.nodes.length > 0) {
        await loadGraphIntoEditor(currentGraph);
      } else {
        // Create example nodes
        await createExampleGraph();
      }
    }
  });

  async function loadGraphIntoEditor(graph: any) {
    if (!editor || !area) return;

    // Clear existing
    const nodes = Array.from(editor.getNodes());
    for (const node of nodes) {
      await editor.removeNode(node.id);
    }

    // Import nodes
    const { createNode } = await import('../rete/nodes');
    const nodeMap = new Map();

    for (const nodeData of graph.nodes) {
      const node = createNode(nodeData.type as any);

      // Restore controls
      Object.entries(nodeData.controls || {}).forEach(([key, value]) => {
        if (node.controls[key]) {
          node.controls[key].value = value;
        }
      });

      await editor.addNode(node);
      await area.translate(node.id, nodeData.position);
      nodeMap.set(nodeData.id, node);
    }

    // Import connections
    const { ClassicPreset } = await import('rete');
    for (const connData of graph.connections) {
      const sourceNode = Array.from(editor.getNodes()).find(
        (n: any) => nodeMap.get(connData.source)?.id === n.id
      );
      const targetNode = Array.from(editor.getNodes()).find(
        (n: any) => nodeMap.get(connData.target)?.id === n.id
      );

      if (sourceNode && targetNode) {
        try {
          await editor.addConnection(
            new ClassicPreset.Connection(
              sourceNode,
              connData.sourceOutput,
              targetNode,
              connData.targetInput
            )
          );
        } catch (error) {
          console.warn('Failed to create connection:', error);
        }
      }
    }
  }

  async function createExampleGraph() {
    if (!editor || !area) return;

    try {
      const { createNode } = await import('../rete/nodes');
      const { ClassicPreset } = await import('rete');

      console.log('📦 Creating example graph...');

      // Create a simple 2-node workflow for easier testing
      const input = createNode('input');
      const output = createNode('output');

      await editor.addNode(input);
      await editor.addNode(output);

      // Position nodes with more space
      await area.translate(input.id, { x: 300, y: 200 });
      await area.translate(output.id, { x: 700, y: 200 });

      console.log('✅ Nodes created:', { input: input.id, output: output.id });

      // Create a simple connection
      try {
        const conn = new ClassicPreset.Connection(input, 'value', output, 'value');
        await editor.addConnection(conn);
        console.log('✅ Connection created:', conn);
      } catch (connError) {
        console.error('❌ Failed to create connection:', connError);
      }

      // Update graph store
      graphActions.updateFromEditor(editor, area);
      console.log('✅ Example graph complete');
    } catch (error) {
      console.error('❌ Error creating example graph:', error);
    }
  }

  onDestroy(() => {
    if (unsubscribe) unsubscribe();
  });
</script>

<div class="w-full h-full relative" bind:this={container} data-testid="editor-canvas">
  <div class="absolute top-4 right-4 z-10 flex space-x-2">
    <button
      class="btn btn-secondary text-sm"
      on:click={() => editorActions.zoomIn()}
      data-testid="zoom-in-btn"
      title="Zoom In (Ctrl/Cmd + =)"
    >
      🔍+
    </button>
    <button
      class="btn btn-secondary text-sm"
      on:click={() => editorActions.zoomOut()}
      data-testid="zoom-out-btn"
      title="Zoom Out (Ctrl/Cmd + -)"
    >
      🔍-
    </button>
    <button
      class="btn btn-secondary text-sm"
      on:click={() => editorActions.zoomToFit()}
      data-testid="zoom-fit-btn"
      title="Zoom to Fit (Ctrl/Cmd + 0)"
    >
      🎯
    </button>
  </div>
</div>
