import * as graph from "./graph.js";
import * as view from "./view_svg.js";
import * as physics from "./physics_matter.js";
import * as stats from "./stats_app.js";
import * as gui from "./gui_app.js";

import config from "./../config.js";


let pyh_render_div = document.createElement('div');
document.body.appendChild(pyh_render_div);
let main_view_div = document.createElement('div');
document.body.appendChild(main_view_div);

let render_physics = localStorage.getItem("render_physics");
if(render_physics === null){
    render_physics = config.physics.renderer.enabled;
}
else{
    render_physics = (render_physics === "true")?true:false;
}
console.log(`main> render physics = ${render_physics}`);
if(render_physics){
    pyh_render_div.style.cssText = "height:50%";
    main_view_div.style.cssText = "height:50%";
}
else{
    main_view_div.style.cssText = "height:100%";
}

graph.init(render_physics);
view.init(main_view_div);
physics.init(main_view_div,render_physics,pyh_render_div);
stats.init();
gui.init(render_physics);

function animate(){

    stats.begin();
    physics.run();//not only physics but also rendering through events
    stats.end();
    requestAnimationFrame( animate );

}

animate();
