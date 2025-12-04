# Getting Started with Visual Workflow Editor

## 🎉 Your Editor is Ready!

The Visual Workflow Editor for AI Pipelines is now running and ready to use!

## 🌐 Access the Editor

Your development server is running on: **http://localhost:5176**

If you're accessing remotely, use the network address shown in the logs.

## 🚀 Quick Tour

### 1. **Node Palette** (Left Sidebar)
- Browse 9 different node types organized by category
- Search for specific nodes
- Click to add nodes to the canvas
- Categories: Input/Output, RAG, Control Flow, Processing, Actions, Security, Organization

### 2. **Editor Canvas** (Center)
- Pan and zoom with mouse/trackpad
- Connect nodes by dragging from output sockets to input sockets
- Select nodes to inspect them
- Right-click for context menu to add nodes
- Zoom controls in top-right corner

### 3. **Inspector Panel** (Right Top)
- View selected node properties
- Edit node controls (text, numbers, JSON configs)
- See connection counts
- Export/Import graphs (💾 and 📂 buttons)
- View graph statistics

### 4. **Run Panel** (Right Bottom)
- **Run Graph**: Execute the entire workflow
- **Validate Graph**: Check for errors (cycles, incompatible connections)
- View execution logs with timing and status
- Inspect node outputs
- Expand logs to see detailed data

## 🎨 Try the Example Workflow

An example RAG + Agent workflow is pre-loaded:

```
Input → Retriever → Ranker → Summarizer → Output
```

1. Click "▶️ Run Graph" in the Run Panel
2. Watch the execution logs appear with timings
3. Expand logs to see mock data and outputs
4. Check the Results section for final outputs

## 🔧 Creating Your First Workflow

### Step 1: Add Nodes
```
1. Click "Input" in the Node Palette (or Quick Actions at bottom)
2. Click "Retriever" to add it to canvas
3. Continue adding: Ranker, Summarizer, Output
```

### Step 2: Connect Nodes
```
1. Drag from Input's "value" output to Retriever's "query" input
2. Connect Retriever's "chunks" to Ranker's "chunks"
3. Connect Ranker's "ranked" to Summarizer's "chunks"
4. Connect Summarizer's "summary" to Output's "value"
```

### Step 3: Configure Nodes
```
1. Click the Input node
2. In Inspector, change the value to your query
3. Click Retriever, adjust topK if needed
4. Configure other nodes as desired
```

### Step 4: Run & Validate
```
1. Click "✅ Validate Graph" to check for issues
2. Click "▶️ Run Graph" to execute
3. View logs and outputs in Run Panel
```

## 🎯 Available Node Types

### 📥 Input
- Provides static text or data
- Use as the starting point for queries

### 🔍 Retriever
- Simulates vector search
- Returns document chunks based on query
- Controls: topK, filters, embedding model

### 📊 Ranker
- Reranks retrieved documents
- Filters by score threshold
- Controls: rerank model, score threshold

### 🔀 Router
- Conditional flow control
- Routes to different paths based on query
- Controls: routing rules (JSON)

### 🔧 Tool Call
- Executes external tools
- Mock implementation with configurable parameters
- Controls: tool name, parameters (JSON)

### 📝 Summarizer
- Text summarization
- Configurable length and model
- Controls: model, max length

### ✅ Evaluator
- Quality assessment
- Scores answers against rubrics
- Controls: rubric name

### 🛡️ Guardrail
- Content safety checks
- Policy-based filtering
- Controls: policies (JSON)

### 📤 Output
- Displays final results
- Terminal node for workflows

## ⌨️ Keyboard Shortcuts

- **Delete / Backspace**: Remove selected nodes
- **Ctrl/Cmd + A**: Select all nodes
- **Ctrl/Cmd + =**: Zoom in
- **Ctrl/Cmd + -**: Zoom out
- **Ctrl/Cmd + 0**: Zoom to fit all nodes
- **Right Click**: Open context menu to add nodes

## 💾 Saving Your Work

