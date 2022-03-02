
class LineChart {

    static dateFormatting = "%m/%Y";
    static aspectRatio = 4;
    static padding = {top: 60, bottom: 33, sides: 33};
    static transitionDuration = 1200;

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
        this.innerWidth = this.outerWidth - LineChart.padding.sides*2;
        this.innerHeight = this.outerHeight - (LineChart.padding.top+LineChart.padding.bottom);

        // Create canvas components
        const linechart_canvas = d3.select(`#${this.identifier}`)
            .style("height",  this.outerHeight);
        const linechart = linechart_canvas
            .append("g")
            .attr("id", "linechart")
            .attr("width",  this.innerWidth)
            .attr("height",  this.innerHeight)
            .attr("transform", `translate(${LineChart.padding.sides}, ${LineChart.padding.top})`);
        linechart_canvas
            .append("text")
            .classed("title", true)
            .attr("transform", `translate(${this.outerWidth/2}, ${LineChart.padding.top/2-3})`)
            .style("text-anchor", "middle");
    }

    update(title, inputData, getX, getY, getXExtent, getYExtent) {

        // Get canvas components
        const linechart_canvas = d3.select(`#${this.identifier}`);
        const linechart = linechart_canvas.select("#linechart");
        linechart_canvas.select(".title").text(title);

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
            .classed("axis", false) // So that new fade-in doesn't apply
            .transition()
            .duration(LineChart.transitionDuration)
            .style("opacity", "0")
            .remove();
        linechart.selectAll("path")
            .transition()
            .duration(LineChart.transitionDuration)
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
        
        // Fade in
        linechart.selectAll(".axis")
            .style("opacity", "0")
            .transition()
            .duration(LineChart.transitionDuration)
            .style("opacity", "1");
        
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
            .duration(LineChart.transitionDuration)
            .style("opacity", "1");
    }
}
