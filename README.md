Geo-Draw
========
This is a simple web application that allows the generation of map visualizations.
All the processing happens on the client and the server can simply be a static web
server.

This is only a small project I started to learn the LitElement library and try out
the Rust programming language a bit.

The website is not yet finished, but a example of what is possible can be found here:
* https://rolandbernard.github.io/geo-draw/#/demo/covid-south-tyrol-newest
* https://rolandbernard.github.io/geo-draw/#/demo/covid-italy-newest

## Setup
If you run the application yourself you will have to clone the repository, download
and extract geojson data and then bundle using yarn. After bundeling you simply have
to serve the contents of the `dist/` directory. 

### Clone the repository
```
$ git clone https://github.com/rolandbernard/geo-draw
$ cd geo-draw
```

### Download the data
You can download the required data from eighter https://osm-boundaries.com/ or
https://www.geoboundaries.org/. You can also use other soures of geojson, as long as
they use the same properties for the name and id as eighter of the other two sources.
You should put your data into the `data/` directory.
```
$ mkdir data
$ cp <your data> data/
```

### Extract the data
Setting up this web application requires extracting geojson data into a usable and more
importantly compact format. This can be done using the Rust program in `data-extarct/`.
The data should be in `data/` and will be extracted to `static/data/`. To run the extraction
program simply go into `data-extract/` (using: `cd data-extract/`) and then run the program
using cargo (`cargo run --release`).

### Bundle
To bundle the project simply use yarn:
```
$ yarn dist
```
