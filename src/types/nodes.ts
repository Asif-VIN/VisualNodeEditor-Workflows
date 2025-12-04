import { ClassicPreset } from 'rete';
import type { ClassicPreset as CP } from 'rete';

// Base node data interface
export interface BaseNodeData {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  controls?: Record<string, any>;
}

// Specific node data interfaces
export interface InputNodeData extends BaseNodeData {
  type: 'input';
  controls: {
    value: string;
  };
}

export interface RetrieverNodeData extends BaseNodeData {
  type: 'retriever';
  controls: {
    topK: number;
    filters: string;
    embeddingModel: string;
  };
}

export interface RankerNodeData extends BaseNodeData {
  type: 'ranker';
  controls: {
    rerankModel: string;
    scoreThreshold: number;
  };
}

export interface RouterNodeData extends BaseNodeData {
  type: 'router';
  controls: {
    routingRules: string; // JSON string
  };
}

export interface ToolCallNodeData extends BaseNodeData {
  type: 'toolCall';
  controls: {
    toolName: string;
    parameters: string; // JSON string
  };
}

export interface SummarizerNodeData extends BaseNodeData {
  type: 'summarizer';
  controls: {
    model: string;
    maxLength: number;
  };
}

export interface EvaluatorNodeData extends BaseNodeData {
  type: 'evaluator';
  controls: {
    rubricName: string;
  };
}

export interface GuardrailNodeData extends BaseNodeData {
  type: 'guardrail';
  controls: {
    policies: string; // JSON string
  };
}

export interface OutputNodeData extends BaseNodeData {
  type: 'output';
}

export interface GroupNodeData extends BaseNodeData {
  type: 'group';
  controls: {
    title: string;
    color: string;
  };
}

export interface SubgraphNodeData extends BaseNodeData {
  type: 'subgraph';
  controls: {
    graphId: string;
    graphName: string;
  };
}

// Union type of all node data
export type NodeData =
  | InputNodeData
  | RetrieverNodeData
  | RankerNodeData
  | RouterNodeData
  | ToolCallNodeData
  | SummarizerNodeData
  | EvaluatorNodeData
  | GuardrailNodeData
  | OutputNodeData
  | GroupNodeData
  | SubgraphNodeData;

// Node type registry
export const NODE_TYPES = [
  { type: 'input', label: 'Input', category: 'Input/Output', icon: '📥' },
  { type: 'output', label: 'Output', category: 'Input/Output', icon: '📤' },
  { type: 'retriever', label: 'Retriever', category: 'RAG', icon: '🔍' },
  { type: 'ranker', label: 'Ranker', category: 'RAG', icon: '📊' },
  { type: 'router', label: 'Router', category: 'Control Flow', icon: '🔀' },
  { type: 'toolCall', label: 'Tool Call', category: 'Actions', icon: '🔧' },
  { type: 'summarizer', label: 'Summarizer', category: 'Processing', icon: '📝' },
  { type: 'evaluator', label: 'Evaluator', category: 'Processing', icon: '✅' },
  { type: 'guardrail', label: 'Guardrail', category: 'Security', icon: '🛡️' },
  { type: 'group', label: 'Group', category: 'Organization', icon: '📦' },
  { type: 'subgraph', label: 'Subgraph', category: 'Organization', icon: '🔗' },
] as const;
