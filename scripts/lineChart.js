
class LineChart {

    static dateFormatting = "%m/%Y";
    static aspectRatio = 4;
    static padding = 27;

    static createLineChart(inputData, getX, getY, getXExtent, getYExtent) {

        // Get size
        const outerWidth = d3.select("#linechart_canvas").style("width").slice(0, -2),
              outerHeight = outerWidth / LineChart.aspectRatio,
              innerWidth = outerWidth - LineChart.padding*2,
              innerHeight = outerHeight - LineChart.padding*2;

        // Create canvas components
        const linechart_canvas = d3.select("#linechart_canvas")
            .style("height", outerHeight);
        const linechart = linechart_canvas
            .append("g")
            .attr("id", "linechart")
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("transform", `translate(${LineChart.padding}, ${LineChart.padding})`);

        // Collect all valid records (have x and y values)
        const data = [];
        inputData.forEach((element) => {
            const x = getX(element),
                  y = getY(element);
            if ( x!==undefined && y!==undefined )
                data.push({x:x, y:y});
        });

        // Create axes
        const xExtent = getXExtent(data);
        const x = d3.scaleTime()
            .domain([ xExtent[0], xExtent[1] ])
            .range([0, innerWidth]);
        const yExtent = getYExtent(data);
        const y = d3.scaleLinear()
            .domain([ yExtent[0], yExtent[1] ])
            .range([innerHeight, 0]);
        linechart.append("g")
            .call(d3.axisLeft(y))
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisTop(x).tickFormat(d3.timeFormat(LineChart.dateFormatting)))
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisRight(y))
            .attr("transform", `translate(${innerWidth}, 0)`)
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat(LineChart.dateFormatting)))
            .attr("transform", `translate(0, ${innerHeight})`)
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
            );
    }

    static updateLineChart(inputData, getX, getY, getXExtent, getYExtent) {

        // Get size
        const outerWidth = d3.select("#linechart_canvas").style("width").slice(0, -2),
              outerHeight = outerWidth / LineChart.aspectRatio,
              innerWidth = outerWidth - LineChart.padding*2,
              innerHeight = outerHeight - LineChart.padding*2;

        // Create canvas components
        const linechart_canvas = d3.select("#linechart_canvas")
            .style("height", outerHeight);
        const linechart = linechart_canvas
            .select("#linechart")
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("transform", `translate(${LineChart.padding}, ${LineChart.padding})`);

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
            .range([0, innerWidth]);
        const yExtent = getYExtent(data);
        const y = d3.scaleLinear()
            .domain([ yExtent[0], yExtent[1] ])
            .range([innerHeight, 0]);
        linechart.append("g")
            .call(d3.axisLeft(y))
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisTop(x).tickFormat(d3.timeFormat(LineChart.dateFormatting)))
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisRight(y))
            .attr("transform", `translate(${innerWidth}, 0)`)
            .classed("axis", true);
        linechart.append("g")
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat(LineChart.dateFormatting)))
            .attr("transform", `translate(0, ${innerHeight})`)
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
