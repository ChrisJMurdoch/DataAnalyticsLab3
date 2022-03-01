

// Natural Earth data in JSON format from https://github.com/martynafford/natural-earth-geojson/tree/master/50m/cultural
const worldJson = "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/50m/cultural/ne_50m_admin_0_countries.json";

// Create offsets to centre map on Europe (Excluding Antarctica)
const mapOffset = 1.4,
      aspectRatio = 1.5;

// Display size
const width = d3.select("#canvas").style("width").slice(0, -2),
      height = width / aspectRatio;

// Set canvas height
d3.select("#canvas").style("height", height);

// Create GeoGenerator
const projection = d3.geoMercator()
    .scale(width/Math.PI/2)
    .rotate([-10, 0])
    .center([0, 0])
    .translate([width/2, mapOffset*height/2]);
const geoGenerator = d3.geoPath().projection(projection);

// Handle mouseover on regions
function handleMouseover(event, data) {

    // Get region-box data
    const pixelArea = geoGenerator.area(data),
          bounds = geoGenerator.bounds(data),
          measure = geoGenerator.measure(data);

    // Display region-box data
    d3.select('#info')
        .text(`${data.properties.NAME} | Area: ${pixelArea.toFixed(1)} | Measure: ${measure.toFixed(1)})`);
    
    // Bring region to front
    d3.select("#foreground_region").attr("xlink:href", `#${data.properties.NAME.replaceAll(" ", "_")}`)
}

// Load data into map
d3.json(worldJson).then(function(json) {

    // Add regions to map
    d3.select('#map')
        .selectAll('path')
        .data(json.features)
        .enter()
        .append('path')
        .attr('id', (d) => `${d.properties.NAME.replaceAll(" ", "_")}`)
        .attr("class", "region")
        .attr('d', geoGenerator)
        .on('mouseover', handleMouseover);
});
