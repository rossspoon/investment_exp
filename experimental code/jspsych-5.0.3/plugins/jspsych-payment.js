jsPsych.plugins["payment"] = (function() {

	var plugin = {};

	//BEGINNING OF TRIAL
	plugin.trial = function(display_element, trial) {

	    trial.text = trial.text || "";

		display_element.append($("<p>", {
			"id": "text",
			html: trial.text,
			"css": {
				"position": "fixed",
				"width": "100%",
				"height": "30",
				"margin-top": "calc(50vh - 15px)",
				"text-align": "center",
				"z-index": 10,
				color: "rgba(0,0,0,1)",
				fontSize: 24,
				lineHeight: 1.5,
			}
		}));


	}; // END OF TRIAL

	//Return the plugin object which contains the trial
	return plugin;
})();
