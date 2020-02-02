import config from "./../config.js";

let stats1,stats2;
let is_stats = false;

function init(is_show){
    window.addEventListener( 'params', onStats, false );
    if(!is_show){
        return
    }
	stats1 = new Stats();
	stats1.domElement.style.cssText = 'position:absolute;top:0px;left:0px;';
    document.body.appendChild(stats1.domElement);

	stats2 = new Stats();
	stats2.domElement.style.cssText = 'position:absolute;top:0px;left:80px;';
	document.body.appendChild(stats2.domElement);

    console.log(`stats> init()`);
    set_view(is_show);

}

function set_view(l_view){
	is_stats = l_view;
	if(is_stats){
		stats1.showPanel(0); // Panel 0 = fps
		stats2.showPanel(1); // Panel 1 = ms
	}
	else{
		stats1.showPanel();
		stats2.showPanel();
    }
}

function begin(){
    if(!is_stats){
        return
    }
    stats1.begin();
    stats2.begin();
}

function end(){
    if(!is_stats){
        return
    }
    stats1.end();
    stats2.end();
}

function onStats(e){
    let show = e.detail["show stats"];
    if(typeof(show) != "undefined"){
        console.log(show);
        if(typeof(stats1) == "undefined"){
            init(show);
        }
        set_view(show);
    }
}

export{init, set_view, begin, end};
