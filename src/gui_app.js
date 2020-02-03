import { GUI } 				from './../jsm/dat.gui.module.js';
import config from '../config.js';
import * as utils from "./../src/utils.js";

let gui;
let params;

function setup_gui(params){
    let gui = new GUI( { width:config["user.gui"].width, load:params} );
	gui.add( params, 'show physics').listen().onChange(              value => {utils.send("params",{'show physics':value})});
	gui.add( params, 'show stats').listen().onChange(                value => {utils.send("params",{'show stats':value});} );
	gui.add( params, 'edges',['line','polyline']).onChange(          value => {utils.send("params",{'edges':value});} );
	gui.add( params, 'stiffness', 0.0001, 1.0 ).onChange(            value => {utils.send("params",{stiffness:value})} );
	gui.add( params, 'damping', 0.001, 1.0 ).onChange(               value => {utils.send("params",{damping:value})} );
    gui.add( params, 'frictionAir', 0.0001, 1.0 ).listen().onChange( value => {utils.send("params",{frictionAir:value})} );
    gui.addColor( params, 'VertexColor').onFinishChange(             value => {utils.send("params",{VertexColor:value})});
    gui.addColor( params, 'VertexHighlight');
	gui.add( params, 'graph',['GraphSON_blueprints.json','GraphSON_Tinker.json','LesMiserables.graphml']).onChange(          value => {utils.send("params",{'graph':value});} );
    gui.add( params, 'save');
    gui.add( params, 'reset');
    return gui;
}

function init_params(reset=false){
    let params;
    if(reset){
        params = config["user.gui"];
    }
    else{
        let params_text = localStorage.getItem("params");
        if(params_text === null){
            params = config["user.gui"];
        }
        else{
            params = JSON.parse(params_text);
        }
    }
    params.save = ()=>{localStorage.setItem("params",JSON.stringify(params))};
    params.reset = ()=>{params = init_params(true);gui.destroy();gui = setup_gui(params)};
    return params;
}

function init(){

    params = init_params(!config.system.dat_gui.enabled);

    if(!config.system.dat_gui.enabled)    {
        return
    }

    gui = setup_gui(params);

    if(config.system.dat_gui.closed){
        gui.close();
    }

}

export{init,params};


let exp = {
    "show physics": true,
    "show stats": true,
    "stiffness": 0.01,
    "damping": 0.05,
    "frictionAir": 0.3,
    "closed": false,
    "remembered": {
      "undefined": {
        "0": {
          "show physics": true,
          "show stats": true,
          "stiffness": 0.01,
          "damping": 0.05,
          "frictionAir": 0.3
        }
      }
    },
    "folders": {}
  };
