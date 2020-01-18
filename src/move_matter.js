/**
 * supported events:
 * - view_vertex
 *   { type:(add,move),id,name)}
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

function init(physics_element,render_element){
    const start = Date.now();
    engine = Matter.Engine.create({enableSleeping:true});
    console.log(`phy> element width = ${physics_element.offsetWidth} ; height = ${physics_element.offsetHeight}`);
    let ground = Matter.Bodies.rectangle(0, physics_element.offsetHeight-50, physics_element.offsetWidth*2, 50, { label:"ground",isStatic: true });
    Matter.World.add(engine.world,[ground]);

    window.addEventListener( 'resize', onResize, false );
    window.addEventListener( 'view_vertex', onMatterVertex, false );
    window.addEventListener( 'view_edge', onMatterEdge, false );

    if(config.matter.renderer.type_lineto){
        canvas = document.createElement('canvas');
        context = canvas.getContext('2d');
        canvas.width = physics_element.offsetWidth;
        canvas.height = physics_element.offsetHeight;
        render_element.appendChild(canvas);
    }
    if(config.matter.renderer.type_native){
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
                constraintIterations:config.matter.simulation.constraintIterations
                //constraintIterations default = 2
                //positionIterations default = 6
                //velocityIterations default = 4
            }
        });
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
    if(engine.world.bodies.length > 1){
        Matter.Engine.update(engine,1000/60);
        engine.world.bodies.forEach(body => {
            //if(body.id == 3){console.log(`phy> x= ${body.position.x.toFixed(2)} , y = ${body.position.y.toFixed(2)} , a = ${body.angle.toFixed(2)}`);}
            utils.send('view_vertex',{type:'move',id:body.id,x:body.position.x,y:body.position.y,a:180*body.angle / Math.PI});
        });
    }
    if(config.matter.renderer.type_lineto){
        render_lineto(engine,context);
    }
    if(config.matter.renderer.type_native){
        Matter.Render.world(renderer);
    }
}

function vertex_add(id,name,x,y){
    let box = Matter.Bodies.rectangle(x,y,100,50,{id:id,label:name});
    Matter.World.add(engine.world,[box]);
}

function vertex_move(id,x,y,a){
}

function onMatterVertex(e){
    const d = e.detail;
    if(d.type == 'add'){
        vertex_add(d.id,d.name,d.x,d.y);
    }
    else if(d.type == 'move'){
        vertex_move(d.id,d.x,d.y,d.a);
    }
}

function edge_add(id,label,src,dest,params){
    console.log(`phy> should add edge from ${src} to ${dest}`);
}

function onMatterEdge(e){
    const d = e.detail;
    if(d.type == 'add'){
        edge_add(d.id,d.label,d.out,d.in,{});
    }
}

function onResize(e){
    if(config.matter.renderer.type_native){
    }
}

export{init,run};
