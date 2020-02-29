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
    let movetype = null;
    if(e.target.tagName == "rect"){
        movetype = 'vert_move';
        onMouseVertex(e);
    }else if(e.target.tagName == "svg"){//svg or div
        movetype = 'view_move'
    }
    if((e.buttons == 1) && (e.type == "mousemove") && (movetype!=null)){
        utils.send('graph_mouse',{type:movetype,tx:dx,ty:dy});
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
    let type,start;
    let type2 = null;
    if(['contextmenu', 'click'].includes(e.type)){
        e.preventDefault();
        e.stopPropagation();
    }
    else if(['mousedown'].includes(e.type)){
        if(e.buttons == 2){
            type = 'act';
            start = true;
            state.acting = true;
        }else if(e.buttons == 1){
            type = 'drag';
            start = true;
            console.log("drag start");
            state.dragging = true;
        }
    }
    else if(['mouseup'].includes(e.type)){
        if(state.dragging){
            type = 'drag';
            start = false;
            state.dragging = false;
            console.log("drag over");
        }
        if(state.acting){
            type = 'act';
            start = false;
            state.acting = false;
        }
    }
    else if(e.type == 'touchstart'){
        if(e.touches.length == 1){
            type = 'hover';
            start = true;
            state.over_vertex = true;
        }
        else if(e.touches.length == 2){
            type = 'act';
            start = true;
            type2 = 'hover'
            state.acting = true;
            state.over_vertex = true;
        }
    }
    else if(e.type == 'mouseenter'){
        type = 'hover';
        start = true;
        state.over_vertex = true;
    }
    else if(['mouseleave','touchend'].includes(e.type)){
        type = 'hover';
        start = false;
        state.over_vertex = false;
        if(state.acting){
            type2 = 'act';
            start = false;
            state.acting = false;
        }
    }
    utils.send('graph_mouse',{type:type,id:id,start:start});
    if(type2 != null){
        utils.send('graph_mouse',{type:type2,id:id,start:start});
    }
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
