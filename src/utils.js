
function send(event_name,data){
	var event = new CustomEvent(event_name, {detail:data});
	window.dispatchEvent(event);
}

export{send};
