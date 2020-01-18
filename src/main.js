import * as graph from "./graph.js";
import * as view from "./view_svg.js";
import * as physics from "./physics_matter.js";

import config from "./../config.js";


let pyh_render_div = document.createElement('div');
document.body.appendChild(pyh_render_div);
let main_view_div = document.createElement('div');
document.body.appendChild(main_view_div);

if(config.physics.renderer.enabled){
    pyh_render_div.style.cssText = "height:50%";
    main_view_div.style.cssText = "height:50%";
}
else{
    main_view_div.style.cssText = "height:100%";
}

graph.init();
view.init(main_view_div);
physics.init(main_view_div,pyh_render_div);

function animate(){

    physics.run();
    graph.run();
    requestAnimationFrame( animate );

}

animate();