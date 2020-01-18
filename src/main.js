import * as app from "./app.js";
import * as view from "./view_svg.js";
import * as physics from "./move_matter.js";

let phy_div = document.createElement('div');
phy_div.style.cssText = "height:50%";
document.body.appendChild(phy_div);
let view_div = document.createElement('div');
view_div.style.cssText = "height:50%";
document.body.appendChild(view_div);

app.init();
view.init(view_div);
physics.init(phy_div);

function animate(){

    physics.run();
    //app.run();
    requestAnimationFrame( animate );

}

animate();