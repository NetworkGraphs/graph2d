/**
 * 
 * sent events:
 * - graph_vertex (add_before_edge, add_after_edge) (move) for debug
 * - graph_edge (add)
 * 
 * received events:
 * - drag & drop ('dragenter', 'dragover', 'dragleave', 'drop')
 * 
 */

import * as utils from "./utils.js";
import config from "../config.js";

let graph;
let startup_time;

function init(){
    startup_time = Date.now();
	console.log(`graph> init()`);
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		document.addEventListener(eventName, onDragEvents, false)
	});
	window.addEventListener('graph_edge', onGraphEdge, false);

	fetch('./graphs/GraphSON_blueprints.json')
	.then(response => response.json())
	.then(json => import_graph(json))
	
}

function import_graph(input){
	graph = input.graph;
    graph.vertices.forEach(vertex =>{
        utils.send('graph_vertex',{type:'add_before_edge',id:vertex._id,name:vertex.name,w:100,h:50});
	});
	graph.edges.forEach(edge => {
        utils.send('graph_edge',{type:"add",id:edge._id,label:edge._label,src:edge._outV,dest:edge._inV,weight:edge.weight});
	});
    graph.vertices.forEach(vertex =>{
        utils.send('graph_vertex',{type:'add_after_edge',id:vertex._id,name:vertex.name,w:100,h:50});
	});
	console.log(`graph> init() : import_graph() + graph_events() after ${Date.now() - startup_time} ms`);
}

function onGraphEdge(e){
	if(e.detail.type == "refresh_all"){
		graph.edges.forEach(edge => {
			utils.send('graph_edge',{type:"refresh",id:edge._id,label:edge._label,src:edge._outV,dest:edge._inV,weight:edge.weight});
		});
		}
}

function debug_rotation(){
    let el = document.getElementById('g_3');
    if(el != null){
		let p = Math.sin(((Date.now()%1000)/1000)*Math.PI);
		let x = 200+p*200;
		let a = 90*p;
		console.log(`graph> x= ${x.toFixed(2)}`);
		utils.send('graph_vertex',{type:'move',id:3,x:x,y:100, a:a});
		utils.send('graph_vertex',{type:'move',id:4,x:x,y:100, a:-a});
    }
}

function run(){
	if(config.app.debug_rotation){
		debug_rotation();
	}
}

function onDragEvents(event){
	event.stopPropagation();
	event.preventDefault();
	if(event.type == "dragenter"){
		event.dataTransfer.dropEffect = "copy";
	}
	if(event.type == "drop"){
		if(event.dataTransfer.files.length != 1){
			alert("only one file allowed");
            console.log(event.dataTransfer.files);
			return;
		}
		if(event.dataTransfer.files[0].type != "application/json"){
            alert(`only json files allowed not '${event.dataTransfer.files[0].type}'`);
            console.log(event.dataTransfer.files);
			return;
		}
		var reader = new FileReader();
		reader.onloadend = function(e) {
		var result = JSON.parse(this.result);
        console.log(result);
        import_graph(result);
	  };
	  reader.readAsText(event.dataTransfer.files[0]);
	}
}

export{init};
