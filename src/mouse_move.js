import * as utils from "./../src/utils.js";
import * as dat from "./gui_app.js";

function init(){

    window.addEventListener( 'touchstart', onMousePan, false );
    window.addEventListener( 'touchend', onMousePan, false );
    window.addEventListener( 'mousedown', onMousePan, false );
    window.addEventListener( 'mouseup', onMousePan, false );
    window.addEventListener( 'mousedown', onMouseZoom, false );


}

function onMousePan(e){
    console.log('Pan');
}

function onMouseZoom(e){
    console.log('Zoom');
}

export{init};
