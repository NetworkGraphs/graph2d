/**
 * received events:
 * - graph_vertex   (add, move, hover)
 * - graph_edge     (add)
 * - graph (clear)
 */

import * as utils from "./../src/utils.js";
import * as dat from "./gui_app.js"
import * as filter from "./filters.js"
import config from "../config.js";
import * as mouse from "./mouse_move.js";


let draw;

let Vector = Matter.Vector;

function init(element){

    const start = Date.now();
    draw = SVG().addTo(element).size('100%', '100%');
    draw.attr({id:"svg_graph"});
    filter.create("svg_graph");
    window.addEventListener( 'graph_vertex', onViewVertex, false );
    window.addEventListener( 'graph_edge', onViewEdge, false );
    window.addEventListener( 'graph', onGraph, false );
    window.addEventListener( 'graph_mouse', onViewMouse, false );
    svg_transform_init(document.getElementById('svg_graph'));
    console.log(`view_svg> init() in ${Date.now() - start} ms`);
}

//----    Events    ----


    function onViewVertex(e){
        const d = e.detail;
        if(d.type == 'add_before_edge'){
            vertex_add(d);
        }
        else if(d.type == 'move'){
            vertex_move(d.id,d.x,d.y,d.a);
        }
        else if(d.type == 'update'){
            vertex_update(d);
        }
        else if(e.detail.type == "add_after_edge"){
            vertex_readd(d);
        }
        else if(e.detail.type == "hover"){
            vertex_highlight(d.id,d.start);
        }
    }

    function onViewEdge(e){
        if(e.detail.type == "add"){
            edge_add(e.detail);
        }
        else if(e.detail.type == "refresh"){
            edge_refresh(e.detail);
        }
        else if(e.detail.type == "hover"){
            edge_highlight(e.detail);
        }
    }

    function onGraph(e){
        if(typeof(e.detail.action) != "undefined"){
            if(e.detail.action == "clear"){
                graph_clear();
            }
        }
    }

    function onViewMouse(e){
        let svg = document.getElementById('svg_graph');
        if(e.detail.type == "view_scale"){
            //svg_move(svg,0,0);
            svg_scale(svg,e.detail.step,e.detail.origin);
        }else if(e.detail.type == "view_move"){
            svg_shift(svg,e.detail.tx,e.detail.ty);
        }
    }
//----    SVG Utils    ----
//important to call so that translate comes before the scale
function svg_transform_init(element){
    let svg = document.getElementById('svg_graph');
    svg.style.backgroundColor = "#fafafa";
    let tr_translate = element.createSVGTransform();
    tr_translate.setTranslate(0,0);
    element.transform.baseVal.appendItem(tr_translate);

    let tr_scale = element.createSVGTransform();
    tr_scale.setScale(1,1);
    element.transform.baseVal.appendItem(tr_scale);

    element.style.transformOrigin = "0% 0%";
}

function svg_scale(element,step,origin){
    let rect_prev = element.getBoundingClientRect();
    let transform = element.transform.baseVal[1];
    let tochange = false;
    let new_scale;
    if(transform.type == SVGTransform.SVG_TRANSFORM_SCALE){
        let sx = transform.matrix.a;
        if(step == 'up'){
            new_scale = sx / config.system.view.scale_ratio;
            if (new_scale > config.system.view.scale_min){
                tochange = true;
            }
        }else{
            new_scale = sx * config.system.view.scale_ratio;
            if (new_scale < config.system.view.scale_max){
                tochange = true;
            }
        }
    }
    if(tochange){
        transform.setScale(new_scale,new_scale);
        let rect = element.getBoundingClientRect();
        let dx = origin.rx * (rect.width - rect_prev.width);
        let dy = origin.ry * (rect.height - rect_prev.height);
        svg_shift(element,-dx,-dy);
    }
    //console.log(`after scale w = ${rect.width} ; h = ${rect.height}`);
}

function svg_move(element,px,py){
    let transform = element.transform.baseVal[0];
    if(transform.type == SVGTransform.SVG_TRANSFORM_TRANSLATE){
        transform.setTranslate(px,py);
    }
}

function svg_shift(element,tx,ty){
    console.log(`tx = ${tx} ; ty = ${ty}`);
    let transform = element.transform.baseVal[0];
    if(transform.type == SVGTransform.SVG_TRANSFORM_TRANSLATE){
        let new_tx = transform.matrix.e + tx;
        let new_ty = transform.matrix.f + ty;
        transform.setTranslate(new_tx,new_ty);
    }
}

//----    Graph    ----

