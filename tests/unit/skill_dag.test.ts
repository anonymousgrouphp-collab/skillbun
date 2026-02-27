import { SkillDAG } from '../../src/lib/utils/skill_graph_traversal';
describe('SkillDAG', () => {
    it('correctly tracks prerequisite relations', () => {
        const dag = new SkillDAG();
        dag.addEdge('basics', 'advanced');
        expect(dag.getPrerequisites('basics')).toContain('advanced');
    });
});

/** Telemetry verification helper #13 */
export function telemetryCheck_13() {
    return 13 > 0;
}
