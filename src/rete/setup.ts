import { NodeEditor, GetSchemes, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets } from 'rete-connection-plugin';
import { SveltePlugin, Presets, SvelteArea2D } from 'rete-svelte-plugin';
import { AutoArrangePlugin, Presets as ArrangePresets } from 'rete-auto-arrange-plugin';
import { ContextMenuPlugin, Presets as ContextMenuPresets } from 'rete-context-menu-plugin';
import { MinimapPlugin } from 'rete-minimap-plugin';
import { isSocketCompatible } from '../types/sockets';
import * as Nodes from './nodes';

// Define schemes
type Node = 
  | Nodes.InputNode
  | Nodes.RetrieverNode
  | Nodes.RankerNode
  | Nodes.RouterNode
  | Nodes.ToolCallNode
  | Nodes.SummarizerNode
  | Nodes.EvaluatorNode
  | Nodes.GuardrailNode
  | Nodes.OutputNode;

type Conn = Connection<Node, Node>;
type Schemes = GetSchemes<Node, Conn>;

class Connection<A extends Node, B extends Node> extends ClassicPreset.Connection<A, B> {}

export type { Schemes, Node, Conn };

export async function createEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, SvelteArea2D<Schemes>>(container);
  const connection = new ConnectionPlugin<Schemes, SvelteArea2D<Schemes>>();
  const render = new SveltePlugin<Schemes, SvelteArea2D<Schemes>>();

  // Setup connection validation
  connection.addPreset(() =>
    ConnectionPresets.classic.setup({
      canMakeConnection(from, to) {
        // Prevent self-connections
        if (from.nodeId === to.nodeId) return false;

        // Check socket compatibility
        const sourceNode = editor.getNode(from.nodeId);
        const targetNode = editor.getNode(to.nodeId);

        if (!sourceNode || !targetNode) return false;

        const sourceOutput = sourceNode.outputs[from.key];
        const targetInput = targetNode.inputs[to.key];

        if (!sourceOutput || !targetInput) return false;

        return isSocketCompatible(sourceOutput.socket, targetInput.socket);
      },
    })
  );

  // Register plugins
  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

  render.addPreset(Presets.classic.setup());

  // Setup context menu
  const contextMenu = new ContextMenuPlugin<Schemes>({
    items: ContextMenuPresets.classic.setup([
      ['Input', () => new Nodes.InputNode()],
      ['Retriever', () => new Nodes.RetrieverNode()],
      ['Ranker', () => new Nodes.RankerNode()],
      ['Router', () => new Nodes.RouterNode()],
      ['Tool Call', () => new Nodes.ToolCallNode()],
      ['Summarizer', () => new Nodes.SummarizerNode()],
      ['Evaluator', () => new Nodes.EvaluatorNode()],
      ['Guardrail', () => new Nodes.GuardrailNode()],
      ['Output', () => new Nodes.OutputNode()],
    ]),
  });

  // Setup auto-arrange
  const arrange = new AutoArrangePlugin<Schemes>();
  arrange.addPreset(ArrangePresets.classic.setup());

  // Setup minimap
  const minimap = new MinimapPlugin<Schemes>();

  editor.use(area);
  area.use(connection);
  area.use(render);
  area.use(contextMenu);
  area.use(arrange);
  // area.use(minimap); // Uncomment if minimap container is available

  // Zoom extent
  AreaExtensions.zoomAt(area, editor.getNodes());

  // Keyboard shortcuts
  setupKeyboardShortcuts(editor, area);

  return { editor, area, connection, render, arrange };
}

function setupKeyboardShortcuts(
  editor: NodeEditor<Schemes>,
  area: AreaPlugin<Schemes, any>
) {
  const handleKeyDown = async (e: KeyboardEvent) => {
    // Delete selected nodes
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const selectedNodes = Array.from(editor.getNodes()).filter((node) => {
        return (node as any).selected;
      });

      for (const node of selectedNodes) {
        await editor.removeNode(node.id);
      }
    }

    // Select all (Ctrl/Cmd + A)
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      const nodes = editor.getNodes();
      nodes.forEach((node) => {
        (node as any).selected = true;
      });
      await area.update('node', node.id);
    }

    // Zoom in (Ctrl/Cmd + =)
    if ((e.ctrlKey || e.metaKey) && e.key === '=') {
      e.preventDefault();
      const k = area.area.transform.k;
      await area.area.zoom(k * 1.2);
    }

    // Zoom out (Ctrl/Cmd + -)
    if ((e.ctrlKey || e.metaKey) && e.key === '-') {
      e.preventDefault();
      const k = area.area.transform.k;
      await area.area.zoom(k * 0.8);
    }

    // Zoom to fit (Ctrl/Cmd + 0)
    if ((e.ctrlKey || e.metaKey) && e.key === '0') {
      e.preventDefault();
      await AreaExtensions.zoomAt(area, editor.getNodes());
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}
