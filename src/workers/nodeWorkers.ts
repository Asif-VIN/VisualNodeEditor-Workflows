import type { LogEntry } from '../types/graph';

// Worker cache for memoization
const workerCache = new Map<string, any>();

// Helper to generate cache key
function getCacheKey(nodeId: string, inputs: any): string {
  return `${nodeId}-${JSON.stringify(inputs)}`;
}

// Helper to simulate async delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Base worker interface
export interface WorkerContext {
  nodeId: string;
  nodeType: string;
  inputs: Record<string, any>;
  controls: Record<string, any>;
  log: (message: string, data?: any) => void;
}

export interface WorkerResult {
  outputs: Record<string, any>;
  log: LogEntry;
}

// Input worker
export async function inputWorker(ctx: WorkerContext): Promise<WorkerResult> {
  const start = Date.now();
  await delay(100); // Simulate processing
  
  const value = ctx.controls.value || '';
  const end = Date.now();
  
  return {
    outputs: { value },
    log: {
      nodeId: ctx.nodeId,
      nodeType: ctx.nodeType,
      timestamp: start,
      start,
      end,
      duration: end - start,
      status: 'success',
      message: `Output value: "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`
    }
  };
}

// Retriever worker (mock)
export async function retrieverWorker(ctx: WorkerContext): Promise<WorkerResult> {
  const start = Date.now();
  const cacheKey = getCacheKey(ctx.nodeId, ctx.inputs);
  
  if (workerCache.has(cacheKey)) {
    const cached = workerCache.get(cacheKey);
    return {
      outputs: cached.outputs,
      log: {
        ...cached.log,
        message: cached.log.message + ' (cached)'
      }
    };
  }
  
  await delay(300); // Simulate retrieval
  
  const query = (ctx.inputs.query && ctx.inputs.query[0]) || '';
  const topK = ctx.controls.topK || 5;
  
  // Mock chunks
  const chunks = Array.from({ length: topK }, (_, i) => ({
    id: `chunk-${i}`,
    text: `Retrieved document chunk ${i + 1} for query: "${query}". This is mock content that would normally come from a vector database like ChromaDB or Pinecone.`,
    score: 0.9 - (i * 0.1),
    metadata: { source: `doc-${i}`, page: i + 1 }
  }));
  
  const end = Date.now();
  const result = {
    outputs: { chunks },
    log: {
      nodeId: ctx.nodeId,
      nodeType: ctx.nodeType,
      timestamp: start,
      start,
      end,
      duration: end - start,
      status: 'success' as const,
      message: `Retrieved ${chunks.length} chunks for query: "${query.substring(0, 30)}..."`
    }
  };
  
  workerCache.set(cacheKey, result);
  return result;
}

// Ranker worker (mock)
export async function rankerWorker(ctx: WorkerContext): Promise<WorkerResult> {
  const start = Date.now();
  await delay(250); // Simulate reranking
  
  const chunks = (ctx.inputs.chunks && ctx.inputs.chunks[0]) || [];
  const threshold = ctx.controls.scoreThreshold || 0.5;
  
  // Mock reranking
  const ranked = chunks
    .map((chunk: any, idx: number) => ({
      ...chunk,
      rerankScore: 0.95 - (idx * 0.08),
      originalRank: idx
    }))
    .filter((chunk: any) => chunk.rerankScore >= threshold)
    .sort((a: any, b: any) => b.rerankScore - a.rerankScore);
  
  const end = Date.now();
  
  return {
    outputs: { ranked },
    log: {
      nodeId: ctx.nodeId,
      nodeType: ctx.nodeType,
      timestamp: start,
      start,
      end,
      duration: end - start,
      status: 'success',
      message: `Reranked ${chunks.length} chunks, kept ${ranked.length} above threshold ${threshold}`
    }
  };
}

// Router worker (mock)
export async function routerWorker(ctx: WorkerContext): Promise<WorkerResult> {
  const start = Date.now();
  await delay(150); // Simulate routing logic
  
  const query = (ctx.inputs.query && ctx.inputs.query[0]) || '';
  const context = (ctx.inputs.context && ctx.inputs.context[0]) || {};
  
  let rules: any = {};
  try {
    rules = JSON.parse(ctx.controls.routingRules || '{}');
  } catch (e) {
    rules = { default: 'summarizer' };
  }
  
  // Simple routing logic
  let route = rules.default || 'summarizer';
  if (query.toLowerCase().includes('tool') || query.toLowerCase().includes('action')) {
    route = 'toolCall';
  } else if (query.toLowerCase().includes('evaluate') || query.toLowerCase().includes('score')) {
    route = 'evaluator';
  }
  
  const end = Date.now();
  
  return {
    outputs: { route, data: { query, context, selectedRoute: route } },
    log: {
      nodeId: ctx.nodeId,
      nodeType: ctx.nodeType,
      timestamp: start,
      start,
      end,
      duration: end - start,
      status: 'success',
      message: `Routed to: ${route}`
    }
  };
}

