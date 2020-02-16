import * as utils from "./../src/utils.js";
import * as dat from "./gui_app.js";

let state ={over:false};

function init(element){

    element.addEventListener( 'touchstart', onMousePan, false );
    element.addEventListener( 'touchend', onMousePan, false );
    element.addEventListener( 'mousedown', onMousePan, false );
    element.addEventListener( 'mouseup', onMousePan, false );
    element.addEventListener( 'mousedown', onMouseZoom, false );
    element.addEventListener( 'wheel', onWheel, false );

    //onMouseVertex registred by the view_svg for every svg vertex
}

function onMousePan(e){
    //console.log('Pan');
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
    if(['contextmenu', 'click'].includes(e.type)){
        e.preventDefault();
        e.stopPropagation();
    }
    if(['mousedown'].includes(e.type)){
        type = 'act';
        start = true;
    }
    if(['mouseup'].includes(e.type)){
        type = 'act';
        start = false;
    }
    if(['mouseover','touchstart'].includes(e.type)){
        type = 'hover';
        start = true;
        state.over = true;
    }
    if(['mouseleave','touchend'].includes(e.type)){
        type = 'hover';
        start = false;
        state.over = false;
    }
    utils.send('graph_mouse',{type:type,id:id,start:start});
    return false;
}

function onWheel(e){
    let step;
    if(e.deltaY > 0){
        step = 'down';
    }else if (e.deltaY < 0){
        step = 'up';
    }
    if(state.over){
        utils.send('graph_mouse',{type:'vertex_scale',step:step});
    }else{
        utils.send('graph_mouse',{type:'view_scale',step:step});
    }
}


export{init,onMouseVertex};
