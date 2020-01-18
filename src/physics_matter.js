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
 * - graph_vertex   (add)
 * - graph_edge     (add)
 *
 * engine -> world -> bodies
 * renderer -> engine
 * 
 */

import * as utils from "./../src/utils.js";
import config from "./../config.js";

let engine;
let renderer;
//lineto renderer objects
let canvas,context;
let physics_element;

function init(phy_el,render_element){
    physics_element = phy_el;
    const start = Date.now();
    engine = Matter.Engine.create({enableSleeping:true});
    engine.world.gravity.y = config.physics.gravity;
    console.log(`phy> element width = ${physics_element.offsetWidth} ; height = ${physics_element.offsetHeight}`);
    let ground = Matter.Bodies.rectangle(0, physics_element.offsetHeight, physics_element.offsetWidth*2, 20, { id:"obst0" ,label:"ground",isStatic: true ,isvertex:false});
    let ceiling = Matter.Bodies.rectangle(0, 0, physics_element.offsetWidth*2, 20, { id:"obst1" ,label:"ceiling",isStatic: true ,isvertex:false});
    Matter.World.add(engine.world,[ground,ceiling]);

    window.addEventListener( 'resize', onResize, false );
    window.addEventListener( 'graph_vertex', onMatterVertex, false );
    window.addEventListener( 'graph_edge', onMatterEdge, false );

    if(config.physics.renderer.type_lineto){
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
        canvas.width = physics_element.offsetWidth;
        canvas.height = physics_element.offsetHeight;
        render_element.appendChild(canvas);
    }
    if(config.physics.renderer.type_native){
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
                constraintIterations:config.physics.simulation.constraintIterations
                //constraintIterations default = 2
                //positionIterations default = 6
                //velocityIterations default = 4
            }
        });
    }

    if(config.physics.move_objects_with_mouse){
        let mouse = Matter.Mouse.create(physics_element);
        let mouseConstraint = Matter.MouseConstraint.create(engine, {
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
    console.log(`move_matter> init() in ${Date.now() - start} ms`);
}

function render_lineto(engine, context){
    let bodies = Matter.Composite.allBodies(engine.world);
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.beginPath();

    for (var i = 0; i < bodies.length; i += 1) {
        var vertices = bodies[i].vertices;

        context.moveTo(vertices[0].x, vertices[0].y);

        for (var j = 1; j < vertices.length; j += 1) {
            context.lineTo(vertices[j].x, vertices[j].y);
        }

        context.lineTo(vertices[0].x, vertices[0].y);
    }

    context.lineWidth = 1;
    context.strokeStyle = '#999';
    context.stroke();    
}

function run(){
    let any_vertex_moved = false;
    if(engine.world.bodies.length > 1){
        Matter.Engine.update(engine,1000/60);
        engine.world.bodies.forEach(body => {
            //if(body.id == 3){console.log(`phy> x= ${body.position.x.toFixed(2)} , y = ${body.position.y.toFixed(2)} , a = ${body.angle.toFixed(2)}`);}
            if(body.isvertex){
                utils.send('graph_vertex',{type:'move',id:body.id,x:body.position.x,y:body.position.y,a:180*body.angle / Math.PI});
                any_vertex_moved = true;
            }
        });
    }
    if(any_vertex_moved){
        utils.send('graph_edge',{type:'refresh_all'});
    }
    if(config.physics.renderer.type_lineto){
        render_lineto(engine,context);
    }
    if(config.physics.renderer.type_native){
        Matter.Render.world(renderer);
    }
}

function vertex_add(params){
    let x = params.w/2 +  Math.round((physics_element.offsetWidth-params.w) * Math.random());
    let y = params.h/2 + Math.round((physics_element.offsetHeight-2*params.h) * Math.random());
    let box = Matter.Bodies.rectangle(x,y,params.w,params.h,{id:params.id,name:params.name ,isvertex:true});
    Matter.World.add(engine.world,[box]);
}

function onMatterVertex(e){
    const d = e.detail;
    if(d.type == 'add'){
        vertex_add(d);
    }
}

function edge_add(params){
    //console.log(`phy> should add edge from ${params.src} to ${params.dest}`);
    let b_1 = engine.world.bodies.find(body => (body.id == params.src));
    let b_2 = engine.world.bodies.find(body => (body.id == params.dest));
    console.log(`phy> add edge (${params.weight.toFixed(2)}) from ${b_1.name} to ${b_2.name}`);

    var constraint = Matter.Constraint.create({
        bodyA: b_1,
        bodyB: b_2,
        length:100/params.weight,
        stiffness: 0.01,
        damping: 0.05
    });
    Matter.World.add(engine.world,constraint);
}

function onMatterEdge(e){
    if(e.detail.type == "add"){
        edge_add(e.detail);
    }
}

function onResize(e){
    if(config.physics.renderer.type_native){
    }
}

export{init,run};
