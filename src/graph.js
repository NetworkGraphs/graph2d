/**
 * 
 * sent events:
 * - graph_vertex (add_before_edge, add_after_edge, hover)
 * - graph_edge (add, hover)
 * 
 * received events:
 * - drag & drop ('dragenter', 'dragover', 'dragleave', 'drop')
 * - graph_edge (refresh_all)
 * - graph_mouse (hover)
 * - wheel
 * - params (graph)
 * 
 */

import * as utils from "./utils.js";
import config from "../config.js";

class shape {
    constructor(width, height,round) {
      this.height = height;
      this.width = width;
      this.round = round;
      this.ratio = this.width / this.height;
    }
    set_width(w){
        this.width = w;
        this.ratio = this.width / this.height;
        this.round_ratio = this.round / this.width;
    }
    set_height(w){
        this.height = h;
        this.ratio = this.width / this.height;
        this.round_ratio = this.round / this.width;
    }
    increase(ratio){
        this.width = this.width * ratio;
        this.height = this.height * ratio;
        this.round = this.height * this.round_ratio;
    }
    decrease(ratio){
        this.width = this.width / ratio;
        this.height = this.height / ratio;
        this.round = this.height * this.round_ratio;
    }
};

let graph,mg;
let startup_time;

let v = new shape(100,50);

function init(){
    startup_time = Date.now();
	console.log(`graph> init()`);
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		document.addEventListener(eventName, onDragEvents, false)
	});
	window.addEventListener('graph_edge', onGraphEdge, false);
	window.addEventListener('graph_mouse', onGraphVertex, false);
    window.addEventListener( 'wheel', onWheel, false );
    window.addEventListener( 'params', onParams, false );

	import_graph_file('./graphs/GraphSON_blueprints.json');
	
}

//    ----    Events    ----

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

	function onGraphEdge(e){
		if(e.detail.type == "refresh_all"){
			graph.edges.forEach(edge => {
				utils.send('graph_edge',{type:"refresh",id:edge.id,label:edge.label,src:edge.outV,dest:edge.inV,weight:edge.weight});
			});
			}
	}

	function onGraphVertex(e){
		if(e.detail.type == 'hover'){
			if(e.detail.start){
				console.log(`graph> hover on ${mg.vertices[e.detail.id].label}`);
			}
			utils.send('graph_vertex',{type:'hover',id:e.detail.id,start:e.detail.start,center:true});
			for(let id of mg.vertices[e.detail.id].neighbors){
				//console.log(`graph> ${mg.vertices[e.detail.id].label} <= ${mg.vertices[id].label}`);
				utils.send('graph_vertex',{type:'hover',id:id,start:e.detail.start,center:false,cid:e.detail.id});
			}
			for(let id of mg.vertices[e.detail.id].edges){
				//console.log(`graph> ${mg.vertices[e.detail.id].label} <= ${mg.vertices[id].label}`);
				utils.send('graph_edge',{type:'hover',id:id,start:e.detail.start});
			}
		}
	}

	function onWheel(e){
		//console.log(e.deltaY);
		let scale_step = config.system.view.scale_ratio;
		let scale;
		if(e.deltaY > 0){
			v.decrease(scale_step);
			scale = 1/scale_step;
		}else if (e.deltaY < 0){
			v.increase(scale_step);
			scale = scale_step;
		}
		graph.vertices.forEach(vertex =>{
			utils.send('graph_vertex',{type:'update',id:vertex.id,w:v.width,h:v.height,s:scale});
		});
	}

	function onParams(e){
		if(e.type == "params"){
			if(typeof(e.detail.graph) != "undefined"){
				console.log(`graph> user request to set graph (${e.detail.graph})`);
				import_graph_file(`./graphs/${e.detail.graph}.json`);
			}
		}
	}