//----    Vertex    ----

    function vertex_add(d){
        console.log(`view_svg> added node '${d.label}'`);
        let group = draw.group().id('g_'+d.id);
        let text = draw.text(d.label).id('t_'+d.id).css('pointer-events', 'none');
        let vert = draw
                    .rect(d.w,d.h)
                    .id('vert_'+d.id)
                    .attr({ fill: dat.params.VertexColor })
                    .on([   
                            'mousedown', 'mouseup',
                            'click', 'mouseenter',
                            'mouseleave','contextmenu',
                            'touchstart','touchend'], mouse.onMouseVertex);
        vert.center(0,0);
        vert.radius(10);
        filter.shadow_light('vert_'+d.id);
        group.add(vert);
        text.font({size:20,anchor:"middle",family:"Arial"});
        text.center(0,0);
        group.add(text);
        group.center(0,0);

    }

    function vertex_move(id,x,y,a){
        let groupd_svg = document.getElementById('g_'+id);
        groupd_svg.setAttribute("transform", `translate(${x},${y}) rotate(${a})`);
    }

    function vertex_update(d){
        let rect = document.getElementById('vert_'+d.id);
        rect.setAttribute("width", d.w);
        rect.setAttribute("height", d.h);
        rect.setAttribute("x", -d.w/2);
        rect.setAttribute("y", -d.h/2);
        let text = document.getElementById('t_'+d.id);
        text.setAttribute("font-size",d.h*2/5);
    }


    function vertex_readd(d){
        //let group = SVG('#g_'+id);
        var groupd_svg = document.getElementById('g_'+d.id);
        let parent = groupd_svg.parentNode;
        parent.removeChild(groupd_svg);
        parent.appendChild(groupd_svg);
    }

    function vertex_highlight(id,start){
        let vertex = SVG('#vert_'+id);
        if(start){
            //vertex.css('fill',dat.params.VertexHighlight);
            vertex.attr({ fill: dat.params.VertexHighlight });
            filter.blur('vert_'+id);
        }
        else{
            //vertex.css('fill',dat.params.VertexColor);
            vertex.attr({ fill: dat.params.VertexColor });
            filter.shadow_light('vert_'+id);
        }
        //console.log(`svg> highlight , ${start}`);
    
    }
    
//----    Line    ----

    function add_line(params){
        //let start = SVG('#g_'+params.src);
        //let stop = SVG('#g_'+params.dest);
        console.log(`svg> added edge from ${params.src} to ${params.dest}`);
        //let line = draw.line(0, 0, 100, 150).stroke({ width: 1 })
        var line = draw.line(0, 100, 100, 0);//.id('l_'+params.id).move(20, 20);
        line.attr({id:'l_'+params.id});
        let cl = config.system.view.colors.edges;
        line.stroke({ color: cl.default, width: 10, linecap: 'round' });
    }

    function refresh_line(params){
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

    function add_polyline(params){
        //let start = SVG('#g_'+params.src);
        //let stop = SVG('#g_'+params.dest);
        let path = draw.path('M0 100 L100 10');//.id('l_'+params.id).move(20, 20);
        path.attr({id:'l_'+params.id})
        let cl = config.system.view.colors.edges;
        path.stroke({ color: cl.default, width: 10, linecap: 'round' });
        console.log(`poly> l_${params.id}`);
        //filter.disp_turb('l_'+params.id);
    }

    function refresh_polyline(params){
        let id = 'l_'+params.id;
        //console.log(`poly> l_${params.id}`);
        let path = SVG('#'+id);
        if(path != null){
            let start = SVG('#g_'+params.src);
            let stop = SVG('#g_'+params.dest);
            //console.log(`svg> edge move : ${params.src} to ${params.dest} : ${start.transform('e')} -> ${stop.transform('f')}`);
            //console.log(`svg> rot : ${start.transform('rotate')} - Tx : ${start.transform('translateX')}`);
            let x1 = start.transform('translateX');
            let y1 = start.transform('translateY');
            let r1 = start.transform('rotate');
            let x2 = stop.transform('translateX');
            let y2 = stop.transform('translateY');
            let r2 = stop.transform('rotate');
            path.plot(`M${x1} ${y1} L${x2} ${y2}`);
            //let p1 = Vector.create(x1,y1);
            //let p2 = Vector.create(x2,y2);
            //let diff = Vector.sub(p2,p1);

            //filter.disp_turb('l_'+params.id);
        }
    }

//----    Edge    ----

    function edge_refresh(params){
        if(dat.params.edges == "line"){
            refresh_line(params);
        }
        else if(dat.params.edges == "polyline"){
            refresh_polyline(params);
        }
    }

    function edge_add(params){
        if(dat.params.edges == "line"){
            add_line(params);
        }
        else if(dat.params.edges == "polyline"){
            add_polyline(params)
        }
    }

    function edge_highlight(params){
        let id = 'l_'+params.id;
        if(params.start){
            //filter.disp_turb(id);
            document.getElementById(id).setAttribute("stroke",config.system.view.colors.edges.highlight);
        }
        else{
            //filter.clear(id);
            document.getElementById(id).setAttribute("stroke",config.system.view.colors.edges.default);
        }
    }

function clear_tag(tag){
    let input = document.getElementsByTagName(tag);
    let inputList = Array.prototype.slice.call(input);
    inputList.forEach(el => {el.parentNode.removeChild(el)});
}

function graph_clear(){
    clear_tag("g");
    clear_tag("line");
    clear_tag("path");
}


export{init};
