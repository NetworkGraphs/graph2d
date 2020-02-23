import * as utils from "./../src/utils.js";
import * as dat from "./gui_app.js";

let state ={over_vertex:false,coord:{x:0,y:0},isdown:false,origin:{rx:0,ry:0},dragging:false,acting:false};

function init(element){

    element.addEventListener( 'touchstart', onMousePan, false );
    element.addEventListener( 'touchend', onMousePan, false );
    element.addEventListener( 'mousedown', onMousePan, false );
    element.addEventListener( 'mouseup', onMousePan, false );
    element.addEventListener( 'mousemove', onMousePan, false );
    element.addEventListener( 'mousedown', onMouseZoom, false );
    element.addEventListener( 'wheel', onWheel, false );

    //onMouseVertex registred by the view_svg for every svg vertex
}

function onMousePan(e){
    if(e.target.tagName == "rect"){
        //TODO handle vertex move on physics
    }else{//svg or div
        let mx = e.clientX;//e.offsetX
        let my = e.clientY;//e.offsetY
        if(e.buttons == 1){
            if(e.type == "mousedown"){
                state.isdown = true;
            }else if(e.type == "mouseup"){
                state.isdown = false;
            }else if(e.type == "mousemove"){
                let dx = mx - state.coord.x;
                let dy = my - state.coord.y;
                utils.send('graph_mouse',{type:'view_move',tx:dx,ty:dy});
            }
        }
        if(e.target.tagName == "svg"){
            let svg_rect_no_scale = e.target.parentElement.getBoundingClientRect();
            state.origin.rx = e.offsetX / svg_rect_no_scale.width;
            state.origin.ry = e.offsetY / svg_rect_no_scale.height;
            //console.log(`rx=${state.origin.rx.toFixed(2)} , ry=${state.origin.ry.toFixed(2)} ; w=${svg_rect_scale.width.toFixed(2)} ; h=${svg_rect_scale.height.toFixed(2)}`);
        }
        state.coord.x = mx;
        state.coord.y = my;
    }
    e.preventDefault();
    e.stopPropagation();
}

function onMouseZoom(e){
    //console.log('Zoom');
    e.preventDefault();
    e.stopPropagation();
}

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
        utils.send('graph_mouse',{type:'view_scale',step:step,origin:state.origin});
    }
    e.preventDefault();
    e.stopPropagation();
}


export{init,onMouseVertex};
