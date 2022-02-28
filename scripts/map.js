
// Data sources
const africaJson = "https://assets.codepen.io/2814973/africa.json"; // From lecture slides
const worldJson = "https://raw.githubusercontent.com/ChrisJMurdoch/DataAnalyticsLab3/master/data/countries.geojson"; // From https://datahub.io/core/geo-countries#resource-countries

// Create GeoGenerator
const projection = d3.geoMercator().scale(400).translate([200, 280]).center([0, 5]);
const geoGenerator = d3.geoPath().projection(projection);

// Handle mouseover on regions
function handleMouseover(event, data) {

    // Get region-box data
    const pixelArea = geoGenerator.area(data),
          bounds = geoGenerator.bounds(data),
          measure = geoGenerator.measure(data);

    // Display region-box data
    d3.select('#info')
        .text(`${data.properties.name}. Area: ${pixelArea.toFixed(1)} Measure: ${measure.toFixed(1)})`);

    // Attach bounding-box to region-box
    d3.select('#bounding-box')
        .attr('x', bounds[0][0])
        .attr('y', bounds[0][1])
        .attr('width', bounds[1][0] - bounds[0][0])
        .attr('height', bounds[1][1] - bounds[0][1]);
}

// Load data into map
d3.json(worldJson).then(function(json) {

    // Add regions to map
    d3.select('#map')
        .selectAll('path')
        .data(json.features)
        .enter()
        .append('path')
        .attr("class", "region")
        .attr('d', geoGenerator)
        .on('mouseover', handleMouseover);
});
