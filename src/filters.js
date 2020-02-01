

let xmlns = "http://www.w3.org/2000/svg";

function get_shadow(dx=10,dy=5,std=3){
    let shadow = document.createElementNS(xmlns,"feDropShadow");
    shadow.setAttribute("dx", dx);
    shadow.setAttribute("dy", dy);
    shadow.setAttribute("stdDeviation", std);
    return shadow;
}

function get_light(dx=5,dy=5,std=3){
    let diff_light = document.createElementNS(xmlns,"feDiffuseLighting");
    diff_light.setAttribute("in", "SourceGraphic");
    diff_light.setAttribute("result", "light");
    diff_light.setAttribute("light-color", "white");
    let point_light = document.createElementNS(xmlns,"fePointLight");
    point_light.setAttribute("x", -30);
    point_light.setAttribute("y", -10);
    point_light.setAttribute("z", 20);
    diff_light.appendChild(point_light);
    return diff_light;
}

function get_light_composite(){
    //result = k1*i1*i2 + k2*i1 + k3*i2 + k4
    let composite = document.createElementNS(xmlns,"feComposite");
    composite.setAttribute("in", "SourceGraphic");
    composite.setAttribute("in2", "light");
    composite.setAttribute("operator", "arithmetic");
    composite.setAttribute("k1", 0.8);
    composite.setAttribute("k2", 0.2);
    composite.setAttribute("k3", 0);
    composite.setAttribute("k4", 0);
    return composite;
}

function get_blur(std){
    let blur = document.createElementNS(xmlns,"feGaussianBlur");
    blur.setAttribute("stdDeviation", std);
    return blur;
}

function get_disp(scale){
    let disp = document.createElementNS(xmlns,"feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "turbulence");
    disp.setAttribute("scale", scale);
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "G");
    return disp;
}

function get_turb(){
    let turb = document.createElementNS(xmlns,"feTurbulence");
    turb.setAttribute("type", "turbulence");
    turb.setAttribute("baseFrequency", 0.05);
    turb.setAttribute("numOctaves", 3);
    turb.setAttribute("result", "turbulence");
    return turb;
}

function get_disp_turb_filter(){
    let filter = document.createElementNS(xmlns,"filter");
    filter.setAttribute("id", "disp_turb");
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");

    filter.appendChild(get_turb());
    filter.appendChild(get_disp(5));
    return filter;
}

function get_blur_filter(std){
    let filter = document.createElementNS(xmlns,"filter");
    filter.setAttribute("id", "blur");
    filter.setAttribute("x", "-20%");
    filter.setAttribute("y", "-20%");
    filter.setAttribute("width", "150%");
    filter.setAttribute("height", "150%");
    filter.appendChild(get_blur(std));
    return filter;
}

function get_shadow_filter(){
    let filter = document.createElementNS(xmlns,"filter");
    filter.setAttribute("id", "shadow");
    filter.setAttribute("width", "150%");
    filter.setAttribute("height", "150%");
    filter.appendChild(get_shadow());
    return filter;
}

function get_light_shadow_filter(){
    let filter = document.createElementNS(xmlns,"filter");
    filter.setAttribute("id", "sl_filter");
    filter.setAttribute("width", "150%");
    filter.setAttribute("height", "150%");
    filter.appendChild(get_light());
    filter.appendChild(get_light_composite());
    filter.appendChild(get_shadow());
    return filter;
}

function create(main_svg_id){
    let svg = document.getElementById(main_svg_id);

    svg.appendChild(get_blur_filter(5));
    svg.appendChild(get_shadow_filter());
    svg.appendChild(get_light_shadow_filter());
    svg.appendChild(get_disp_turb_filter());
}

function blur(id){
    let el = document.getElementById(id);
    el.setAttribute("filter","url(#blur)");
}

function shadow(id){
    let el = document.getElementById(id);
    el.setAttribute("filter","url(#shadow)");
}

function shadow_light(id){
    let el = document.getElementById(id);
    el.setAttribute("filter","url(#sl_filter)");
}

function disp_turb(id){
    let el = document.getElementById(id);
    el.setAttribute("filter","url(#disp_turb)");
}

function clear(id){
    let el = document.getElementById(id);
    el.removeAttribute("filter");
}

export{create,blur,shadow,clear,shadow_light,disp_turb};
