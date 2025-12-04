import { NodeEditor, ClassicPreset } from 'rete';
import { AreaPlugin, AreaExtensions } from 'rete-area-plugin';
import { ConnectionPlugin, Presets as ConnectionPresets, BidirectFlow } from 'rete-connection-plugin';
import { SveltePlugin, Presets } from 'rete-svelte-plugin';
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

class Connection<A extends Node, B extends Node> extends ClassicPreset.Connection<A, B> {}

type Conn = Connection<Node, Node>;
type Schemes = {
  Node: Node;
  Connection: Conn;
};

export type { Schemes, Node, Conn };

export async function createEditor(container: HTMLElement) {
  const editor = new NodeEditor<Schemes>();
  const area = new AreaPlugin<Schemes, any>(container);
  const connection = new ConnectionPlugin<Schemes, any>();
  const render = new SveltePlugin<Schemes, any>();

  // Setup connection preset using BidirectFlow for drag-to-connect
  connection.addPreset(() => new BidirectFlow({
    makeConnection(from, to, context) {
      console.log('🔗 Making connection:', { from, to, context });
      
      // Determine source and target based on context
      const isSocket = context === 'socket';
      const sourceInfo = isSocket ? from : to;
      const targetInfo = isSocket ? to : from;
      
      // Prevent self-connections
      if (sourceInfo.nodeId === targetInfo.nodeId) {
        console.log('❌ Cannot connect node to itself');
        return false;
      }
      
      // Get nodes
      const sourceNode = editor.getNode(sourceInfo.nodeId);
      const targetNode = editor.getNode(targetInfo.nodeId);
      
      if (!sourceNode || !targetNode) {
        console.log('❌ Nodes not found');
        return false;
      }
      
      // Check socket compatibility
      const sourceOutput = sourceNode.outputs[sourceInfo.key];
      const targetInput = targetNode.inputs[targetInfo.key];
      
      if (!sourceOutput || !targetInput) {
        console.log('❌ Sockets not found');
        return false;
      }
      
      const compatible = isSocketCompatible(sourceOutput.socket, targetInput.socket);
      console.log(`Socket compatibility: ${sourceOutput.socket.name} → ${targetInput.socket.name} = ${compatible}`);
      
      if (!compatible) {
        console.log('❌ Incompatible socket types');
        return false;
      }
      
      // Create connection
      try {
        const conn = new Connection(
          sourceNode as any,
          sourceInfo.key,
          targetNode as any,
          targetInfo.key
        );
        
        editor.addConnection(conn);
        console.log('✅ Connection created successfully!');
        return true;
      } catch (error) {
        console.error('❌ Failed to create connection:', error);
        return false;
      }
    }
  }));

  // Setup rendering preset
  render.addPreset(Presets.classic.setup());

  // Register plugins
  editor.use(area);
  area.use(connection);
  area.use(render);

  // Register selectable nodes
  AreaExtensions.selectableNodes(area, AreaExtensions.selector(), {
    accumulating: AreaExtensions.accumulateOnCtrl(),
  });

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

  // Register remaining plugins
  area.use(contextMenu);
  area.use(arrange);
  // area.use(minimap); // Uncomment if minimap container is available

  // Zoom extent (only if there are nodes)
  const nodes = editor.getNodes();
  if (nodes.length > 0) {
    AreaExtensions.zoomAt(area, nodes);
  }

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
      const nodes = Array.from(editor.getNodes());
      for (const node of nodes) {
        (node as any).selected = true;
        await area.update('node', node.id);
      }
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
