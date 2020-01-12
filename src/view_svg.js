/**
 * supported events:
 * - view_vertex
     { type:(add,move),id,name)}
 */

let draw;

function init(){
    const start = Date.now();
    draw = SVG().addTo('body').size('100%', '100%');
    window.addEventListener( 'view_vertex', onViewVertex, false );
    console.log(`view_svg> init() in ${Date.now() - start} ms`);
}

function vertex_add(id,name){
    let width = 100;
    let height = 50;
    let x = width/2 +  Math.round((window.innerWidth-width) * Math.random());
    let y = height/2 + Math.round((window.innerHeight-height) * Math.random());
    console.log(`view_svg> added ${id} at (${x},${y})`);
    let group = draw.group().id('g_'+id);
    let text = draw.text(name).id('t_'+id);
    let vert = draw
                .rect(width,height)
                .id('vert_'+id)
                .attr({ fill: '#00af06' });
    group.add(vert);
    group.add(text);
    text.center(width/2,height/2);
    group.center(x,y);
}

function vertex_move(id,x,y){
    let group = SVG('#g_'+id);
    group.center(x,y);
}

function onViewVertex(e){
    const d = e.detail;
    if(d.type == 'add'){
        vertex_add(d.id,d.name);
    }
    else if(d.type == 'move'){
        vertex_move(d.id,d.x,d.y);
    }
}

export{init};
