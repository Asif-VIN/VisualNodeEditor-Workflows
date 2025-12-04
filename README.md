# Visual Workflow Editor for AI Pipelines

<div align="center">
  <h3>🎉 Production-Ready Visual Editor for RAG & Multi-Agent Workflows</h3>
  <p>Built with Svelte + TypeScript + Rete.js v2</p>
</div>

## 🚀 Features

- 🎨 **Intuitive Visual Editor**: Drag-and-drop node-based interface powered by Rete.js v2
- 🔗 **Type-Safe Connections**: 6 socket types with automatic compatibility checking
- ⚡ **9 Built-in Node Types**: Input, Retriever, Ranker, Router, Tool Call, Summarizer, Evaluator, Guardrail, Output
- 📦 **Execution Engine**: Topological sorting, cycle detection, async workers, memoization
- 💾 **Import/Export**: Save and load workflows as JSON
- ⚙️ **Real-time Validation**: Instant feedback on graph structure and socket compatibility
- 📊 **Execution Logs**: Detailed logs with timing, status, and data inspection
- 🎯 **Keyboard Shortcuts**: Delete, zoom, select all, and more
- 💡 **Smart Routing**: Conditional flow control based on query analysis
- 🛡️ **Guardrails**: Policy-based content filtering and safety checks

## 📚 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

The app will be available at `http://localhost:3000`

## 🎨 Usage

### Creating a Workflow

1. **Add Nodes**: 
   - Click nodes in the left palette to add them to the canvas
   - Or right-click on canvas for context menu
   - Use keyboard shortcuts to zoom and navigate

2. **Connect Nodes**:
   - Drag from an output socket to an input socket
   - Connections are validated based on socket types
   - Incompatible sockets will be blocked

3. **Configure Nodes**:
   - Select a node to view its properties in the Inspector panel
   - Edit controls (text inputs, numbers, JSON configs)
   - Changes are saved automatically

4. **Run Workflow**:
   - Click "Run Graph" in the Run Panel
   - View execution logs with timing and status
   - Inspect outputs from Output nodes
   - Validate graph structure before execution

5. **Save/Load**:
   - Export: Click 💾 icon in Inspector to download JSON
   - Import: Click 📂 icon to load a saved workflow

### Example Workflow

A sample RAG workflow is included in `/examples/rag-workflow.json`:

```
Input → Retriever → Ranker → Router → Summarizer → Guardrail → Output
```

This demonstrates:
- Query input
- Vector search retrieval
- Result reranking
- Conditional routing
- Text summarization
- Safety guardrails
- Final output

## 🛠️ Node Types

### Input/Output
- **Input**: Static text or data source
- **Output**: Display final results

### RAG Pipeline
- **Retriever**: Vector search with embedding models (mock ChromaDB)
- **Ranker**: Rerank results with scoring (mock Cohere)

### Control Flow
- **Router**: Conditional branching based on query analysis

### Processing
- **Summarizer**: Text summarization with LLMs (mock GPT-4)
- **Evaluator**: Quality assessment with custom rubrics

### Actions
- **Tool Call**: External tool execution (mock)

### Security
- **Guardrail**: Policy-based content filtering

## 🎯 Keyboard Shortcuts

- `Delete` / `Backspace`: Delete selected nodes
- `Ctrl/Cmd + A`: Select all nodes
- `Ctrl/Cmd + =`: Zoom in
- `Ctrl/Cmd + -`: Zoom out
- `Ctrl/Cmd + 0`: Zoom to fit
- `Right Click`: Context menu (add nodes)

## 📊 Socket Types

| Socket | Description | Color |
|--------|-------------|-------|
| Number | Numeric values | Blue |
| String | Text data | Green |
| JSON | Structured objects | Purple |
| Embedding | Vector embeddings | Orange |
| DocumentChunk | Retrieved documents | Yellow |
| ToolCall | Tool requests | Red |
| Any | Universal (accepts all) | Gray |

