import * as _ from "lodash"
import "lodash.isequal"
import { Graph } from "graphlib"

export function nodeIntersection(nodes1: string[], nodes2: string[]) {
    return nodes1.filter(node1 => nodes2.includes(node1));
}

export const sum = (arr: number[]) => arr.reduce((a, b) => a + b);