# Connection Testing Guide

## How to Test Node Connections

### Method 1: Using the Pre-loaded Workflow

The app loads with an example workflow that should have these connections:
- Input → Retriever (Query)
- Retriever → Ranker (Chunks)
- Ranker → Summarizer (Chunks) 
- Summarizer → Output (Value)

**If you don't see the connection lines:**
1. The connections exist in the data (Graph Stats shows 4 connections)
2. But they may not be rendering visually

### Method 2: Manual Connection Test

**To create a new connection:**

1. **Hover over a socket** (the colored circles on nodes)
   - Output sockets are on the right side of nodes
   - Input sockets are on the left side of nodes
   - Sockets should be 16px circles that grow to 1.3x on hover

2. **Click and drag from an output socket** (right side)
   - Press and hold left mouse button on the output socket
   - Drag toward an input socket on another node
   - You should see a line following your cursor

3. **Release on a compatible input socket** (left side)
   - The connection should snap into place
   - A curve line should appear between the nodes

4. **Socket Compatibility:**
   - Green (String) → Green (String) ✅
   - Green (String) → Purple (JSON) ✅  
   - Any socket → Gray (Any) ✅
   - Different incompatible types ❌

### Method 3: Add New Nodes

1. Click "+ Add Input Node" or "+ Add Output Node" at bottom of palette
2. Or click any node type in the palette
3. Try connecting the new nodes

### Troubleshooting

**If connections don't work:**

1. **Check Browser Console** (F12 → Console tab)
   - Look for JavaScript errors
   - Look for connection-related errors

2. **Try These Steps:**
   - Refresh the page (Ctrl+R or Cmd+R)
   - Clear browser cache (Ctrl+Shift+Del)
   - Try a different browser (Chrome, Firefox, Edge)

3. **Connection Plugin Issues:**
   - Connections might be blocked by socket incompatibility
   - Self-connections (same node) are blocked
   - Check if cursor changes when hovering sockets

4. **Visual Rendering Issues:**
   - Connections might exist but not be visible
   - Check if Graph Stats shows connection count increasing
   - Try zooming in/out (Ctrl + = / Ctrl + -)

### Expected Behavior

✅ **Working Connections:**
- Hover effect on sockets (grows to 1.3x, glows)
- Cursor changes to pointer over sockets  
- Drag creates a visible line following cursor
- Drop on compatible socket creates curved connection line
- Graph Stats counter increases

❌ **Not Working:**
- No hover effect on sockets
- Can't click/drag from sockets
- No line appears when dragging
- Connections don't persist after drop

### Developer Console Test

Open browser console (F12) and run:

```javascript
// Check if editor exists
console.log('Editor:', window.editor);

// Check nodes
console.log('Nodes:', Array.from(window.editor?.getNodes() || []));

// Check connections  
console.log('Connections:', Array.from(window.editor?.getConnections() || []));
```

### Report to Developer

If connections still don't work, please provide:
1. Browser name and version
2. Any console errors (screenshot)
3. What happens when you try to drag from a socket
4. Does the cursor change when hovering over sockets?
5. Can you see the pre-loaded connections as lines between nodes?

## Current Known Issues

1. ✅ Example workflow loads with 5 nodes
2. ⚠️ Connection lines may not be visually rendered
3. ⚠️ Drag-to-connect interaction needs testing
4. ✅ Socket compatibility validation is implemented
5. ✅ Connection data is stored (Graph Stats shows count)

## Next Steps

The core Rete.js setup is complete. If manual connection creation doesn't work:
- This may be a Rete.js v2 / Svelte plugin configuration issue
- Or a CSS z-index / pointer-events issue
- Or the connection rendering path needs debugging

Try the methods above and report what you observe!
