/**
 * 
 * used sent events:
 * - view_vertex
 */

 import * as utils from "./utils.js";

function init(){
    const start = Date.now();
	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		document.addEventListener(eventName, onDragEvents, false)
	})
    console.log(`app> init() in ${Date.now() - start} ms`);
    //animate();
}

function import_graph(input){
    input.graph.vertices.forEach(vertex =>{
        utils.send('view_vertex',{type:'add',id:vertex._id,name:vertex.name});
    })
}

function run(){
    //rect.move(200+x,100);
    let el = document.getElementById('g_3');
    if(el != null){
        let x = 100*Math.sin(((Date.now()%1000)/1000)*Math.PI);
        utils.send('view_vertex',{type:'move',id:3,x:200+x,y:100});
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

fetch('./../graphs/GraphSON_blueprints.json')
   .then(response => response.json())
   .then(json => import_graph(json))

export{init,run};
