/**
 * 
 * used sent events:
 * - graph_vertex
 */

 import * as utils from "./utils.js";
import config from "../config.js";

function init(){
    const start = Date.now();
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		document.addEventListener(eventName, onDragEvents, false)
	})
    console.log(`app> init() in ${Date.now() - start} ms`);
}

function import_graph(input){
    input.graph.vertices.forEach(vertex =>{
		let width = 100;
		let height = 50;
        utils.send('graph_vertex',{type:'add',id:vertex._id,name:vertex.name,w:width,h:height});
	});
	input.graph.edges.forEach(edge => {
        utils.send('graph_edge',{id:edge._id,label:edge._label,src:edge._outV,dest:edge._inV,weight:edge.weight});
	});
}

function debug_rotation(){
    let el = document.getElementById('g_3');
    if(el != null){
		let p = Math.sin(((Date.now()%1000)/1000)*Math.PI);
		let x = 200+p*200;
		let a = 90*p;
		console.log(`app> x= ${x.toFixed(2)}`);
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

console.log(`graph> from ${window.location.hostname}`);

if(window.location.hostname == "networkgraphs.github.io"){
	fetch('./graph2d/graphs/GraphSON_blueprints.json')
	.then(response => response.json())
	.then(json => import_graph(json))
}
else{
	fetch('./../graphs/GraphSON_blueprints.json')
	.then(response => response.json())
	.then(json => import_graph(json))
}

export{init,run};
