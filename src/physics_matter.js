/**
 * exported functions:
 * - init
 * - run
 * 
 * sent events:
 * - graph_vertex   (move)
 * - graph_edge     (refresh_all)
 *
 * received events:
 * - resize
 * - graph_vertex   (add_before_edge, hover)
 * - graph_edge     (add)
 * - engine         (stiffness, damping)
 * - graph (clear)
 *
 * engine -> world -> bodies
 *                 -> constraints
 * renderer -> engine
 * 
 */

import * as utils from "./../src/utils.js";
import config from "./../config.js";
import * as dat from "./gui_app.js";

let phy = config.system.physics;

let engine;
let bm;//bodies map
let hover = {active:false, center:0};
let renderer;
//lineto renderer objects
let canvas,context;
let physics_element;
let render_physics;
let mouseConstraint;
let forces = {
    neighb_start_push:150, 
    neighb_start_attract:250,
    non_neighb_push:300
};

function init(phy_el,rend_phy,render_element){
    physics_element = phy_el;
    render_physics = rend_phy;
    const start = Date.now();
    engine = Matter.Engine.create({enableSleeping:true});
    engine.world.gravity.y = config.system.physics.gravity;
    
    //console.log(`phy> element width = ${physics_element.offsetWidth} ; height = ${physics_element.offsetHeight}`);
    let ground = Matter.Bodies.rectangle(0, physics_element.offsetHeight, physics_element.offsetWidth*2, 20, { id:"obst0" ,label:"ground",isStatic: true ,isvertex:false});
    let ceiling = Matter.Bodies.rectangle(0, 0, physics_element.offsetWidth*2, 20, { id:"obst1" ,label:"ceiling",isStatic: true ,isvertex:false});
    let wall_left = Matter.Bodies.rectangle(0, 0, 20, physics_element.offsetHeight*2, { id:"obst2" ,label:"wall_left",isStatic: true ,isvertex:false});
    //let wall_right = Matter.Bodies.rectangle(physics_element.offsetWidth-20, 0, physics_element.offsetHeight*2-20, physics_element.offsetHeight*2, { id:"obst3" ,label:"wall_right",isStatic: true ,isvertex:false});
    Matter.World.add(engine.world,[ground,ceiling,wall_left]);

    window.addEventListener( 'resize', onResize, false );
    window.addEventListener( 'graph_vertex', onMatterVertex, false );
    window.addEventListener( 'graph_edge', onMatterEdge, false );
    window.addEventListener( 'graph', onGraph, false );
    window.addEventListener( 'engine', onEngine, false );

    if(render_physics){
        if(config.system.physics.renderer.type_lineto){
            canvas = document.createElement('canvas');
            context = canvas.getContext('2d');
            canvas.width = physics_element.offsetWidth;
            canvas.height = physics_element.offsetHeight;
            render_element.appendChild(canvas);
        }
        if(dat.params["show physics"]){
            renderer = Matter.Render.create({
                element: render_element,
                engine: engine,
                options: {
                    width: render_element.offsetWidth,
                    height: render_element.offsetHeight,
                    showAngleIndicator: false,
                    showVelocity: true,
                    showBounds: true,
                    showBroadphase: true,
                    showAxes: true,
                    showIds: true,
                    showCollisions: true,
                    showSleeping:true,
                    showDebug:false,
                    wireframes: true,
                    constraintIterations:config.system.physics.simulation.constraintIterations
                    //constraintIterations default = 2
                    //positionIterations default = 6
                    //velocityIterations default = 4
                }
            });
        }
    }

    if(config.system.physics.move_objects_with_mouse){
        let mouse = Matter.Mouse.create(physics_element);
            mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                angularStiffness: 0.1,
                render: {
                    visible: true
                }
            }
        });

        Matter.World.add(engine.world, mouseConstraint);

    }
    console.log(`phy> init() in ${Date.now() - start} ms`);
}

function render_lineto(engine, context){
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.beginPath();

    engine.world.bodies.forEach(body => {
        var vertices = body.vertices;
        context.moveTo(vertices[0].x, vertices[0].y);
        for (var j = 1; j < vertices.length; j += 1) {
            context.lineTo(vertices[j].x, vertices[j].y);
        }
        context.lineTo(vertices[0].x, vertices[0].y);
    });

    context.lineWidth = 1;
    context.strokeStyle = '#999';
    context.stroke();    
}

