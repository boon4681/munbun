import type { Grammar } from "ohm-js";

export class IncrementalSemanticAttribute {
    constructor(grammar: Grammar, dict: Record<any, any>, semantics: any, attributeName: string) {
        // Take an Array of nodes, and whenever an _iter node is encountered, splice in its
        // recursively-flattened children instead.
        function* iterNodes(nodes: any): any {
            for (var i = 0; i < nodes.length; ++i) {
                if (nodes[i]._node.ctorName === '_iter') {
                    yield* iterNodes(nodes[i].children);
                } else {
                    yield nodes[i];
                }
            }
        }

        let latest: any[] = []
        const declare = (a: any) => (latest.push(a), a)

        semantics.addAttribute(attributeName, {
            _terminal: function () {
                const value = dict._terminal && dict._terminal[this.sourceString]
                if (value !== undefined) {
                    return declare({ node: this, value })
                }
            },
            _nonterminal: function (children: any) {
                const value = dict && dict[this._node.ctorName]
                if (value !== undefined) {
                    return declare({ node: this, value })
                }
                // Recurse
                for (const child of iterNodes(children)) {
                    child[attributeName]
                }
            },
        })

        return (parseNode: any) => (latest = [], parseNode[attributeName], latest)
    }
}