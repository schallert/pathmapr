/*
 * Remove the event that would cause another box to me made on focusin
 * Make a copy of the current node, remove the current node's id
 * because that marks it as the most recent node in the list, then 
 * make the copied node the latest node and insert it at the end of the list
 */
function handleDestClick (e) {
	$(this).off('focusin');
	var copy = this.parentNode.cloneNode(true);

	copy.id = this.parentNode.id;
	this.parentNode.id = "";

	$("#submit-input").parent().before(copy.outerHTML);
	attachInputHandlers();
}


/*
 * Find the last input box in the list of destination inputs
 * and attach the focus event handler to it
 */
function attachInputHandlers () {
	$("#current-dest-input input").focusin(handleDestClick);
	// $(".dest-input").each(function () {
		
	// });
}

attachInputHandlers();