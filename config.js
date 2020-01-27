export default
{
    "user.gui":{
        "preset":"Default",
        "closed":true,
        "width":350,
        "show physics":true,
        "show stats":true,
        "edges":"line",
        "stiffness":0.01,
        "damping":0.05,
        "frictionAir":0.3,
        "VertexColor":"#228855",
        "VertexHighlight":"#20f046",
        "physics":{
            "renderer":{
                "enabled":true,
                "type_lineto":false,
                "type_native":true
            },
            "move_objects_with_mouse":true
        },
        "stats":{
            "enabled":true
        },
        "view":{
            "colors":{
                "vertices":{
                    "default":"#228855",
                    "highlight":"#20f046"
                }
            }
        }
    },
    "system":{
        "physics":{
            "renderer":{
                "type_lineto":false,
            },
                "simulation":{
                "constraintIterations":5
            },
            "gravity":0,
            "move_objects_with_mouse":true
        },
        "app":{
            "debug_rotation":false
        },
        "stats":{
            "enabled":true
        },
        "dat_gui":{
            "enabled":true,
            "closed":true
        },
        "view":{
            "colors":{
                "vertices":{
                    "default":"#228855",
                    "highlight":"#20f046"
                }
            }
        }
     }
}
