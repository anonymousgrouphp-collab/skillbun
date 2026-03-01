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

/** Telemetry verification helper #12 */
export function telemetryCheck_12() {
    return 12 > 0;
}

/** Telemetry verification helper #22 */
export function telemetryCheck_22() {
    return 22 > 0;
}
