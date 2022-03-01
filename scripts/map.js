
class WorldMap {

    static onClickCallback = null;

    /** Add map to document and load JSON region data */
    static createMap(json) {

        // Create offsets to centre map on Europe (Excluding Antarctica)
        const mapOffset = 1.4,
              aspectRatio = 1.5;

        // Get size
        const width = d3.select("#canvas").style("width").slice(0, -2),
              height = width / aspectRatio;

        // Set canvas height
        d3.select("#canvas").style("height", height);

        // Create GeoGenerator
        const projection = d3.geoMercator()
            .scale(width / Math.PI / 2)
            .rotate([-10, 0])
            .center([0, 0])
            .translate([width / 2, mapOffset * height / 2]);
        const geoGenerator = d3.geoPath().projection(projection);

        // Add regions to map
        d3.select('#map')
            .selectAll('path')
            .data(json.features)
            .enter()
            .append('path')
            .attr('id', (d) => `${d.properties.NAME.replaceAll(" ", "_")}`)
            .classed("region", true)
            .attr('d', geoGenerator)
            .on('mouseover', function (event, data) {

                // Display region-box data
                d3.select('#info').text(`${data.properties.NAME} | ISO: ${data.properties.ISO_A3}`);

                // Bring region to front
                d3.select("#foreground_region").attr("xlink:href", `#${data.properties.NAME.replaceAll(" ", "_")}`)
            })
            .on('click', function handleClick(event, data) {

                // Invoke callback
                if (WorldMap.onClickCallback !== null)
                    WorldMap.onClickCallback(data.properties.ISO_A3);
            })
            .classed("valid", (d) => d.properties.valid)
            .classed("invalid", (d) => !d.properties.valid);
    }

    /** Bind a function to be called when a region is clicked, provided with the region's ISO code */
    static onClick(func) {
        WorldMap.onClickCallback = func;
    }
}
