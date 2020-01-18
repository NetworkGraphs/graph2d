/**
 * supported events:
 * - graph_vertex
     { type:(add,move),id,name)}
 */

let draw;
let width = 100;
let height = 50;

function init(element){
    const start = Date.now();
    draw = SVG().addTo(element).size('100%', '100%');
    window.addEventListener( 'graph_vertex', onViewVertex, false );
    window.addEventListener( 'view_edge', onViewEdge, false );
    console.log(`view_svg> init() in ${Date.now() - start} ms`);
}

function vertex_add(id,name){
    console.log(`view_svg> added ${id}`);
    let group = draw.group().id('g_'+id);
    let text = draw.text(name).id('t_'+id);
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

function edge_add(id,label,src,dest,params){

}

function vertex_move_fail(id,x,y,a){
    let group = SVG('#g_'+id);
    //https://jsfiddle.net/Fuzzy/k066t1uk/20/
    group.rotate(a,x,y);
    group.center(x,y);
}

function vertex_move(id,x,y,a){
    var groupd_svg = document.getElementById('g_'+id);
    groupd_svg.setAttribute("transform", `translate(${x},${y}) rotate(${a})`);
}

function onViewVertex(e){
    const d = e.detail;
    if(d.type == 'add'){
        vertex_add(d.id,d.name);
    }
    else if(d.type == 'move'){
        vertex_move(d.id,d.x,d.y,d.a);
    }
}

function onViewEdge(e){
    const d = e.detail;
    if(d.type == 'add'){
        edge_add(d.id,d.label,d.out,d.in,{});
    }
}

export{init};
