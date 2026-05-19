export function topologicalSort(graph: Map<string, string[]>): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    function dfs(node: string) {
        visited.add(node);
        for (const neighbor of graph.get(node) || []) {
            if (!visited.has(neighbor)) dfs(neighbor);
        }
        order.push(node);
    }
    for (const key of graph.keys()) {
        if (!visited.has(key)) dfs(key);
    }
    return order;
}
