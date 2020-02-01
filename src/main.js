import * as graph from "./graph.js";
import * as view from "./view_svg.js";
import * as physics from "./physics_matter.js";
import * as stats from "./stats_app.js";
import * as dat from "./gui_app.js";
import * as mouse from "./mouse_move.js";


let svg_div = document.createElement('div');
svg_div.setAttribute("id","svg_div");
document.body.appendChild(svg_div);


let pyh_render_div = document.createElement('div');
document.body.appendChild(pyh_render_div);
let main_view_div = document.createElement('div');
document.body.appendChild(main_view_div);

dat.init();

if(dat.params["show physics"]){
    pyh_render_div.style.cssText = "height:50%";
    main_view_div.style.cssText = "height:50%";
}
else{
    main_view_div.style.cssText = "height:100%";
}

graph.init(dat.params["show physics"]);
view.init(main_view_div);
physics.init(main_view_div,dat.params["show physics"],pyh_render_div);
stats.init(dat.params["show stats"]);
mouse.init();

function animate(){

    stats.begin();
    physics.run();//not only physics but also rendering through events
    stats.end();
    requestAnimationFrame( animate );

}

animate();
