
let draw,rect;

function init(){

    draw = SVG().addTo('body').size('100%', '100%');
    //rect = draw.rect(100, 100).move(50, 60).attr({ fill: '#00af06' });
    //var text = draw.text("Lorem ipsum dolor sit amet consectetur.\nCras sodales imperdiet auctor.");
    //text.move(200,200);
    //run();
    //animate();

	['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
		document.addEventListener(eventName, onDragEvents, false)
	})

    
}

function add_vertex(name){
    let width = 100;
    let height = 50;
    let x = width/2 +  Math.round((window.innerWidth-width) * Math.random());
    let y = height/2 + Math.round((window.innerHeight-height) * Math.random());
    //console.log(`added at ${x},${y}`);
    let vert = draw.rect(width,height).move(x-width/2,y-height/2).attr({ fill: '#00af06' });
    let text = draw.text(name);
    text.move(x-text.bbox().width/2,y-text.bbox().height/2);
}

function import_graph(input){

    input.graph.vertices.forEach(vertex =>{
        add_vertex(vertex.name);
    })

}

function run(){
    let x = 100*Math.sin(((Date.now()%1000)/1000)*Math.PI);
    rect.move(200+x,100);
}

function animate(){

    run();
    requestAnimationFrame( animate );

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


init();