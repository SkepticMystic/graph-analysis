# Graph Analysis

Graph analysis is an Obsidian plugin which adds a new view type - the analysis
view.

The view shows a table of note names and numbers, each representing the value of
some graph analysis algorithm on that note in relation to the current ntoe.

e.g.

- `[[A]] is 0.9 Similar to [[B]]`
- `[[A]] has a 0.6 chance of being connected to [[B]]`
- `[[A]] is co-cited with [[B]] 6 times`

In the analysis view, you have the option to choose between different
`Analysis Types`, and different `Algorithms` within those types.

There is also the option to hide `Infinity` and `Zero` values.

![](https://i.imgur.com/rYxYPCS.png)

## Analysis Types

Graph Analysis currently has 3 different analysis types:

1. Similarity
2. Link Prediction
3. Co-Citations

Each of which implement different algorithms with different purposes.

### Similarity

Similarity is a measure of how similar two notes are based on their
connectedness in the graph (ie. note content is not considered).

Currently, only the Jaccard Similarity measure is implemented.

### Link Prediction

Link Prediction is a measure of the probability that two notes should be
connected based on their other connections in the graph.

Link prediction algorithms include:

1. Adamic Adar
2. Common Neighbours

### Co-Citations

Co-Citations counts the number of time two notes are cited together in the same
note.

For example, if `[[C]]` has `[[A]] and [[B]]` in its content, then `[[A]]` and
`[[B]]` will each have a co-citation of one (in relation to one another).

Think of co-citations as 2nd-order backlinks.

Each note with co-citations > 0 is given a drop down menu. Inside each drop
down, you can see which note co-cites those two notes, and the sentence in which
they are co-cited (if in the same sentence), otherwise just the sentence with
the other link.

![](https://i.imgur.com/9yspOkN.png)
