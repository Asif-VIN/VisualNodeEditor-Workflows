import { writable, get } from 'svelte/store';
import type { NodeEditor } from 'rete';
import type { AreaPlugin } from 'rete-area-plugin';

export interface EditorState {
  editor: NodeEditor<any> | null;
  area: AreaPlugin<any, any> | null;
  selectedNodes: Set<string>;
  clipboard: any[];
}

const initialState: EditorState = {
  editor: null,
  area: null,
  selectedNodes: new Set(),
  clipboard: []
};

export const editorStore = writable<EditorState>(initialState);

// Helper functions
export const editorActions = {
  setEditor(editor: NodeEditor<any>, area: AreaPlugin<any, any>) {
    editorStore.update(state => ({ ...state, editor, area }));
  },

  selectNode(nodeId: string) {
    editorStore.update(state => {
      const selected = new Set(state.selectedNodes);
      selected.add(nodeId);
      return { ...state, selectedNodes: selected };
    });
  },

  deselectNode(nodeId: string) {
    editorStore.update(state => {
      const selected = new Set(state.selectedNodes);
      selected.delete(nodeId);
      return { ...state, selectedNodes: selected };
    });
  },

  clearSelection() {
    editorStore.update(state => ({ ...state, selectedNodes: new Set() }));
  },

  async addNode(nodeType: string, position?: { x: number; y: number }) {
    const state = get(editorStore);
    if (!state.editor || !state.area) return;

    // Import node factory
    const { createNode } = await import('../rete/nodes');
    const node = createNode(nodeType as any);

    await state.editor.addNode(node);

    // Position node
    if (position) {
      await state.area.translate(node.id, position);
    } else {
      // Center in viewport
      const { x, y } = state.area.area.pointer;
      await state.area.translate(node.id, { x, y });
    }

    return node;
  },

  async removeNode(nodeId: string) {
    const state = get(editorStore);
    if (!state.editor) return;

    await state.editor.removeNode(nodeId);
    editorActions.deselectNode(nodeId);
  },

  async removeSelectedNodes() {
    const state = get(editorStore);
    const selected = Array.from(state.selectedNodes);

    for (const nodeId of selected) {
      await editorActions.removeNode(nodeId);
    }
  },

  async copySelectedNodes() {
    const state = get(editorStore);
    if (!state.editor) return;

    const selected = Array.from(state.selectedNodes);
    const clipboard: any[] = [];

    for (const nodeId of selected) {
      const node = state.editor.getNode(nodeId);
      if (node) {
        clipboard.push({
          type: node.label,
          controls: node.controls
        });
      }
    }

    editorStore.update(s => ({ ...s, clipboard }));
  },

  async pasteNodes() {
    const state = get(editorStore);
    if (!state.clipboard.length) return;

    editorActions.clearSelection();

    for (const item of state.clipboard) {
      // Create new node with offset
      const node = await editorActions.addNode(
        item.type.toLowerCase(),
        { x: 100, y: 100 } // Offset from original
      );

      if (node) {
        editorActions.selectNode(node.id);
      }
    }
  },

  async zoomIn() {
    const state = get(editorStore);
    if (!state.area) return;

    const currentZoom = state.area.area.transform.k;
    await state.area.area.zoom(currentZoom * 1.2);
  },

  async zoomOut() {
    const state = get(editorStore);
    if (!state.area) return;

    const currentZoom = state.area.area.transform.k;
    await state.area.area.zoom(currentZoom * 0.8);
  },

  async zoomToFit() {
    const state = get(editorStore);
    if (!state.area || !state.editor) return;

    const nodes = Array.from(state.editor.getNodes());
    if (nodes.length === 0) return;

    // Calculate bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    for (const node of nodes) {
      const view = state.area.nodeViews.get(node.id);
      if (view) {
        const pos = view.position;
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + (node.width || 200));
        maxY = Math.max(maxY, pos.y + (node.height || 100));
      }
    }

    // Zoom to fit with padding
    const padding = 50;
    const width = maxX - minX + padding * 2;
    const height = maxY - minY + padding * 2;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    await state.area.area.zoom(0.8);
    await state.area.area.translate(centerX, centerY);
  }
};
