var destInputForm = new DestForm();
destInputForm.appendNew();

var submitButton = $("#submit-input");

submitButton.click(function (e) {
	e.preventDefault();
});

$("#dest-group").hide();

$("#origin-input").focusin(function () {
	$("#dest-group").fadeIn("slow");
});