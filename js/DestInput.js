/*
 * Group members: Dima Ivanyuk (divanyuk), Matt Schallert (mschalle)
 */

function DestInput (current) {
	this.class = "dest-input-group",
	this.id = current ? "current-dest-input" : "",
	this.current = current || false;
	this.inputEl = $("<input/>", {
		type: "text",
		class: "user-input dest-input",
		name: "user-location"
	});
	this.button = $("<button/>", {
		class: "dest-button",
		text: "D"
	});

	var jButton = $(this.button);

	jButton.click(function (e) {
		e.preventDefault();
		jButton.parent().remove();
	});
}

DestInput.prototype.makeNode = function() {
	var div = $("<div/>", {
		class: this.class,
		id: this.id
	});
	div.append(this.inputEl);
	// div.append(this.button);
	return div[0];
};

DestInput.prototype.toggleCurrent = function() {
	if (this.current) {
		this.current = false;
		this.id = "";
	}
	else {
		this.current = true;
		this.id = "current-dest-input";
	}
};