function keep_vertices_horizontal(){
    engine.world.bodies.forEach(body => {
        if(body.isvertex){
            const delta = 0 - body.angle;
            body.torque = 0.5 * delta;//P controller, the air friction will do the rest
        }
    });
}

function center_bring_neighbors(){
    if(!hover.active){
        return;
    }
    engine.world.bodies.forEach(body => {
        if(body.is_force_neighbors && !body.is_center){
            const center_body = bm[body.has_center];
            const diff = Matter.Vector.sub(center_body.position, body.position);
            const distance = Matter.Vector.magnitude(diff);
            if(distance < forces.neighb_start_push){
                const direction = Matter.Vector.normalise(diff);
                body.force = Matter.Vector.mult(direction,-0.05);
            }
            if(distance > forces.neighb_start_attract){
                const direction = Matter.Vector.normalise(diff);
                body.force = Matter.Vector.mult(direction,0.05);
            }
        }
    });
}

function center_push_non_neighbors(){
    if(!hover.active){
        return;
    }
    engine.world.bodies.forEach(body => {
        if(!body.is_force_neighbors){
            const center_body = bm[hover.center];
            const diff = Matter.Vector.sub(center_body.position, body.position);
            const distance = Matter.Vector.magnitude(diff);
            if(distance < forces.non_neighb_push){
                const direction = Matter.Vector.normalise(diff);
                body.force = Matter.Vector.mult(direction,-0.02);
            }
        }
    });
}

function apply_custom_forces(){
    keep_vertices_horizontal();
    center_bring_neighbors();
    center_push_non_neighbors();
}

function vertex_hover(d){
    const body = bm[d.id];
    //console.log(`phy> updating ${body.label}`);
    body.is_force_neighbors = d.start;
    hover.active = d.start;
    body.is_center = d.center;
    if(!d.center){
        body.has_center = d.cid;
        hover.center = d.cid;
    }
}

let last_run = 0;
let last_delta = 0;

function get_delta_correction(){
    let delta = 1000/60;            //used as default for first interations only
    let correction = 1.0;           //used as default for first interations only
    const max_cpu_ms = 100;         //used to filter page sleep in the background 100 => 1000/100 = 10 fps
    if(last_run == 0){              //first run -> no delta, no correction
        const this_run = Date.now();
        last_run = this_run;
    }
    else{
        if(last_delta == 0){        //second run -> first delta but no correction yet
            const this_run = Date.now();
            delta = this_run - last_run;
            if(delta > max_cpu_ms){        //avoids instabilities after pause (window in background) or with slow cpu
                delta = max_cpu_ms;
            }
            last_run = this_run;
            last_delta = delta;
        }
        else{                       //run > 2 => delta + correction
            const this_run = Date.now();
            delta = this_run - last_run;
            if(delta > max_cpu_ms){        //avoids instabilities after pause (window in background) or with slow cpu
                delta = max_cpu_ms;
            }
            correction = delta / last_delta;
            //console.log(`phy> delta: ${delta}, last_delta:${last_delta} , correction: ${correction}`);
            last_run = this_run;
            last_delta = delta;
        }
    }
    return {delta:delta, correction:correction};
}

function run(){
    let any_vertex_to_move = false;

    apply_custom_forces();

    const{delta,correction} = get_delta_correction();
    Matter.Engine.update(engine,delta,correction);

    engine.world.bodies.forEach(body => {
        if(body.isvertex){
            utils.send('graph_vertex',{type:'move',id:body.id,x:body.position.x,y:body.position.y,a:180*body.angle / Math.PI});
            any_vertex_to_move = true;
        }
    });

    if(any_vertex_to_move){
        utils.send('graph_edge',{type:'refresh_all'});
    }
    if(render_physics){
        if(config.system.physics.renderer.type_lineto){
            render_lineto(engine,context);
        }
        if(dat.params["show physics"]){
            Matter.Render.world(renderer);
        }
    }
}

