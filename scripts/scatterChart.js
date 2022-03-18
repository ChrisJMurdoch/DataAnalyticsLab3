
class ScatterChart {

    static dateFormatting = "%m/%Y";
    static aspectRatio = 4;
    static padding = {top: 60, bottom: 33, sides: 36};
    static transitionDuration = 1200;

    identifier;
    outerWidth;
    outerHeight;
    innerWidth;
    innerHeight;

    constructor(identifier, selectionCallback) {

        // Set ID
        this.identifier = identifier;

        // Set dimensions
        this.outerWidth = d3.select(`#${this.identifier}`).style("width").slice(0, -2);
        this.outerHeight = this.outerWidth / ScatterChart.aspectRatio;
        this.innerWidth = this.outerWidth - ScatterChart.padding.sides*2;
        this.innerHeight = this.outerHeight - (ScatterChart.padding.top+ScatterChart.padding.bottom);

        // Create canvas components
        const chart_canvas = d3.select(`#${this.identifier}`)
            .style("height",  this.outerHeight);
        const chart = chart_canvas
            .append("g")
            .attr("id", "chart")
            .attr("width",  this.innerWidth)
            .attr("height",  this.innerHeight)
            .attr("transform", `translate(${ScatterChart.padding.sides}, ${ScatterChart.padding.top})`);
        chart_canvas
            .append("text")
            .classed("title", true)
            .attr("transform", `translate(${this.outerWidth/2}, ${ScatterChart.padding.top/2-3})`)
            .style("text-anchor", "middle");

        // Add brushing
        const _this = this;
        chart.call( d3.brush()
            .extent( [ [0,0], [innerWidth,innerHeight] ] )
            .on("end", function(brush) {

                // Clear selection
                d3.selectAll(".scatterPoint")
                    .classed("scatterHighlight", false);
                
                // Get countries
                const selection = new Set();
                chart.selectAll(".scatterPoint")
                    .each( function(data) {
                        const elem = d3.select(this);
                        const coords = { x: elem.attr("cx"), y: elem.attr("cy") };
                        if (
                            coords.x > brush.selection[0][0] && coords.x < brush.selection[1][0] &&
                            coords.y > brush.selection[0][1] && coords.y < brush.selection[1][1]
                        ) {
                            let iso;
                            elem.each( (d) => { iso = d.iso_code || d[1].iso_code } );
                            selection.add(iso);
                        }
                    });
                
                // Call callback
                selectionCallback(selection);
                
                // Highlight selection
                d3.selectAll(".scatterPoint")
                    .filter(function(data) {
                        return selection.has(data.iso_code || data[1].iso_code);
                    })
                    .classed("scatterHighlight", true);
            })
        );
    }

    update(title, data, getX, getY, xExtent, yExtent, colour) {
        this.getX=getX, this.getY=getY;

        // Get canvas components
        const chart_canvas = d3.select(`#${this.identifier}`);
        const chart = chart_canvas.select("#chart");
        chart_canvas.select(".title").text(title);

        // Fade old axes and points
        chart_canvas.selectAll(".axis")
            .classed("axis", false) // So that new fade-in doesn't apply
            .transition()
            .duration(ScatterChart.transitionDuration)
            .style("opacity", "0")
            .remove();
        
        // Calc extents
        let xMin=null, xMax=null, yMin=null, yMax=null;
        for (let record of data) {
            const x = getX(record),
                  y = getY(record);
            xMin = (xMin===null) ? x : Math.min(xMin, x);
            xMax = (xMax===null) ? x : Math.max(xMax, x);
            yMin = (yMin===null) ? y : Math.min(yMin, y);
            yMax = (yMax===null) ? y : Math.max(yMax, y);
        }
        xExtent = (xExtent===null) ? [xMin, xMax] : xExtent;
        yExtent = (yExtent===null) ? [yMin, yMax] : yExtent;

        // Create axes
        const x = d3.scaleLinear()
            .domain([ xExtent[0], xExtent[1] ])
            .range([0,  this.innerWidth]);
        const y = d3.scaleLinear()
            .domain([ yExtent[0], yExtent[1] ])
            .range([ this.innerHeight, 0]);
        this.x=x, this.y=y;
        chart.append("g")
            .call(d3.axisLeft(y))
            .classed("axis", true);
        chart.append("g")
            .call(d3.axisTop(x))
            .classed("axis", true);
        chart.append("g")
            .call(d3.axisRight(y))
            .attr("transform", `translate(${ this.innerWidth}, 0)`)
            .classed("axis", true);
        chart.append("g")
            .call(d3.axisBottom(x))
            .attr("transform", `translate(0, ${ this.innerHeight})`)
            .classed("axis", true);
        
        // Fade in axes
        chart.selectAll(".axis")
            .style("opacity", "0")
            .transition()
            .duration(ScatterChart.transitionDuration)
            .style("opacity", "1");
    
        // Plot points
        chart.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .classed("scatterPoint", true)
            .attr("cx", (d) => x(getX(d)))
            .attr("cy", (d) => y(getY(d)))
            .attr("r", 2)
            .style("fill", colour);
    }
}
