import { Graph } from "graphlib";
import { centralityForAll, closenessCentrality } from "src/Algorithms/Centrality";
import { adamicAdarLinkPrediction, commonNeighboursLinkPrediction, linkPredictionsForAll } from "src/Algorithms/LinkPrediction";
import { JaccardSimilarity, similarityForAll } from "src/Algorithms/Similarity";

export default class MyGraph extends Graph {

    similarity = {
        "Jaccard": JaccardSimilarity,
        "All": similarityForAll
    }

    linkPrediction = {
        'Adamic Adar': adamicAdarLinkPrediction,
        'Common Neighbours': commonNeighboursLinkPrediction,
        "All": linkPredictionsForAll
    }

    centrality = {
        'Closeness': closenessCentrality,
        'All': centralityForAll
    }
}

const myGraph = new MyGraph();

myGraph.similarity.Jaccard