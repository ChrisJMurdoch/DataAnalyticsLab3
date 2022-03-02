
class WorldMap {

    static onClickCallback = null;
    static focusedRegionId = null;

    /** Add map to document and load JSON region data */
    static createMap(json) {

        // Create offsets to centre map on Europe (Excluding Antarctica)
        const mapOffset = 1.4,
              aspectRatio = 1.5;

        // Get size
        const width = d3.select("#map_canvas").style("width").slice(0, -2),
              height = width / aspectRatio;

        // Create canvas components
        const map_canvas = d3.select("#map_canvas")
            .style("height", height);
        map_canvas
            .append("g")
            .attr("id", "map");
        map_canvas
            .append("use")
            .attr("id", "region_highlight")
            .style("pointer-events", "none");
        map_canvas
            .append("text")
            .classed("title", true)
            .attr("x", width/2)
            .attr("y", height-20)
            .style("text-anchor", "middle");

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
            .attr('id', (d) => `${d.properties.ISO_A3}`)
            .classed("region", true)
            .attr('d', geoGenerator)
            .on('mouseover', function (event, data) {

                // Display region-box data
                map_canvas.select('.title')
                    .text(`${data.properties.NAME} (${data.properties.ISO_A3})`);
                
            })
            .on('click', WorldMap.click)
            .classed("valid", (d) => d.properties.valid)
            .classed("invalid", (d) => !d.properties.valid);
    }

    /** Bind a function to be called when a region is clicked, provided with the region's ISO code */
    static onClick(func) {
        WorldMap.onClickCallback = func;
    }

    /** React to click - can be 'dummied' */
    static click(event, data) {

        // Check valid
        if (data.properties.ISO_A3.includes("-") || !data.properties.valid)
            return;

        // Unfocus old region
        if (WorldMap.focusedRegionId!==null)
            d3.select(`#${WorldMap.focusedRegionId}`)
                .classed("focused", false);
        
        // Focus new region
        WorldMap.focusedRegionId = data.properties.ISO_A3;
        d3.select(`#${WorldMap.focusedRegionId}`)
            .classed("focused", true);
        d3.select("#region_highlight").attr("xlink:href", `#${WorldMap.focusedRegionId}`);
        
        // Invoke callback
        if (WorldMap.onClickCallback !== null)
            WorldMap.onClickCallback(data.properties.ISO_A3);
    }
}