// Tool Call worker (mock)
export async function toolCallWorker(ctx: WorkerContext): Promise<WorkerResult> {
  const start = Date.now();
  await delay(400); // Simulate tool execution
  
  const toolName = ctx.controls.toolName || 'search';
  let params: any = {};
  try {
    params = JSON.parse(ctx.controls.parameters || '{}');
  } catch (e) {
    params = {};
  }
  
  // Mock tool response
  const response = {
    tool: toolName,
    status: 'success',
    result: `Mock result from ${toolName} tool with parameters: ${JSON.stringify(params)}`,
    executionTime: 200
  };
  
  const end = Date.now();
  
  return {
    outputs: { response },
    log: {
      nodeId: ctx.nodeId,
      nodeType: ctx.nodeType,
      timestamp: start,
      start,
      end,
      duration: end - start,
      status: 'success',
      message: `Executed tool: ${toolName}`
    }
  };
}

// Summarizer worker (mock)
export async function summarizerWorker(ctx: WorkerContext): Promise<WorkerResult> {
  const start = Date.now();
  await delay(500); // Simulate LLM call
  
  const text = (ctx.inputs.text && ctx.inputs.text[0]) || '';
  const chunks = (ctx.inputs.chunks && ctx.inputs.chunks[0]) || [];
  const maxLength = ctx.controls.maxLength || 200;
  
  let contentToSummarize = text;
  if (chunks.length > 0) {
    contentToSummarize = chunks.map((c: any) => c.text || c).join('\n\n');
  }
  
  // Mock summary
  const summary = `[MOCK SUMMARY] This is a generated summary of the provided content. ` +
    `Original length: ${contentToSummarize.length} chars. ` +
    `Summary length: ~${maxLength} chars. ` +
    `Key points extracted using ${ctx.controls.model || 'gpt-4-turbo'} model.`;
  
  const end = Date.now();
  
  return {
    outputs: { summary },
    log: {
      nodeId: ctx.nodeId,
      nodeType: ctx.nodeType,
      timestamp: start,
      start,
      end,
      duration: end - start,
      status: 'success',
      message: `Generated summary (${summary.length} chars) from ${contentToSummarize.length} chars`
    }
  };
}

// Evaluator worker (mock)
export async function evaluatorWorker(ctx: WorkerContext): Promise<WorkerResult> {
  const start = Date.now();
  await delay(300); // Simulate evaluation
  
  const query = (ctx.inputs.query && ctx.inputs.query[0]) || '';
  const answer = (ctx.inputs.answer && ctx.inputs.answer[0]) || '';
  const rubric = ctx.controls.rubricName || 'accuracy';
  
  // Mock evaluation
  const score = (Math.random() * 0.3 + 0.7).toFixed(2); // 0.7 - 1.0
  const feedback = {
    rubric,
    score: parseFloat(score),
    metrics: {
      relevance: 0.85,
      accuracy: 0.92,
      completeness: 0.78
    },
    comments: `Answer evaluated against ${rubric} rubric. Overall quality is good.`
  };
  
  const end = Date.now();
  
  return {
    outputs: { score, feedback },
    log: {
      nodeId: ctx.nodeId,
      nodeType: ctx.nodeType,
      timestamp: start,
      start,
      end,
      duration: end - start,
      status: 'success',
      message: `Evaluation score: ${score} (rubric: ${rubric})`
    }
  };
}

// Guardrail worker (mock)
export async function guardrailWorker(ctx: WorkerContext): Promise<WorkerResult> {
  const start = Date.now();
  await delay(200); // Simulate policy check
  
  const answer = ctx.inputs.answer || '';
  let policies: any = {};
  try {
    policies = JSON.parse(ctx.controls.policies || '{}');
  } catch (e) {
    policies = {};
  }
  
  // Mock policy check - randomly block 10% of the time
  const blocked = Math.random() < 0.1;
  const result = blocked ? '[BLOCKED BY GUARDRAIL]' : answer;
  const status = {
    passed: !blocked,
    blocked,
    reason: blocked ? 'Content violates policy: detected potential PII' : 'All policies passed',
    policies: Object.keys(policies)
  };
  
  const end = Date.now();
  
  return {
    outputs: { result, status },
    log: {
      nodeId: ctx.nodeId,
      nodeType: ctx.nodeType,
      timestamp: start,
      start,
      end,
      duration: end - start,
      status: blocked ? 'error' : 'success',
      message: blocked ? 'Content blocked by guardrail' : 'Content passed guardrail checks'
    }
  };
}

// Output worker
export async function outputWorker(ctx: WorkerContext): Promise<WorkerResult> {
  const start = Date.now();
  await delay(50);
  
  const value = ctx.inputs.value;
  const end = Date.now();
  
  return {
    outputs: { value },
    log: {
      nodeId: ctx.nodeId,
      nodeType: ctx.nodeType,
      timestamp: start,
      start,
      end,
      duration: end - start,
      status: 'success',
      message: `Output: ${typeof value === 'string' ? value.substring(0, 50) : JSON.stringify(value).substring(0, 50)}...`
    }
  };
}

// Worker registry
export const workerRegistry: Record<string, (ctx: WorkerContext) => Promise<WorkerResult>> = {
  input: inputWorker,
  retriever: retrieverWorker,
  ranker: rankerWorker,
  router: routerWorker,
  toolCall: toolCallWorker,
  summarizer: summarizerWorker,
  evaluator: evaluatorWorker,
  guardrail: guardrailWorker,
  output: outputWorker
};

// Clear cache utility
export function clearWorkerCache(): void {
  workerCache.clear();
}