//    ----    Import    ----

	function import_vertex(vertex){
		let res = vertex;
		res.label = (typeof(vertex.label) != "undefined")?vertex.label:vertex.name;
		res.id = (typeof(vertex.id) != "undefined")?vertex.id:vertex._id;
		return res;
	}

	function import_edge(edge){
		let res = edge;
		res.label = (typeof(edge.label) != "undefined")?edge.label:edge.name;
		res.id = (typeof(edge.id) != "undefined")?edge.id:edge._id;
		res.inV = (typeof(edge.inV) != "undefined")?edge.inV:edge._inV;
		res.outV = (typeof(edge.outV) != "undefined")?edge.outV:edge._outV;
		res.weight = (typeof(edge.weight) != "undefined")?edge.weight:1;
		return res;
	}

	function import_to_map_graph(graph){
		let res = {};
		res.vertices = new Map();
		graph.vertices.forEach(vertex => {
			res.vertices.set(vertex.id,vertex);
		});
		res.edges = new Map();
		graph.edges.forEach(edge => {
			res.edges.set(edge.id,edge);
		});
		for(let [vid,v] of Object.entries(res.vertices)){
			v.neighbors = new Set();
			v.in_neighbors = new Set();
			v.out_neighbors = new Set();
			v.edges = new Set();
			for(let [eid,e] of Object.entries(res.edges)){
					if(e.inV == vid){
						v.in_neighbors.add(e.outV);
						v.neighbors.add(e.outV);
						v.edges.add(eid);
					}
					if(e.outV == vid){
						v.out_neighbors.add(e.inV);
						v.neighbors.add(e.inV);
						v.edges.add(eid);
					}
				}
			res.vertices.set(vid,v);
		}
		return res;
	}

	function import_to_obj_graph(graph){
		let res = {};
		res.vertices = {};
		graph.vertices.forEach(vertex => {
			res.vertices[vertex.id]=vertex;
		});
		res.edges = {};
		graph.edges.forEach(edge => {
			res.edges[edge.id]=edge;
		});
		for(let [vid,v] of Object.entries(res.vertices)){
			v.neighbors = new Set();
			v.in_neighbors = new Set();
			v.out_neighbors = new Set();
			v.edges = new Set();
			for(let [eid,e] of Object.entries(res.edges)){
					if(e.inV == vid){
						v.in_neighbors.add(e.outV);
						v.neighbors.add(e.outV);
						v.edges.add(eid);
					}
					if(e.outV == vid){
						v.out_neighbors.add(e.inV);
						v.neighbors.add(e.inV);
						v.edges.add(eid);
					}
				}
		}
		return res;
	}

	function import_graph_file(file){
		fetch(file)
		.then(response => response.json())
		.then(json => import_graph(json))
	}

	function import_graph(input){
		//    ----    support both graph structures    ----
		if(typeof(input.graph) != "undefined"){
			graph = input.graph;
		}
		else{
			if(typeof(input.vertices) != "undefined"){
				graph.vertices = input.vertices;
				graph.edges = input.edges;
			}
		}
		//    ----    Unify parameters names    ----
		graph.vertices.forEach(vertex =>{
			vertex = import_vertex(vertex);
		});
		graph.edges.forEach(edge => {
			edge = import_edge(edge);
		});
		mg = import_to_obj_graph(graph);

		let max_width = check_text_width(mg);
		v.set_width(max_width + 20);
		console.log(`text max width = ${max_width}`);

		//    ----    send events    ----
		utils.send('graph',{action:'clear'});
		graph.vertices.forEach(vertex =>{
			utils.send('graph_vertex',{type:'add_before_edge',id:vertex.id,label:vertex.label,w:v.width,h:v.height});
		});
		graph.edges.forEach(edge => {
			utils.send('graph_edge',{type:"add",id:edge.id,label:edge.label,src:edge.outV,dest:edge.inV,weight:edge.weight});
		});
		graph.vertices.forEach(vertex =>{
			utils.send('graph_vertex',{type:'add_after_edge',id:vertex.id,label:vertex.label,w:v.width,h:v.height});
		});


		console.log(`graph> init() : import_graph() + graph_events() after ${Date.now() - startup_time} ms`);
	}

//    ----    Utils ----

	function check_text_width(mgraph){
		let res = 0;
		let test = document.createElement("canvas");
		var ctx = test.getContext("2d");
		ctx.font = "20px Arial";

		for(let [vid,vertex] of Object.entries(mgraph.vertices)){
			let text_width = ctx.measureText(vertex.label).width;
			//console.log(`graph> ${text_width} : ${vertex.label}`);
			if(text_width > res){
				res = text_width;
				//console.log(`graph> Higher :: ${res} : ${vertex.label}`);
			}
		}
		return res;
	}

export{init};
