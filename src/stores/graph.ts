import { writable, get } from 'svelte/store';
import type { SerializedGraph, GraphMeta } from '../types/graph';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import graphSchema from '../schemas/graph.schema.json';
import { v4 as uuidv4 } from 'uuid';

const ajv = new Ajv();
addFormats(ajv);
const validateSchema = ajv.compile(graphSchema);

export interface GraphState {
  current: SerializedGraph | null;
  history: SerializedGraph[];
  historyIndex: number;
  isDirty: boolean;
}

const initialState: GraphState = {
  current: null,
  history: [],
  historyIndex: -1,
  isDirty: false
};

export const graphStore = writable<GraphState>(initialState);

// Helper functions
export const graphActions = {
  createNew(name: string, description?: string): SerializedGraph {
    const graph: SerializedGraph = {
      version: '1.0.0',
      meta: {
        id: uuidv4(),
        name,
        description,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        nodesCount: 0,
        connectionsCount: 0
      },
      nodes: [],
      connections: [],
      comments: []
    };

    graphStore.set({
      current: graph,
      history: [graph],
      historyIndex: 0,
      isDirty: false
    });

    return graph;
  },

  load(graph: SerializedGraph): boolean {
    // Validate schema
    const valid = validateSchema(graph);
    if (!valid) {
      console.error('Invalid graph schema:', validateSchema.errors);
      return false;
    }

    graphStore.set({
      current: graph,
      history: [graph],
      historyIndex: 0,
      isDirty: false
    });

    return true;
  },

  save(): SerializedGraph | null {
    const state = get(graphStore);
    if (!state.current) return null;

    // Update metadata
    const updated: SerializedGraph = {
      ...state.current,
      meta: {
        ...state.current.meta,
        updatedAt: new Date().toISOString()
      }
    };

    graphStore.update(s => ({ ...s, current: updated, isDirty: false }));
    return updated;
  },

  exportJSON(): string {
    const state = get(graphStore);
    if (!state.current) return '';
    return JSON.stringify(state.current, null, 2);
  },

  importJSON(json: string): boolean {
    try {
      const graph = JSON.parse(json);
      return graphActions.load(graph);
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return false;
    }
  },

  updateFromEditor(editor: any, area: any) {
    const state = get(graphStore);
    if (!state.current || !editor) return;

    // Serialize nodes
    const nodes = Array.from(editor.getNodes()).map((node: any) => {
      const view = area.nodeViews.get(node.id);
      const position = view?.position || { x: 0, y: 0 };

      const controls: Record<string, any> = {};
      Object.entries(node.controls || {}).forEach(([key, control]: [string, any]) => {
        controls[key] = control.value;
      });

      return {
        id: node.id,
        type: node.label.toLowerCase().replace(' ', ''),
        label: node.label,
        position,
        controls
      };
    });

    // Serialize connections
    const connections = Array.from(editor.getConnections()).map((conn: any) => ({
      id: conn.id,
      source: conn.source,
      sourceOutput: conn.sourceOutput,
      target: conn.target,
      targetInput: conn.targetInput
    }));

    // Update graph
    const updated: SerializedGraph = {
      ...state.current,
      nodes,
      connections,
      meta: {
        ...state.current.meta,
        nodesCount: nodes.length,
        connectionsCount: connections.length,
        updatedAt: new Date().toISOString()
      }
    };

    graphStore.update(s => ({
      ...s,
      current: updated,
      isDirty: true
    }));
  },

  undo() {
    graphStore.update(state => {
      if (state.historyIndex > 0) {
        return {
          ...state,
          historyIndex: state.historyIndex - 1,
          current: state.history[state.historyIndex - 1],
          isDirty: true
        };
      }
      return state;
    });
  },

  redo() {
    graphStore.update(state => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state,
          historyIndex: state.historyIndex + 1,
          current: state.history[state.historyIndex + 1],
          isDirty: true
        };
      }
      return state;
    });
  },

  addToHistory(graph: SerializedGraph) {
    graphStore.update(state => {
      const newHistory = state.history.slice(0, state.historyIndex + 1);
      newHistory.push(graph);

      // Limit history size
      if (newHistory.length > 50) {
        newHistory.shift();
      }

      return {
        ...state,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        current: graph
      };
    });
  }
};
