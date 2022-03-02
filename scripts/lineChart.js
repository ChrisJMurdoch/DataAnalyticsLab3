
class LineChart {

    static dateFormatting = "%m/%Y";
    static aspectRatio = 4;
    static padding = 27;

    identifier;
    outerWidth;
    outerHeight;
    innerWidth;
    innerHeight;

    constructor(identifier) {

        // Set ID
        this.identifier = identifier;

        // Set dimensions
        this.outerWidth = d3.select(`#${this.identifier}`).style("width").slice(0, -2);
        this.outerHeight = this.outerWidth / LineChart.aspectRatio;
        this.innerWidth = this.outerWidth - LineChart.padding*2;
        this.innerHeight = this.outerHeight - LineChart.padding*2;

        // Create canvas components
        const linechart_canvas = d3.select(`#${this.identifier}`)
            .style("height",  this.outerHeight);
        const linechart = linechart_canvas
            .append("g")
            .attr("id", "linechart")
            .attr("width",  this.innerWidth)
            .attr("height",  this.innerHeight)
            .attr("transform", `translate(${LineChart.padding}, ${LineChart.padding})`);
    }

    update(inputData, getX, getY, getXExtent, getYExtent) {

        // Get canvas components
        const linechart_canvas = d3.select(`#${this.identifier}`);
        const linechart = linechart_canvas.select("#linechart");

        // Collect all valid records (have x and y values)
        const data = [];
        inputData.forEach((element) => {
            const x = getX(element),
                  y = getY(element);
            if ( x!==undefined && y!==undefined )
                data.push({x:x, y:y});
        });

        // Fade old axes and line
        linechart_canvas.selectAll(".axis")
            .transition()
            .duration(1000)
            .style("opacity", "0")
            .remove();
        linechart.selectAll("path")
            .transition()
            .duration(1000)
            .style("opacity", "0")
            .remove();

        // Create axes
        const xExtent = getXExtent(data);
        const x = d3.scaleTime()
            .domain([ xExtent[0], xExtent[1] ])
            .range([0,  this.innerWidth]);
        const yExtent = getYExtent(data);
        const y = d3.scaleLinear()
            .domain([ yExtent[0], yExtent[1] ])
            .range([ this.innerHeight, 0]);
        linechart.append("g")
            .call(d3.axisLeft(y))
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisTop(x).tickFormat(d3.timeFormat(LineChart.dateFormatting)))
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisRight(y))
            .attr("transform", `translate(${ this.innerWidth}, 0)`)
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat(LineChart.dateFormatting)))
            .attr("transform", `translate(0, ${ this.innerHeight})`)
            .classed("axis", true);
        
        // Plot line
        linechart.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "blue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x( (d) => x(d.x) )
                .y( (d) => y(d.y) )
            )
            .style("opacity", "0")
            .transition()
            .duration(1000)
            .style("opacity", "1");
    }
}