### Export Graph
1. Click the 💾 icon in Inspector Panel
2. Graph downloads as JSON file
3. Save it to your preferred location

### Import Graph
1. Click the 📂 icon in Inspector Panel
2. Select a previously saved JSON file
3. Graph loads with all nodes and connections

### Example Workflow
An example is available at: `/app/examples/rag-workflow.json`

## 🎨 Socket Types & Colors

| Socket | Type | Compatible With |
|--------|------|-----------------|
| 🔵 Blue | Number | Number, Any |
| 🟢 Green | String | String, JSON, Any |
| 🟣 Purple | JSON | JSON, String, Any |
| 🟠 Orange | Embedding | Embedding, Any |
| 🟡 Yellow | DocumentChunk | DocumentChunk, Any |
| 🔴 Red | ToolCall | ToolCall, Any |
| ⚫ Gray | Any | All Types |

## 🔍 Understanding Execution

When you run a graph:

1. **Validation**: Checks for cycles and incompatible connections
2. **Sorting**: Orders nodes topologically for correct execution
3. **Execution**: Runs each node's worker sequentially
4. **Logging**: Records timing, status, and data for each node
5. **Results**: Collects outputs from Output nodes

### Mock Execution
All nodes use **mock data** with simulated delays:
- Input: 100ms
- Retriever: 300ms (returns 5 mock document chunks)
- Ranker: 250ms (reranks and filters)
- Router: 150ms (analyzes query for routing)
- Tool Call: 400ms (simulates external API)
- Summarizer: 500ms (generates mock summary)
- Evaluator: 300ms (scores 0.7-1.0)
- Guardrail: 200ms (10% chance of blocking)
- Output: 50ms

This allows you to test workflows without real API integrations!

## 🛠️ Development Commands

```bash
# Start development server (already running)
yarn dev

# Build for production
yarn build

# Preview production build
yarn preview

# Check for issues
yarn build  # Will show any TypeScript errors
```

## 📚 Documentation

- **README.md**: Full feature list and usage guide
- **Architecture.md**: Technical architecture and design decisions
- **This file**: Getting started guide

## 🐛 Troubleshooting

### Server not accessible?
Check logs: `tail -f /var/log/supervisor/vite.out.log`

### Nodes not connecting?
- Check socket compatibility (colors should match or connect to "Any")
- Hover over sockets to see their types
- Use Validate Graph to check issues

### Graph not saving?
- Use Export (💾) to download JSON
- Changes to node controls save automatically to graph store

### Execution fails?
- Run Validate Graph first
- Check for cycles (circular connections)
- Review error messages in Results panel

## 🎯 Next Steps

1. **Explore Example**: Load `/app/examples/rag-workflow.json`
2. **Build Custom Workflow**: Create your own RAG or agent pipeline
3. **Experiment**: Try different node combinations and routing logic
4. **Read Architecture**: Understand the system design in `/app/docs/Architecture.md`
5. **Extend**: Add custom node types (see Architecture.md for guide)

## 🌟 Features to Explore

- ✅ **Validation**: Real-time error checking
- ✅ **Memoization**: Cached results for identical inputs
- ✅ **Structured Logs**: Detailed execution traces
- ✅ **Socket Types**: Type-safe connections
- ✅ **Cycle Detection**: Prevents infinite loops
- ✅ **JSON Schema**: Validates graph structure
- ✅ **Example Workflows**: Pre-built templates

## 💡 Tips

1. **Start Simple**: Begin with Input → Output, then add complexity
2. **Use Validation**: Always validate before running
3. **Check Logs**: Expand log entries to see detailed data
4. **Save Often**: Export your graphs regularly
5. **Experiment**: Mock data means you can't break anything!

---

## 🚀 Happy Workflow Building!

You now have a fully functional visual editor for AI pipelines. Create, connect, execute, and iterate on your workflows with ease!

**Server running on**: http://localhost:5176
**Documentation**: `/app/docs/Architecture.md`
**Examples**: `/app/examples/rag-workflow.json`
