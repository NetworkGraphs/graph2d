import * as app from "./app.js";
import * as view from "./view_svg.js";
import * as move from "./move_matter.js";


app.init();
view.init();
move.init();

function animate(){

    app.run();
    move.run();
    requestAnimationFrame( animate );

}

animate();