import { GUI } 				from './../jsm/dat.gui.module.js';
import config from '../config.js';
import * as utils from "./../src/utils.js";

let params;

function init(){
    if(!config.dat_gui.enabled)    {
        return
    }


	params = {		stiffness:	0.01, damping:0.05, frictionAir:0.3};
	var gui = new GUI( { width: 300 } );
	gui.add( params, 'stiffness', 0.0001, 1.0 ).onChange(  value => {utils.send("engine",{stiffness:value})} );
	gui.add( params, 'damping', 0.001, 1.0 ).onChange(  value => {utils.send("engine",{damping:value})} );
    gui.add( params, 'frictionAir', 0.0001, 1.0 ).onChange(  value => {utils.send("engine",{frictionAir:value})} ).listen();

    let frictionAir = localStorage.getItem("frictionAir");
    frictionAir = parseFloat(frictionAir).toFixed(4);
    if(frictionAir === null){frictionAir=0.3}
    params.frictionAir = frictionAir;

    //GUI.toggleHide();//TODO with keypress on pc and another way on touch devices
    gui.close();

}

export{init};