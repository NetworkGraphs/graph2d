/**
 * supported events:
 * - view_vertex
     { type:(add,move),id,name)}
 */

import * as utils from "./../src/utils.js";

let Engine = Matter.Engine;
let engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let tb;

function init(){
    const start = Date.now();
    engine = Engine.create();
    let ground = Bodies.rectangle(0, window.innerHeight, 810, 50, { label:"ground",isStatic: true });
    World.add(engine.world,[ground]);
    window.addEventListener( 'view_vertex', onViewVertex, false );
    console.log(`move_matter> init() in ${Date.now() - start} ms`);
}

function run(){
    if(engine.world.bodies.length > 1){
        Engine.update(engine,1000/60);
        engine.world.bodies.forEach(body => {
            utils.send('view_vertex',{type:'move',id:body.id,x:body.position.x,y:body.position.y});  
        });
    }
}

function vertex_add(id,name){
    let box = Bodies.rectangle(200,200,100,50,{id:id,label:name});
    World.add(engine.world,[box]);
}

function onViewVertex(e){
    const d = e.detail;
    if(d.type == 'add'){
        vertex_add(d.id,d.name);
    }
}

export{init,run};
