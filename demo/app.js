
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");



//定义缩放
var zoom = d3.behavior.zoom()
            .scaleExtent([1, 10])
            .on("zoom", zoomed);

function zoomed() {
    svg_container.attr("transform",
        "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}
var svg_container = svg.append("g").call(zoom);


var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2));


// 数据导入 callback
d3.json("test.json", function(error, graph) {
  if (error) throw error;
  window.jsondata = graph
//添加连线
  var link = svg_container.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
      .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

//添加节点
  var node = svg_container.append("g")
      .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter()
    .append("g")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));


  node.append("circle")
      .attr("r", 10)  //半径
      .attr("fill", function(d) { return color(d.group); })


  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  //力学图每一帧  进行中的位置
  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
        // .attr("cx", function(d) { return d.x; })
        // .attr("cy", function(d) { return d.y; });
        .attr("transform",function(d){
          return "translate("+d.x+","+d.y+")"
        })
  }
});

/*
  drag拖拽的事件

  dragstarted拖拽状态：开始
  dragged拖拽状态：进行中
  dragended拖拽状态：结束
*/
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
