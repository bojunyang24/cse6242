d3.dsv(",", "board_games.csv", function(d) {
    return {
      source: d.source,
      target: d.target,
      value: +d.value
    }
  }).then(function(data) {
  
    var links = data;
  
    var nodes = {};
  
    // compute the distinct nodes from the links.
    links.forEach(function(link) {
        link.source = nodes[link.source] || (nodes[link.source] = {name: link.source});
        link.target = nodes[link.target] || (nodes[link.target] = {name: link.target});
    });
  
    var width = 1200,
        height = 700;
  
    var force = d3.forceSimulation()
        .nodes(d3.values(nodes))
        .force("link", d3.forceLink(links).distance(100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force("charge", d3.forceManyBody().strength(-250))
        .alphaTarget(1)
        .on("tick", tick);
  
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
  
    // add the links
    var path = svg.append("g")
        .selectAll("path")
        .data(links)
        .enter()
        .append("path")
        .attr("class", function(d) { return "link " + d.type; })
        .style("stroke", function(d) {
            if (d.value == 0) {
                return "gray"
            } else {
                return "green"
            }
        })
        .style("stroke-width", function(d) {
            if (d.value == 0) {
                return 5
            } else {
                return 2
            }
        })
        .style("stroke-dasharray", function(d) {
            if (d.value == 0) {
                return null;
            } else {
                return "7 7"
            }
        });
    // define the nodes
    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .on("dblclick", release)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
  
    // add the nodes
    node.append("circle")
    .attr("r", function(d) {
        d.weight = links.filter(function(l) {
            return l.source.index == d.index || l.target.index == d.index
        }).length;
        var minRadius = 2;
        var maxRadius = 60;
        return Math.min(minRadius + (d.weight * 2.5), maxRadius);
    })
    .style("fill", nodeColor);
    
    // label the nodes with names
    node.append("text")
        // .attr("text-anchor","end")
        .attr("dx","8px")
        .attr("dy","-6px")
        .text(function(d){return d.name})
        .style("font-weight", "bold");
  
    // add the curvy lines
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });
  
        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; 
        });
    };
  
    function dragstarted(d) {
        console.log('dragstarted');
        if (!d3.event.active) force.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        d3.select(this).select("circle")
            .style("fill","purple");
    };
  
    function dragged(d) {
        console.log('dragged');
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };
  
    function dragended(d) {
        console.log('gradended');
        if (!d3.event.active) force.alphaTarget(0);
        d.fx = d.x;
        d.fy = d.y;
    };

    function release(d) {
        console.log('release');
        d.fx = null;
        d.fy = null;
        
        d3.select(this).select("circle")
            .style("fill", nodeColor);
    }

    function nodeColor(d) {
        if (d.weight < 3) {
            return "#e5f5f9";
        } else if (d.weight < 6) {
            return "#a8ddb5";
        } else {
            return "#43a2ca";
        }
    }
    
  }).catch(function(error) {
    console.log(error);
  });