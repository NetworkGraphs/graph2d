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

let mg;
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
			import_graph_file(event.dataTransfer.files[0]);
		};
	}

	function onGraphEdge(e){
		if(e.detail.type == "refresh_all"){
			for(let [eid,edge] of Object.entries(mg.edges)){
				utils.send('graph_edge',{type:"refresh",id:eid,label:edge.label,src:edge.outV,dest:edge.inV,weight:edge.weight});
			}
		}
	}

	function onGraphVertex(e){
		if(e.detail.type == 'hover'){
			if(e.detail.start){
				console.log(`graph> hover on (${e.detail.id})`);
				console.log(`graph> hover on (${e.detail.id}) ${mg.vertices[e.detail.id].label}`);
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
		for(let vid in mg.vertices){
			utils.send('graph_vertex',{type:'update',id:vid,w:v.width,h:v.height,s:scale});
		}
	}

	function onParams(e){
		if(e.type == "params"){
			if(typeof(e.detail.graph) != "undefined"){
				console.log(`graph> user request to set graph (${e.detail.graph})`);
				import_graph_file(`./graphs/${e.detail.graph}`);
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

	function add_neighbors(graph){
		for(let [vid,v] of Object.entries(graph.vertices)){
			v.neighbors = new Set();
			v.in_neighbors = new Set();
			v.out_neighbors = new Set();
			v.edges = new Set();
			for(let [eid,e] of Object.entries(graph.edges)){
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
		add_neighbors(res);
		return res;
	}

	function import_graph_file(file){
		if(typeof(file) == "string"){
			let extension = file.split('.').pop();
			if(extension == "json"){
				fetch(file)
				.then(response => response.json())
				.then(json => import_json_graph(json))
			}
			else if(extension == "graphml"){
				fetch(file)
				.then(response => response.text())
				.then(text => import_xml_graph(text))
			}
		}
		else{
			let extension = file.name.split('.').pop();
			var reader = new FileReader();
			if(extension == "json"){
				reader.onloadend = function(e) {
					var result = JSON.parse(this.result);
					import_json_graph(result);
				};
			}else if(extension == "graphml"){
				reader.onloadend = function(e) {
					import_xml_graph(this.result);
				};
			}
			else{
				alert(`unsupported graph format '${extension}'`);
			}
			reader.readAsText(file);
		}
	}

	function import_json_graph(input){
		//    ----    support both graph structures    ----
		let graph = {};
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
		send_graph_events(mg);

		console.log(`graph> init() : import_json_graph() + graph_events() after ${Date.now() - startup_time} ms`);
	}

	function element_to_map(element){
		let res = {};
		for(let j = 0; j < element.attributes.length; j++){
			let attribute = element.attributes[j];
			if(attribute.name != "id"){
				res[attribute.name] = attribute.value;
			}
		}
		let data = element.getElementsByTagName("data");
		for(let j = 0; j < data.length; j++){
			let key = data[j].getAttribute("key");
			let value = data[j].textContent;
			res[key] = value;
		}
	return res;
	}

	function replace(element,old,rep){
		if(typeof(element[old]) != "undefined"){
			element[rep] = element[old];
			delete element[old];
		}
	}

	function import_xml_graph(input){
		let parser = new DOMParser();
		let xmlDoc = parser.parseFromString(input,"text/xml");
		
		mg = {};
		mg.vertices = {};
		mg.edges = {};
		let verticesNodes = xmlDoc.getElementsByTagName("node");
		console.log(`graph> graphml file has ${verticesNodes.length} vertices`);
		if(verticesNodes.length == 0){
			alert("no vertices (nodes) found in graphml");
			return;
		}
		for(let i = 0; i < verticesNodes.length; i++){
			let v_node = verticesNodes[i];
			let vid = v_node.getAttribute("id");
			mg.vertices[vid] = element_to_map(v_node);
		}
		let edgeNodes = xmlDoc.getElementsByTagName("edge");
		console.log(`graph> graphml file has ${edgeNodes.length} edges`);
		for(let i = 0; i < edgeNodes.length; i++){
			let e_node = edgeNodes[i];
			let eid = e_node.getAttribute("id");
			let edge = element_to_map(e_node);
			replace(edge,"source","outV");
			replace(edge,"target","inV");
			mg.edges[eid] = edge;
		}
		add_neighbors(mg);
		console.log(mg);
		send_graph_events(mg);
	}
//    ----    Utils ----

	function send_graph_events(mgraph){
		let max_width = check_text_width(mgraph);
		v.set_width(max_width + 20);
		console.log(`text max width = ${max_width}`);

		//    ----    send events    ----
		utils.send('graph',{action:'clear'});
		for(let [vid,vertex] of Object.entries(mgraph.vertices)){
			utils.send('graph_vertex',{type:'add_before_edge',id:vid,label:vertex.label,w:v.width,h:v.height});
		}
		for(let [eid,edge] of Object.entries(mgraph.edges)){
			utils.send('graph_edge',{type:"add",id:eid,label:edge.label,src:edge.outV,dest:edge.inV,weight:edge.weight});
		}
		for(let [vid,vertex] of Object.entries(mgraph.vertices)){
			utils.send('graph_vertex',{type:'add_after_edge',id:vid,label:vertex.label,w:v.width,h:v.height});
		}
	}

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
