function DestForm () {
	this.form = $("#dest-input-form");
	this.inputs = [];
}

DestForm.prototype.detachHandlers = function() {
	_.each(this.inputs, function (input) {
		$(input).off('focusin');
	})
};

DestForm.prototype.disableCurrent = function() {
	_.each(this.inputs, function (input) {
		input.id = "";
	});
};

DestForm.prototype.append = function(inputEl) {
	this.detachHandlers();
	this.disableCurrent();

	var self = this;

	$(inputEl).focusin(function (e) {
		e.preventDefault();
		self.appendNew();
	});

	this.inputs.push(inputEl);
	this.form.children().eq(-1).before(inputEl);

	var lastInsert = _.last(this.inputValues());
	if (lastInsert !== undefined && lastInsert !== "") {
		p.addAddress(lastInsert);
	}
};

DestForm.prototype.appendNew = function () {
	var newInput = new DestInput(true);
	this.append(newInput.makeNode());
}

DestForm.prototype.inputValues = function() {
	var vals = _.map(this.inputs, function (input) {
		var inputEl = $(input).find("input");
		return {
			"address": inputEl.val(),
			"el": inputEl
		}
	});
	return _.filter(vals, function (el) {
		return el.address !== "";
	});
};

DestForm.prototype.mapInputs = function() {
	var values = this.inputValues();
	_.each(values, function (value) {
		p.addAddress(value);
	});
};