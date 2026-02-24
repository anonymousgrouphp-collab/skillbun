export class SkillDAG {
    private edges = new Map<string, string[]>();
    addEdge(from: string, to: string) {
        if (!this.edges.has(from)) this.edges.set(from, []);
        this.edges.get(from)!.push(to);
    }
    getPrerequisites(id: string): string[] {
        return this.edges.get(id) || [];
    }
}
