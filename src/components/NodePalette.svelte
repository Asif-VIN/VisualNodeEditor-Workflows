<script lang="ts">
  import { NODE_TYPES } from '../types/nodes';
  import { editorActions } from '../stores/editor';

  let searchQuery = '';
  let selectedCategory = 'All';

  $: categories = ['All', ...new Set(NODE_TYPES.map((n) => n.category))];

  $: filteredNodes = NODE_TYPES.filter((node) => {
    const matchesSearch =
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || node.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  async function handleAddNode(nodeType: string) {
    await editorActions.addNode(nodeType);
  }
</script>

<div class="p-4 h-full flex flex-col" data-testid="node-palette">
  <h2 class="text-lg font-semibold mb-4 text-dark-100">Node Palette</h2>

  <!-- Search -->
  <input
    type="text"
    placeholder="Search nodes..."
    bind:value={searchQuery}
    class="input mb-4 text-sm"
    data-testid="node-search-input"
  />

  <!-- Category Filter -->
  <div class="mb-4">
    <select
      bind:value={selectedCategory}
      class="input text-sm w-full"
      data-testid="category-filter"
    >
      {#each categories as category}
        <option value={category}>{category}</option>
      {/each}
    </select>
  </div>

  <!-- Node List -->
  <div class="flex-1 overflow-y-auto space-y-2">
    {#each filteredNodes as node}
      <button
        class="w-full p-3 bg-dark-700 hover:bg-dark-600 rounded-lg text-left transition-colors duration-150 border border-dark-600 hover:border-primary-500"
        on:click={() => handleAddNode(node.type)}
        data-testid="node-item-{node.type}"
      >
        <div class="flex items-center space-x-2">
          <span class="text-xl">{node.icon}</span>
          <div class="flex-1">
            <div class="font-medium text-dark-100 text-sm">{node.label}</div>
            <div class="text-xs text-dark-400">{node.category}</div>
          </div>
        </div>
      </button>
    {/each}

    {#if filteredNodes.length === 0}
      <div class="text-center text-dark-400 py-8 text-sm">
        No nodes found matching "{searchQuery}"
      </div>
    {/if}
  </div>

  <!-- Quick Actions -->
  <div class="mt-4 pt-4 border-t border-dark-700 space-y-2">
    <button
      class="btn btn-primary w-full text-sm"
      on:click={() => handleAddNode('input')}
      data-testid="quick-add-input"
    >
      + Add Input Node
    </button>
    <button
      class="btn btn-secondary w-full text-sm"
      on:click={() => handleAddNode('output')}
      data-testid="quick-add-output"
    >
      + Add Output Node
    </button>
  </div>
</div>
