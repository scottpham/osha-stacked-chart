var mobileThreshold = 300, //set to 500 for testing
    aspect_width = 16,
    aspect_height = 12;

//standard margins
var margin = {
    top: 30,
    right: 100,
    bottom: 40,
    left: 30
};
//jquery shorthand
var $graphic = $('#graphic');
//base colors
var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

/*
 * Render the graphic
 */
//check for svg
$(window).load(function() {
    draw_graphic();
});

function draw_graphic(){
    if (Modernizr.svg){
        $graphic.empty();
        var width = $graphic.width();
        render(width);
        window.onresize = draw_graphic; //very important! the key to responsiveness
    }
}

function render(width) {

    //empty object for storing mobile dependent variables
    var mobile = {};
    //check for mobile
    function ifMobile (w) {
        if(w < mobileThreshold){
        }
        else{
        }
    } 
    //call mobile check
    ifMobile(width);

    //calculate height against container width
    var height = Math.ceil((width * aspect_height) / aspect_width) - margin.top - margin.bottom;

    height -= (margin.top + margin.bottom);

    var width = width - margin.left - margin.right;

	var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
	var y = d3.scale.linear().rangeRound([height, 0]);

	var color = d3.scale.ordinal().range(colorbrewer.BrBG[7]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickFormat(d3.format(".2s"));

	var svg = d3.select("#graphic").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.csv("complaints.csv", function(error, data) {
        //create an array of column names
        //exclude the year column
		color.domain(d3.keys(data[0]).filter(function(key) { return key !== "year"; }));
		
		data.forEach(function(d){
			var y0 = 0;
			//calculate baselines
			d.category = color.domain().map(function(name) { return {class: name, name: name, y0: y0, y1: y0 += +d[name]}; });
			d.total = d.category[d.category.length - 1].y1;
		});

        //show stacked data
        console.log(data);
		//delete this
		// data.sort(function(a, b) {
		// 	return b.total = a.total;
		// });

		x.domain(data.map(function(d) { return d.year; }));
		y.domain([0, d3.max(data, function(d) { return d.total; })]);

		//group for axis
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
            .call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
		   .append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", "0.71em")
			.style("text-anchor", "end")
			.text("Complaints");

		//group for stacks
		var complaints = svg.selectAll(".complaints")
			.data(data)
			.enter().append("g")
			.attr("class", "g")
			.attr("transform", function(d) { return "translate(" + x(d.year) + ",0)"; });

		complaints.selectAll("rect")
			.data(function(d) { return d.category; })
			.enter().append("rect")
			.attr("width", x.rangeBand())
            .attr("class", function(d){ return d.class; })
            .attr("y", function(d){ return y(d.y1); })
			.attr("height", function(d){ return y(d.y0) - y(d.y1); })
			.style("fill", function(d) { return color(d.name); });

		var legend = svg.selectAll(".legend")
			.data(color.domain().slice().reverse())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i){ return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
			.attr("x", width) //furthest right edge
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		legend.append("text")
			.attr("x", width + 19) //place it just to the right of the rect. text will spill into margin
			.attr("y", 9)
			.attr("dy", "0.2em")
            .style("text-anchor", "start")
            .text(function(d) { return d; });


        /////////events////////

	});//end csv call

    //coercion function called back during csv call
    function type(d){
        d.value = +d.value;
        return d;
    }

}//end function render    





