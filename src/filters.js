

let xmlns = "http://www.w3.org/2000/svg";

function get_blur(std){
    let filter = document.createElementNS(xmlns,"filter");

    filter.setAttribute("id", "blur");
    let blur = document.createElementNS(xmlns,"feGaussianBlur");
    filter.appendChild(blur);
    blur.setAttribute("stdDeviation", std);
    return filter;
}

function get_shadow(dx=5,dy=5,std=3){
    let filter = document.createElementNS(xmlns,"filter");

    filter.setAttribute("id", "shadow");
    let shadow = document.createElementNS(xmlns,"feDropShadow");
    filter.appendChild(shadow);
    shadow.setAttribute("dx", dx);
    shadow.setAttribute("dy", dy);
    shadow.setAttribute("stdDeviation", std);
    return filter;
}

function add_filters(main_svg_id){
    let svg = document.getElementById(main_svg_id);

    svg.appendChild(get_blur(5));
    svg.appendChild(get_shadow());
}

function blur(id){
    let el = document.getElementById(id);
    el.setAttribute("filter","url(#blur)");
}

function shadow(id){
    let el = document.getElementById(id);
    el.setAttribute("filter","url(#shadow)");
}

function clear(id){
    let el = document.getElementById(id);
    el.removeAttribute("filter");
}

export{add_filters,blur,shadow,clear};
