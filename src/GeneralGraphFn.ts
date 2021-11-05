import type { Edge } from 'graphlib'
import * as graphlib from 'graphlib'
import type MyGraph from 'src/MyGraph'

export function intersection(nodes1: string[], nodes2: string[]) {
  return nodes1.filter((node1) => nodes2.includes(node1)) ?? []
}

export function eccentricity(g: MyGraph, a: string) {
  const paths = graphlib.alg.dijkstra(g, a)
  const pathsArr: [string, graphlib.Path][] = Object.entries(paths)
  const sortedPaths = pathsArr.sort((p, q) =>
    p[1].distance > q[1].distance ? 1 : -1
  )
  return sortedPaths
}

export function triangleCount(g: MyGraph, u: string) {
  const esWithU = g.edges().filter((edge) => edge.v === u || edge.w === u)
  function notU(e: Edge) {
    return e.v === u ? e.w : e.v
  }
  const incidentEdges: Edge[] = []
  esWithU.forEach((eWithUI, i) => {
    esWithU.forEach((eWithUJ, j) => {
      if (
        i !== j &&
        (g.hasEdge(notU(eWithUI), notU(eWithUJ)) ||
          g.hasEdge(notU(eWithUJ), notU(eWithUI)))
      ) {
        incidentEdges.push(eWithUI)
      }
    })
  })

  const noDups: Edge[] = []
  incidentEdges.forEach((e) => {
    if (noDups.find((ee) => ee.v === e.v && ee.w === e.w)) {
      return
    } else {
      noDups.push(e)
    }
  })
  console.log({ incidentEdges, noDups })
  return noDups.length / 2
}

export function clusteringCoefficient(g: MyGraph, u: string) {
  const triangles = triangleCount(g, u)
  const deg = (g.neighbors(u) as string[]).length
  if (deg === 0 || deg === 1) return 0

  return (2 * triangles) / (deg * (deg - 1))
}

// find all triangles in the graph
function findTriangles(g: MyGraph) {
  const triangles = []
  g.nodes().forEach((u) => {
    g.neighbors(u).forEach((v) => {
      g.neighbors(v).forEach((w) => {
        if (g.hasEdge(u, v) && g.hasEdge(u, w) && g.hasEdge(v, w)) {
          triangles.push([u, v, w])
        }
      })
    })
  })
  return triangles
}
