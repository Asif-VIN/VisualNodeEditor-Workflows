export { InputNode } from './InputNode';
export { RetrieverNode } from './RetrieverNode';
export { RankerNode } from './RankerNode';
export { RouterNode } from './RouterNode';
export { ToolCallNode } from './ToolCallNode';
export { SummarizerNode } from './SummarizerNode';
export { EvaluatorNode } from './EvaluatorNode';
export { GuardrailNode } from './GuardrailNode';
export { OutputNode } from './OutputNode';

// Node factory
import { InputNode } from './InputNode';
import { RetrieverNode } from './RetrieverNode';
import { RankerNode } from './RankerNode';
import { RouterNode } from './RouterNode';
import { ToolCallNode } from './ToolCallNode';
import { SummarizerNode } from './SummarizerNode';
import { EvaluatorNode } from './EvaluatorNode';
import { GuardrailNode } from './GuardrailNode';
import { OutputNode } from './OutputNode';

export type NodeType = 'input' | 'retriever' | 'ranker' | 'router' | 'toolCall' | 'summarizer' | 'evaluator' | 'guardrail' | 'output';

export function createNode(type: NodeType): any {
  switch (type) {
    case 'input':
      return new InputNode();
    case 'retriever':
      return new RetrieverNode();
    case 'ranker':
      return new RankerNode();
    case 'router':
      return new RouterNode();
    case 'toolCall':
      return new ToolCallNode();
    case 'summarizer':
      return new SummarizerNode();
    case 'evaluator':
      return new EvaluatorNode();
    case 'guardrail':
      return new GuardrailNode();
    case 'output':
      return new OutputNode();
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}
