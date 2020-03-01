import * as utils from "./../src/utils.js";
import * as dat from "./gui_app.js";

let state ={over_vertex:false,coord:{x:0,y:0},dragging:false,acting:false};

function init(element){

    element.addEventListener( 'touchstart', onMousePan, false );
    element.addEventListener( 'touchend', onMousePan, false );
    element.addEventListener( 'mousedown', onMousePan, false );
    element.addEventListener( 'mouseup', onMousePan, false );
    element.addEventListener( 'mousemove', onMousePan, false );
    element.addEventListener( 'wheel', onWheel, false );
    element.addEventListener( 'contextmenu', onContext, false );

    //onMouseVertex for every rect mouseenter,mouseleave
}

function onContext(e){
    if(e.target.tagName == "rect"){
        e.preventDefault();
        e.stopPropagation();
    }
}

function onMousePan(e){
    let mx = e.clientX;//e.offsetX
    let my = e.clientY;//e.offsetY
    let dx = mx - state.coord.x;
    let dy = my - state.coord.y;
    if(state.dragging){
        if(e.type == "mouseup"){
            utils.send('graph_mouse',{type:'drag',start:false})
            state.dragging = false;//for mouse up outside the vertex after starting a down inside
        }
    }
    if((e.type != "mousemove") && (e.target.tagName == "rect")){
        onMouseVertex(e);        
    }
    if((e.buttons == 1) && (e.type == "mousemove")){
        if(state.dragging){
            utils.send('graph_mouse',{type:'vert_move',tx:dx,ty:dy});
        }else if(e.target.tagName == "svg"){//svg or div
            if(!state.dragging){
                utils.send('graph_mouse',{type:'view_move',tx:dx,ty:dy});
            }
        }
    }
    state.coord.x = mx;
    state.coord.y = my;
    e.preventDefault();
    e.stopPropagation();
}

//coming from a registration in each rect to have mouseenter / mouseleave,...
function onMouseVertex(e){
    //console.log(`${e.type} on ${e.target.id}`);
    const id = e.target.id.substr(5,e.target.id.length);
    let graph_events = [];
    let start;
    if(['contextmenu', 'click'].includes(e.type)){
        e.preventDefault();
        e.stopPropagation();
    }else if(['mousedown'].includes(e.type)){
        if(e.buttons == 2){
            graph_events.push('act');
            start = true;
            state.acting = true;
        }else if(e.buttons == 1){
            graph_events.push('drag');
            start = true;
            //console.log("drag start");
            state.dragging = true;
        }
    }else if(['mouseup'].includes(e.type)){
        if(state.dragging){
            graph_events.push('drag');
            state.dragging = false;
            start = false;
            //console.log("drag over");
        }
        if(state.acting){
            graph_events.push('act');
            start = false;
            state.acting = false;
        }
    }else if(e.type == 'touchstart'){
        if(e.touches.length == 1){
            graph_events.push('hover');
            start = true;
            state.over_vertex = true;
        }else if(e.touches.length == 2){
            graph_events.push('act');
            start = true;
            graph_events.push('hover');
            state.acting = true;
            state.over_vertex = true;
        }
    }else if(e.type == 'mouseenter'){
        if(!state.dragging){
            graph_events.push('hover');
            start = true;
            state.over_vertex = true;
        }
    }else if(['mouseleave','touchend'].includes(e.type)){
        if(!state.dragging){
            graph_events.push('hover');
            start = false;
            state.over_vertex = false;
            if(state.acting){
                graph_events.push('act');
                start = false;
                state.acting = false;
            }
        }
    }
    graph_events.forEach(type => utils.send('graph_mouse',{type:type,id:id,start:start}));
    return false;
}

function onWheel(e){
    let step;
    if(e.deltaY > 0){
        step = 'up';
    }else if (e.deltaY < 0){
        step = 'down';
    }
    if(state.over_vertex){
        utils.send('graph_mouse',{type:'vertex_scale',step:step});
    }else{
        let svg_rect_no_scale = e.target.parentElement.getBoundingClientRect();
        let origin = {rx:e.offsetX / svg_rect_no_scale.width,ry:e.offsetY / svg_rect_no_scale.height};
        utils.send('graph_mouse',{type:'view_scale',step:step,origin:origin});
    }
    e.preventDefault();
    e.stopPropagation();
}


export{init,onMouseVertex};
