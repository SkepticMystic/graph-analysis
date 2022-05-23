# Graph Analysis

Graph analysis adds the **analysis view** to Obsidian which implements a set of
algorithms that computes useful relations between the notes in your vault! Our
flagship algorithm is the **Co-citations** panel, that we describe as a _2nd
order backlinks panel_.

The Graph Analysis view shows a table of note names and numbers, each
representing the value of some graph analysis algorithm on that note in relation
to the current note.

e.g.

- `[[A]] is 0.9 Similar to [[B]]`
- `[[A]] has a 0.6 chance of being connected to [[B]]`
- `[[A]] is co-cited with [[B]] 6 times`

## Analysis Types

Graph Analysis currently has 4 different analysis types:

1. Similarity
2. Link Prediction
3. Co-Citations
4. Community Detection

Each implement different algorithms with different purposes.

### Co-Citations

Co-Citations counts the number of time two notes are cited together in the same
note and gives extra weight when the two notes are cited close together.

Think of co-citations as a **2nd-order backlinks** panel: Instead of showing
_where_ something is cited, it shows _why_, or with _whom_ or _what_ it is
cited!

For example, if `[[C]]` has `[[A]] and [[B]]` in its content, then `[[A]]` and
`[[B]]` will each have a co-citation of one.

Each note with co-citations > 0 is given a drop down menu. Inside each drop
down, you can see which note co-cites those two notes, and the sentence in which
they are co-cited (if in the same sentence), otherwise just the sentence with
the other link.

![](https://i.imgur.com/9yspOkN.png)

#### Example use case with daily notes

An example why this is useful is given by @HEmile:

> I use a lot of daily notes, in which I journal and write about the news of the
> day. This makes the backlinks panel a bit boring: It only shows on what dates
> I wrote about some note. The Co-Citations algorithm shows me much more! For
> example, the `Joe Biden` note shows me I usually write about Biden together
> with `Donald Trump`. But if I want to know what I wrote about the relations
> between Joe Biden and `China`, I can just look in the co-citations panel and
> expand the relation to see the story!

![](https://i.imgur.com/udPkuV3.png)

#### Video Tutorial
This video gives a longer and in depth overview for why Co-Citations is so useful!
[![Watch the video](https://yt-embed.herokuapp.com/embed?v=rK6JVDrGERA)](https://youtu.be/rK6JVDrGERA)

### Similarity

Similarity is a measure of how similar two notes are based on their
connectedness in the graph (ie. note content is not considered). Currently, only
the Jaccard Similarity measure is implemented.

#### Jaccard Similarity

**Formula**:

![image](https://user-images.githubusercontent.com/70717676/139872572-93504295-6d29-4722-bdb1-3fbeb7bc22ec.png)

[Source](https://neo4j.com/docs/graph-data-science/current/alpha-algorithms/jaccard/#alpha-algorithms-similarity-jaccard-context)

Where

- `|x|` is the number of neighbours the node `x` has (links going in or out).
- `|x & y|` is the number of neighbours that both `x` and `y` have in common

### Link Prediction

Link Prediction is a measure of the probability that two notes should be
connected based on their other connections in the graph. The implemented Link
Prediction algorithms are Adamic Adar and Common Neighbours.

#### Adamic Adar

**Formula**:

![image](https://user-images.githubusercontent.com/70717676/139873180-c870e072-843c-42a9-83fc-87205b408754.png)

[Source](https://neo4j.com/docs/graph-data-science/current/alpha-algorithms/adamic-adar/)

Where:

- `N(x)` is the number of neighbours of `x`

#### Common Neighbours

**Formula**:

![image](https://user-images.githubusercontent.com/70717676/139873406-d0542335-3b8c-4d08-8a5b-4510408ebd4e.png)

[Source](https://neo4j.com/docs/graph-data-science/current/alpha-algorithms/common-neighbors/)

Where:

- `N(x)` is the numbers of neighbours of `x`

### Community Detection

These algorithms try to find groups of similar notes.

#### Label Propagation

Start by giving each node a unique label (its own name). Then, look at each node's neighbours, and change it's label to the most common among it's neighbours. 
Repeat this process `iterations` number of times. 

At the end, show the nodes grouped by the last label they had.

#### Clustering Coefficient

Gives the ratio of the number of _triangles_ the `u` is a part of, to the number of triangles it possibly _could have_ been a part of:

![image](https://user-images.githubusercontent.com/70717676/140610147-0a05201f-d9c7-4c0c-b423-6bbeeb81253b.png)

## Utility Classes

Each row in the graph analysis tables (or co-citations dropdowns) has a class:
`analysis-linked` or `analysis-not-linked`, indicating if the current note is
linked to the note in that row. This gives you the ability to style a table row
based on whether it's connectedness.

For example, you can make linked notes have a lower opacity:

```css
tr.analysis-linked {
  opacity: 0.3;
}
```

![image](https://user-images.githubusercontent.com/70717676/139862955-75284ff5-0ced-4548-bf6e-caa353a16fe0.png)

You could even go so far as to hide linked rows completely:

```css
tr.analysis-linked {
  display: none;
}
```

## Settings

In the analysis view, you have the option to choose between different
`Analysis Types`, and different `Algorithms` within those types. You can set the
default analysis type in the plugin settings.

There is also the option to hide `Infinity` and `Zero` values.

![image](https://user-images.githubusercontent.com/70717676/138652879-d8b0e4a7-d70a-44e8-ba3c-67e04f6a8edd.png)

## Documentation on Algorithms

You can read more about the implemented algorithms, or let us know which you
want us to add, over
[here](https://neo4j.com/docs/graph-data-science/current/algorithms/) 👀.
Information on co-citations can mostly be found on
[Wikipedia](https://en.wikipedia.org/wiki/Co-citation). In particular, we
implement a variation of
[Co-citatition Proximity Analysis](https://en.wikipedia.org/wiki/Co-citation_Proximity_Analysis).


## Buy Us a Coffee

SkepticMystic: [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/G2G454TZF)

Emile: [![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Emile)
