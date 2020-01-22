/**
 * received events:
 * - graph_vertex   (add, move)
 * - graph_edge     (add)
 * - graph (clear)
 */

let draw;
let width = 100;
let height = 50;

function init(element){
    const start = Date.now();
    draw = SVG().addTo(element).size('100%', '100%');
    window.addEventListener( 'graph_vertex', onViewVertex, false );
    window.addEventListener( 'graph_edge', onViewEdge, false );
    window.addEventListener( 'graph', onGraph, false );
    console.log(`view_svg> init() in ${Date.now() - start} ms`);
}

function vertex_add(id,label){
    console.log(`view_svg> added node '${label}'`);
    let group = draw.group().id('g_'+id);
    let text = draw.text(label).id('t_'+id);
    let vert = draw
                .rect(width,height)
                .id('vert_'+id)
                .attr({ fill: '#00af06' });
    vert.center(0,0);
    group.add(vert);
    text.center(0,0);
    group.add(text);
    group.center(0,0);
}

function vertex_readd(id, label){
    //let group = SVG('#g_'+id);
    var groupd_svg = document.getElementById('g_'+id);
    let parent = groupd_svg.parentNode;
    parent.removeChild(groupd_svg);
    parent.appendChild(groupd_svg);
}

function add_line(params){
    let start = SVG('#g_'+params.src);
    let stop = SVG('#g_'+params.dest);
    console.log(`svg> added edge from ${params.src} to ${params.dest}`);
    //let line = draw.line(0, 0, 100, 150).stroke({ width: 1 })
    var line = draw.line(0, 100, 100, 0).id('l_'+params.id).move(20, 20);
    line.stroke({ color: '#f06', width: 10, linecap: 'round' });
}

function edge_refresh(params){
    let id = 'l_'+params.id;
    let line = SVG('#'+id);
    if(line != null){
        let start = SVG('#g_'+params.src);
        let stop = SVG('#g_'+params.dest);
        //console.log(`svg> edge move : ${params.src} to ${params.dest} : ${start.transform('e')} -> ${stop.transform('f')}`);
        //console.log(`svg> rot : ${start.transform('rotate')} - Tx : ${start.transform('translateX')}`);
        let x1 = start.transform('translateX');
        let y1 = start.transform('translateY');
        let x2 = stop.transform('translateX');
        let y2 = stop.transform('translateY');
        line.plot(x1,y1,x2,y2);
    }
}


function edge_add(params){
    add_line(params);
}

function vertex_move_fail(id,x,y,a){
    let group = SVG('#g_'+id);
    //https://jsfiddle.net/Fuzzy/k066t1uk/20/
    group.rotate(a,x,y);
    group.center(x,y);
}

function vertex_move_2(id,x,y,a){
    let group = SVG('#g_'+id);
    group.transform({
        translate:[x,y],
        rotate:a
    });
    //group.transform({        translate:[x,y]    });
}

function vertex_move(id,x,y,a){
    var groupd_svg = document.getElementById('g_'+id);
    groupd_svg.setAttribute("transform", `translate(${x},${y}) rotate(${a})`);
}

function graph_clear(){
    {
        let input = document.getElementsByTagName("line");
        let inputList = Array.prototype.slice.call(input);
        inputList.forEach(el => {el.parentNode.removeChild(el)});
    }
    {
        let input = document.getElementsByTagName("g");
        let inputList = Array.prototype.slice.call(input);
        inputList.forEach(el => {el.parentNode.removeChild(el)});
    }
}

function onViewVertex(e){
    const d = e.detail;
    if(d.type == 'add_before_edge'){
        vertex_add(d.id,d.label);
    }
    else if(d.type == 'move'){
        vertex_move(d.id,d.x,d.y,d.a);
    }
    else if(e.detail.type == "add_after_edge"){
        vertex_readd(d.id,d.label);
    }
}

function onViewEdge(e){
    if(e.detail.type == "add"){
        edge_add(e.detail);
    }
    else if(e.detail.type == "refresh"){
        edge_refresh(e.detail);
    }
}

function onGraph(e){
    if(typeof(e.detail.action) != "undefined"){
        graph_clear();
    }
}

export{init};
