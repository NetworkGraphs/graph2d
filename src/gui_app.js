import { GUI } 				from './../jsm/dat.gui.module.js';
import config from '../config.js';
import * as utils from "./../src/utils.js";

let params;

function init(render_physics){
    if(!config.dat_gui.enabled)    {
        return
    }


	params = {
        "show physics":true,
        "show stats":true,
        stiffness:	0.01,
        damping:0.05,
        frictionAir:0.3
    };
	var gui = new GUI( { width: 300 } );
	gui.add( params, 'show physics').listen().onChange(  value => {utils.send("engine",{render_physics:value})} );
	gui.add( params, 'show stats').listen().onChange(  value => {
                                                                    utils.send("stats",{show:value});
                                                                    localStorage.setItem("show_stats",value);
                                                                } );
	gui.add( params, 'stiffness', 0.0001, 1.0 ).onChange(  value => {utils.send("engine",{stiffness:value})} );
	gui.add( params, 'damping', 0.001, 1.0 ).onChange(  value => {utils.send("engine",{damping:value})} );
    gui.add( params, 'frictionAir', 0.0001, 1.0 ).onChange(  value => {utils.send("engine",{frictionAir:value})} ).listen();

    let frictionAir = localStorage.getItem("frictionAir");
    frictionAir = parseFloat(frictionAir).toFixed(4);
    params.frictionAir = (frictionAir === null)?0.3:frictionAir;

    params["show physics"] = render_physics;

    let show_stats = localStorage.getItem("show_stats");
    params["show stats"] = (show_stats === "true")?true:false;

    //GUI.toggleHide();//TODO with keypress on pc and another way on touch devices
    if(config.dat_gui.closed){
        gui.close();
    }

}

export{init};