function vertex_add(params){
    let x = params.w/2 +  Math.round((physics_element.offsetWidth-params.w) * Math.random());
    let y = params.h/2 + Math.round((physics_element.offsetHeight-2*params.h) * Math.random());
    let body = Matter.Bodies.rectangle(x,y,params.w,params.h,{id:params.id,label:params.label ,isvertex:true,mass:phy.body.mass});
    body.frictionAir = 0.3;
    body.is_force_neighbors = false;
    body.is_center = false;
    //console.log(`phy> ${params.label} has frictionAir at ${frictionAir}`);
    Matter.World.addBody(engine.world,body);
    if(typeof(bm) == "undefined"){
        bm = new Map();
    }
    bm[params.id] = body;
    if(params.id == 3){
        console.log(`density = ${body.density}, mass = ${body.mass}, inertia = ${body.inertia}`);
    }
}

function vertex_update(d){
    let body = bm[d.id];
    //Matter.Body.scale(body,d.scale,d.scale);// scale result in body x,y and all Vertices x,y to NaN
    Matter.World.remove(engine.world,body);
    let new_body = Matter.Bodies.rectangle(body.position.x,body.position.y,d.w,d.h,{id:body.id,label:body.label ,isvertex:true,mass:phy.body.mass});
    new_body.frictionAir = dat.params.frictionAir;
    new_body.is_force_neighbors = body.is_force_neighbors;
    new_body.is_center = body.is_center;
    new_body.has_center = body.has_center;

    Matter.World.addBody(engine.world,new_body);
    bm[d.id] = null;//shall be garbage collected
    bm[d.id] = new_body;

    forces.neighb_start_push = d.w + d.h;
    forces.neighb_start_attract = 2*d.w + d.h;
    forces.non_neighb_push = 3 * d.w;
    //console.log(`f neighb_start_push = ${forces.neighb_start_push}, f neighb_start_attract = ${forces.neighb_start_attract}`);
    //console.log(`density = ${new_body.density}, mass = ${new_body.mass}, inertia = ${new_body.inertia}`);
}

function onMatterVertex(e){
    const d = e.detail;
    if(d.type == 'add_before_edge'){
        vertex_add(d);
    }
    if(d.type == 'hover'){
        vertex_hover(d);
    }
    if(d.type == 'update'){
        vertex_update(d);
    }
}

function edge_add(params){
    //console.log(`phy> should add edge from ${params.src} to ${params.dest}`);
    let b_1 = engine.world.bodies.find(body => (body.id == params.src));
    let b_2 = engine.world.bodies.find(body => (body.id == params.dest));
    //console.log(`phy> added edge from '${b_1.label}' to '${b_2.label}' with weight (${params.weight.toFixed(2)})`);

    return;
    
    let length = 120;
    if(params.weight != 0){//weight of 0 means no edge constraint
        length = 120/params.weight;
        if(length > 400){
            length = 400;
        }
        var constraint = Matter.Constraint.create({
            bodyA: b_1,
            bodyB: b_2,
            length:length,
            stiffness: 0.01,
            damping: 0.05
        });
        //Matter.World.addConstraint(engine.world,constraint);
    }
}

function graph_clear(){
    Matter.World.clear(engine.world,true);
    if(config.system.physics.move_objects_with_mouse){
        Matter.World.add(engine.world, mouseConstraint);
    }
    bm = new Map();
}

function onMatterEdge(e){
    if(e.detail.type == "add"){
        edge_add(e.detail);
    }
}

function onResize(e){
}

function onEngine(e){
    if(typeof(e.detail.stiffness) != "undefined"){
        engine.world.constraints.forEach(constraint => {constraint.stiffness = e.detail.stiffness;});
    }
    if(typeof(e.detail.damping) != "undefined"){
        engine.world.constraints.forEach(constraint => {constraint.damping = e.detail.damping;});
    }
    if(typeof(e.detail.frictionAir) != "undefined"){
        engine.world.bodies.forEach(body => {body.frictionAir = e.detail.frictionAir;});
        localStorage.setItem("frictionAir",e.detail.frictionAir);
    }
    if(typeof(e.detail.render_physics) != "undefined"){
        console.log(`phy> render physics = ${e.detail.render_physics}`);
        localStorage.setItem("render_physics",e.detail.render_physics);

    }
}

function onGraph(e){
    if(typeof(e.detail.action) != "undefined"){
        graph_clear();
    }
}

export{init,run};