## 📦 Project Structure

```
/app/
├── src/
│   ├── components/          # Svelte UI components
│   │   ├── EditorCanvas.svelte
│   │   ├── NodePalette.svelte
│   │   ├── InspectorPanel.svelte
│   │   └── RunPanel.svelte
│   ├── stores/             # Svelte stores
│   │   ├── editor.ts
│   │   ├── graph.ts
│   │   └── execution.ts
│   ├── rete/               # Rete.js setup
│   │   ├── setup.ts
│   │   ├── sockets.ts
│   │   └── nodes/          # Node definitions
│   ├── types/              # TypeScript types
│   │   ├── sockets.ts
│   │   ├── nodes.ts
│   │   └── graph.ts
│   ├── workers/            # Execution workers
│   │   └── nodeWorkers.ts
│   ├── engine/             # Execution engine
│   │   ├── executor.ts
│   │   └── validation.ts
│   ├── schemas/            # JSON schemas
│   │   └── graph.schema.json
│   ├── App.svelte          # Main app
│   ├── main.ts             # Entry point
│   └── app.css             # Global styles
├── examples/               # Example workflows
│   └── rag-workflow.json
├── docs/                   # Documentation
│   └── Architecture.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

## ⚙️ Configuration

### Adding Custom Nodes

1. Create node class in `/src/rete/nodes/YourNode.ts`:

```typescript
import { ClassicPreset } from 'rete';
import { stringSocket } from '../sockets';

export class YourNode extends ClassicPreset.Node {
  constructor() {
    super('Your Node');
    this.addInput('input', new ClassicPreset.Input(stringSocket));
    this.addOutput('output', new ClassicPreset.Output(stringSocket));
    this.addControl('param', new ClassicPreset.InputControl('text', { initial: '' }));
  }
}
```

2. Implement worker in `/src/workers/nodeWorkers.ts`:

```typescript
export async function yourWorker(ctx: WorkerContext): Promise<WorkerResult> {
  // Your logic here
  return { outputs: { output: 'result' }, log: {...} };
}
```

3. Register in `/src/types/nodes.ts` and update factory

### Socket Compatibility

Edit `/src/types/sockets.ts` to customize connection rules:

```typescript
export function isSocketCompatible(from: Socket, to: Socket): boolean {
  // Your compatibility logic
}
```

## 🧪 Testing

### Manual Testing Scenarios

1. **Graph Validation**:
   - Create a cycle and verify error
   - Connect incompatible sockets (should block)
   - Run validation and check warnings

2. **Execution**:
   - Run example RAG workflow
   - Verify all logs show success
   - Check output values

3. **Serialization**:
   - Export graph to JSON
   - Clear graph
   - Import JSON
   - Verify nodes and connections restored

4. **Performance**:
   - Create 50+ nodes
   - Verify smooth panning/zooming
   - Run execution (should complete in <5s)

## 📚 Documentation

- **Architecture**: See `/docs/Architecture.md` for detailed system design
- **API Reference**: TypeScript types are self-documenting
- **Examples**: Check `/examples/` for sample workflows

## 🔧 Tech Stack

- **Svelte 4**: Reactive UI framework
- **TypeScript 5**: Type safety
- **Rete.js v2**: Visual node editor
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Ajv**: JSON Schema validation

## 🚀 Deployment

### Static Hosting

```bash
yarn build
# Upload ./dist to your hosting provider
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "preview"]
```

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📜 License

MIT License - feel free to use in commercial projects

## 👥 Support

For issues or questions:
- Open a GitHub issue
- Check `/docs/Architecture.md` for technical details
- Review example workflows in `/examples/`

---

<div align="center">
  <p>Made with ❤️ using Svelte, TypeScript, and Rete.js v2</p>
  <p>🚀 Build amazing AI workflows visually!</p>
</div>
