import type { Communities } from 'src/Interfaces'
import type MyGraph from 'src/MyGraph'

export function intersection(nodes1: string[], nodes2: string[]) {
  return nodes1?.filter((node1) => nodes2.includes(node1)) ?? []
}

// export function eccentricity(g: MyGraph, a: string) {
//   const paths = graphlib.alg.dijkstra(g, a)
//   const pathsArr: [string, graphlib.Path][] = Object.entries(paths)
//   const sortedPaths = pathsArr.sort((p, q) =>
//     p[1].distance > q[1].distance ? 1 : -1
//   )
//   return sortedPaths
// }

export function clusteringCoefficient(g: MyGraph, u: string) {
  const triangles = findTrianglesForNode(g, u)
  const deg = (g.neighbors(u) as string[]).length
  if (deg === 0 || deg === 1) return { coeff: 0, triangles }

  const coeff = (2 * triangles.length) / (deg * (deg - 1))
  return { coeff, triangles }
}

/**
 * Find all triangles that node u is part of
 * @param  {MyGraph} g
 * @param  {string} u
 * @returns {[string, string][]}
 */
export function findTrianglesForNode(
  g: MyGraph,
  u: string
): [string, string][] {
  const triangles: [string, string][] = []
  ;(g.neighbors(u) as string[]).forEach((v) => {
    ;(g.neighbors(v) as string[]).forEach((w) => {
      if (g.hasEdge(u, v) && g.hasEdge(u, w) && g.hasEdge(v, w)) {
        triangles.push([v, w])
      }
    })
  })
  return triangles
}

export function gatherCommunities(labeledNodes: {
  [node: string]: string | number
}) {
  const communities: Communities = {}
  Object.entries(labeledNodes).forEach(
    (labeledNode: [string, string | number]) => {
      const [node, label] = labeledNode
      if (communities[label] === undefined) {
        communities[label] = [node]
      } else {
        communities[label].push(node)
      }
    }
  )
  return communities
}
