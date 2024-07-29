	jsPsych.plugins["view"] = (function() {

		var plugin = {};

		//BEGINNING OF TRIAL
		plugin.trial = function(display_element, trial) {

			var countDown;
			var trial_data = {};

			//trial_data._parameters = {};
			//trial_data._messy = {};
			trial_data.startTime = (new Date()).getTime();

			//save trial parameters you want to save around here
			trial_data.treatment_type = treatments[exp_type];
			trial_data.n_firms = trial.n_firms;
			trial_data.names = trial.names;
			trial_data.prior_mean = trial.prior_mean;
			trial_data.prior_std = trial.prior_std;
			trial_data.factor_val = trial.next_period_realizations;
			trial_data.random_order_stocks = trial.random_order_stocks;
			trial_data.show_history = trial.show_history; // show points from non-hovered factors or not (true/false)
			trial_data.n_display = trial.n_display; // how many older points to show (maximum number)

			trial_data.eventTimes_index = [];
			trial_data.eventTimes_time = [];
			trial_data.npr_index = [];
			trial_data.npr_val = [];
			trial_data.npr_time = [];
			trial_data.npr_last = [];


			//----------------------- trial parameters -----------------------

			//trial_data._parameters = trial;

			var timeLeft = trial.total_time;
			var nFirms = trial.n_firms;
			var names = trial.names;
			var prior_mean = trial.prior_mean;
			var prior_std = trial.prior_std;
			var t = trial.period;
			var T = trial.n_periods;
			var instructions = trial.instructions;
			var instrSpace = instructions == "" ? 0 : 50;
			var table_header = trial.table_header;
			var frequency = trial.frequency;
			var random_order_stocks = trial.random_order_stocks;
			var n_display = trial.n_display; //define number of last samples to be shown

			var mouseTimes = [];
			for (var i = 0; i < nFirms + 2; i++) mouseTimes.push(0);
			for (var i = 0; i < nFirms + 1; i++) trial_data.npr_last.push(null);


			//--------------------- end trial parameters ---------------------

			// console.log(jsPsych.data.getLastTrialData())
			// console.log(histories)
			// console.log(trial.next_period_realizations)
			// Standard Normal variate using Box-Muller transform.

			function normal(mean, std) {
				mean = mean || 0;
				std = std || 1;

				var u = 0, v = 0;
				while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
				while(v === 0) v = Math.random();
				return mean + std * Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
			}

			var over = nFirms + 1;

			var windowWidth = window.innerWidth;
			var windowHeight = window.innerHeight;

			var headerHeight = 60;
			var footerHeight = 60;

			var tableWidth = 900;
			var tableWidth_0 = 200;
			var tableWidth_1 = ((t+1)/T) * (tableWidth - tableWidth_0 - 100);
			var tableWidth_2 = ((T-t-1)/T) * (tableWidth - tableWidth_0 + 100);

			var padding = (1/T) * (tableWidth - tableWidth_0 - 50);

			var top_bottom_space = 20;

			var rowHeight = (windowHeight - (headerHeight + footerHeight + 2 * top_bottom_space + instrSpace)) / (nFirms + 1);
			rowHeight--

			//----------------------- color palette -----------------------

			var colBody = "rgb(200,200,205)";
			var colHeader = "rgba(80,80,100,1)";
			var colHeader2 = "rgba(80,80,100,1)";
			var colFooter = "rgba(140,140,170,1)";
			var colTimer = "rgb(13,14,33)";

			var colTable_Out = "white";
			var colTable_In = "rgb(25,25,40)";
			var colTable_In4 = "rgb(22,22,35)";

			var colTable_0_Out;
			var colTable_0_In;
			var colPeriod;
			var colTimer;
			var colNPR;

			const x1 = "rgb(40,40,80)";
			const x3 = "hsl(225, 30%, 20%)";
			const x4 = "hsl(225, 30%, 30%)";
			const x6 = "hsl(225, 30%, 90%)";
			const x7 = "hsl(225, 40%, 96%)";
			const x9 = "hsl(225, 40%, 94%)";
			const x8 = "hsl(225, 30%, 99%)";

			colTimer = "none";
			colPeriod = "rgba(255,255,255,.9)";
			colTable_0_Out = "#2C1D55";
			colHeader = "#2C1D55";
			colHeader2 = "#241846";
			colTable_0_In = "#3D0173";
			colTable_In = x7;
			colTable_In4 = x9;
			colTable_Out = x8;
			colBody = x6;
			colNPR = colTable_0_In;
			colTimer = colTable_0_In;
			colFooter = colHeader;


			// Charts

			$("body").append($("<canvas>", {
				id: "tmp_ctx",
				css: {
					display: "none",
				}
			}))

			var tmp_ctx = document.getElementById("tmp_ctx").getContext("2d");

			var fillPattern = tmp_ctx.createLinearGradient(0,0,50,200);
			fillPattern.addColorStop(1,"rgba(135, 255, 155, 1)");
			fillPattern.addColorStop(0,"rgba(86, 184, 255, 1)");

			var fillPattern2 = tmp_ctx.createLinearGradient(0,0,0,25);
			fillPattern2.addColorStop(1,"rgba(255, 0, 0, 0)");
			fillPattern2.addColorStop(.9,"rgba(255, 0, 0, .5)");
			fillPattern2.addColorStop(0,"rgba(255, 0, 0, 1)");

			var colLine = "#66D08C";
			var colFill = fillPattern;
			var lineWidth = 1;
			var dotRadius = 5;

			//----------------------- end color palette -------------------

			var NPR_plot_last_n = [];
			var NPR_plot_last_1 = [];

			function done () {
				
				mouseTimes[random_order_stocks[over]] += ((new Date()).getTime()) - trial_data.userStart - trial_data.eventTimes_time.slice(-1)[0];
				trial_data.eventTimes_index.push(-1)
				trial_data.eventTimes_time.push((new Date()).getTime() - trial_data.userStart)

				clearInterval(countDown);

				trial_data.doneTime = (new Date()).getTime();
				trial_data.timeLeft = timeLeft;
				trial_data.mouseTimes = mouseTimes;

				trial_data.componentTimes = trial_data.mouseTimes.map(function (el) { return el / 1000; })
				trial_data.componentTimes[nFirms + 1] = +((trial_data.doneTime - trial_data.userStart) / 1000 - trial_data.componentTimes.reduce(add)).toFixed(3);

				function add(accumulator, a) { return accumulator + a; }

				trial_data.npr_last_1 = NPR_plot_last_1;
				trial_data.npr_last_n = NPR_plot_last_n;

				//console.log(trial_data);
				display_element.html('');
				jsPsych.finishTrial(trial_data);

			}

			// ---------------------------------------------------------------------------

			$("body").css({
				"background-color": colBody,
				"margin": 0,
				"padding": 0,
				"width": "100%",
				"height": "100%",
				"user-select": "none",
				"cursor": "default",
				"font-family": "Roboto, sans-serif"
			})

			// header
			display_element.append($("<div>", {
				"class": "header",
				"id": "gabler",
				"css": {
					"position": "fixed",
					"top": 0,
					"background-color": colHeader,
					"width": "100%",
					"height": headerHeight,
					"z-index": 10,
				}
			}));

			// footer
			display_element.append($("<div>", {
				"class": "footer",
				"id": "foo",
				"css": {
					"position": "fixed",
					"background-color": colFooter,
					"width": "100%",
					"height": footerHeight,
					"bottom": 0,
					"z-index": 10,
				}
			}));

			var header = $(document.getElementById("gabler"));
			var footer = $(document.getElementById("foo"));

			header.append($("<div>", {
				"class": "header-wrapper",
				"id": "hwrap",
				"css": {
					"position": "fixed",
					"top": 0,
					"background-color": "none",
					"width": "80%",
					"min-width": 500,
					"max-width": 700,
					"left": "50%",
					"transform": "translateX(-50%)",
					"height": headerHeight,
					"z-index": 10,
				}
			}));

			footer.append($("<div>", {
				"class": "footer-wrapper",
				"id": "fwrap",
				"css": {
					"position": "fixed",
					"background-color": "none",
					"width": "80%",
					"min-width": 500,
					"max-width": 700,
					"left": "50%",
					"transform": "translateX(-50%)",
					"height": footerHeight,
					"z-index": 10,
				}
			}));

			var hwrap = $(document.getElementById("hwrap"));
			var fwrap = $(document.getElementById("fwrap"));

			var tim = "calc(90% - 90px)";

			// timer
			hwrap.append($("<div>", {
				"id": "timer-wrapper",
				"css": {
					"position": "absolute",
					"background-color": colTimer,
					"margin-left": "calc(100% - 90px)",
					"margin-top": 0,
					"width": 90,
					"height": headerHeight,
					"z-index": 10,
					"display": "table",
					"vertical-align": "middle",
				}
			})
			.append($("<div>", {
				"id": "timer",
				"css": {
					"color": "rgba(255,255,255,.9)",
					"font-size": 30,
					"font-family": "Roboto, sans-serif",
					"font-weight": 300,
					"display": "table-cell",
					"vertical-align": "middle",
					"text-align": "center",
					"cursor": "pointer",
				}
			})));

			header.append($("<div>", {
				"id": "period-wrapper",
				"css": {
					"position": "fixed",
					"margin-top": 0,
					"width": 300,
					"height": headerHeight,
					"z-index": 10,
					"display": "table",
					"vertical-align": "middle",
					"left": "calc(50% - 150px)",
				}
			})
			.append($("<div>", {
				"id": "period",
				"html": "Period " + (t + 1) + " of " + T,
				"css": {
					"color": colPeriod,
					"font-size": 30,
					"font-family": "Roboto, sans-serif",
					"font-weight": 400,
					"display": "table-cell",
					"vertical-align": "middle",
					"text-align": "center",
				}
			})));


			var minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
			var seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
			minutes = ("0" + minutes).slice(-2);
			seconds = ("0" + seconds).slice(-2);
			if (isNaN(seconds)) { document.getElementById("timer").innerHTML = "00:00" } else { document.getElementById("timer").innerHTML = minutes + ":" + seconds }

			display_element.append($("<p>", {
				"id": "toStart",
				"html": "Click the timer in the upper right corner to start the trial.",
				"css": {
					"position": "fixed",
					"width": "50%",
					"height": 25,
					"margin-top": "calc(50vh - 55px)",
					"margin-left": "25vw",
					"text-align": "center",
					"font-size": 30,
					"line-height": 1.2,
					"color": "rgba(0,0,0,.3)",
					"font-weight": "light",
				}
			}));

			$(document.getElementById("timer")).on("click", function () {

				if (trial.next_button) {
					fwrap.append($("<div>", {
						"class": "proceed",
						"css": {
							"position": "fixed",
							"background-color": colTimer,
							"width": 90,
							"height": footerHeight,
							"margin-left": "calc(100% - 90px)",
							"z-index": 20,
							"display": "table",
							cursor: "pointer"
						},
						"click": done,
					})
					.append($("<p>", {
						html: "next",
						"class": "proceed-text",
						"css": {
							"color": "rgba(255,255,255,.9)",
							"font-size": 18,
							"font-weight": 300,
							"width": "100%",
							"text-align": "center",
							"display": "table-cell",
							"vertical-align": "middle",
							"text-transform": "uppercase",
						}
					})));
				}

				trial_data.userStart = (new Date()).getTime();
				trial_data.eventTimes_index.push(-1)
				trial_data.eventTimes_time.push((new Date()).getTime() - trial_data.userStart)

				if (instructions != "") {

					display_element.append($("<p>", {
						"id": "instructions",
						html: instructions,
						"css": {
							"position": "relative",
							"width": "100%",
							//"height": 30,
							"height": 200, // height of instructions hard-coded for practice trials
							"margin-top": headerHeight + 30,
							"text-align": "center",
							"z-index": 0,
							color: "rgba(0,0,0,.5)",
							fontSize: 18,
							lineHeight: 1.25,
						}
					}));

				}


				$(this).off()
				$(this).css("cursor","default")

				$(document.getElementById("toStart")).remove()
				$(document.getElementById("instructions")).css("visibility", "visible")


				// for count down
				var lastNPR = new Date().getTime();
				var now = new Date().getTime();
				var latest = new Date().getTime();
				
				// Update count down and NPRs
				countDown = setInterval(function() { //run this function every slice of time

					// Get todays date and time
					now = new Date().getTime();
					var timeRemaining = trial_data.userStart + timeLeft - now;

					minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
					seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

					minutes = ("0" + minutes).slice(-2);
					seconds = ("0" + seconds).slice(-2);

					if (isNaN(seconds)) { document.getElementById("timer").innerHTML = "00:00" } else { document.getElementById("timer").innerHTML = minutes + ":" + seconds }

					var later = new Date().getTime();
					if (later - lastNPR >= frequency) { //if it has been long enough since the last sample was shown
						lastNPR = new Date().getTime();
						updateNPR() //run the sample update function
						if (trial.show_history) {
							if (typeof npr_chart !== 'undefined') npr_chart.update(); //update the chart
						} else {
							for (var k = 0; k < nFirms+1; k++) if (typeof all_charts[k] !== 'undefined') all_charts[k].update(); //update all charts
						}
					}

					latest = new Date().getTime();
					if (latest >= trial_data.userStart + timeLeft) done() //if time has run out, conclude the trial
						
				}, 10 - (latest - now)); //defines the slice of time (accounts for some noise in timing)

				display_element.append($("<table>", {
					"id": "table",
					"css": {
						"position": "relative",
						"width": "80%",
						"min-width": 500,
						"max-width": 700,
						"margin-top": instructions == "" ? headerHeight + 30 : 30,
						"margin-left": "auto",
						"margin-right": "auto",
						"margin-bottom": footerHeight + 30,
						"border-collapse": "collapse",
						"background-color": "white",
					}
				}))

				// Column headers
				if (table_header) {

					$(document.getElementById("table")).append($("<tr>", {
						"id": "table_header",
						"css": {
							"vertical-align": "middle",
							"text-align": "center",
							"font-size": 16,
							"font-family": "Roboto, sans-serif",
							"font-weight": "400",
							"color": "rgba(255, 255, 255, .85)",
							"background-color": colHeader2,
							"padding-right": 25,
							"padding-left": 25,
							"text-transform": "uppercase",
							"border-bottom": "solid 1px rgba(1,1,1,.1)",
							"height": 40,
							"border-right": "solid 1px rgba(0,0,0,0.1)",
						}
					})

					// names
					.append($("<td>", {
						"id": "table_header_" + 0,
						"html": "names",
						"css": {
							"text-align": "left",
							"color": "rgba(255, 255, 255, .85)",
							"background-color": colHeader2,
							"padding-right": 25,
							"padding-left": 25,
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
							"border-right": "solid 1px rgba(0,0,0,0.1)",
						}
					}))

					// y-axis
					.append($("<td>", {
						id: "table_header_" + 1,
						html: "factor",
						colspan: 2,
						css: {
							"text-align": "right",
							"background-color": colHeader2,
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
							"border-right": "solid 1px rgba(0,0,0,0.1)",
							"border-left": "solid 1px rgba(0,0,0,0.1)",
						},
					}))

					// npr
					.append($("<td>", {
						id: "table_header_" + 3,
						html: "values",
						css: {
							"background-color": colHeader2,
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
							"border-right": "solid 1px rgba(0,0,0,0.1)",
							"border-left": "solid 1px rgba(0,0,0,0.1)",
						},
					}))

					// slider + sliderval
					.append($("<td>", {
						id: "table_header_" + 4,
						html: "stock prediction",
						css: {
							"background-color": colHeader2,
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
							"border-right": "solid 1px rgba(0,0,0,0.1)",
							"border-left": "solid 1px rgba(0,0,0,0.1)",
						},
					})));

				}

				// Terrible, horrible, no good, very bad.
				var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 100;
				var width = (100 / (nFirms + 1)) * vh - ((headerHeight + footerHeight + 2 * 30) / (nFirms + 1));
				// var width = 70;
				var width = 71.5;
				// var width = 75;
				var height = 50;
				var translate = (width + height)/2;

				// Table
				for (var i = 0; i < nFirms + 1; i++) {

					$(document.getElementById("table")).append($("<tr>", {
						"id": "table_" + i,
					})

					// names
					.append($("<td>", {
						"id": "table_" + i + "_" + 0,
						"html": names[random_order_stocks[i]],
						"css": {
							"vertical-align": "middle",
							"text-align": "left",
							"font-size": 16,
							"font-family": "Roboto, sans-serif",
							"font-weight": "300",
							"color": "rgba(255, 255, 255, .85)",
							"width": 150,
							"background-color": colTable_0_Out,
							"padding-right": 25,
							"padding-left": 25,
							"text-transform": "none",
							"border-bottom": "solid 1px rgba(0,0,0,.1)",
						}
					}))

					// y-axis
					.append($("<td>", {
						id: "table_" + i + "_" + 1,
						css: {
							"min-width": 50,
							"max-width": 50,
							"width": 50,
							"height": 90,
							"background-color": colTable_Out,
							"text-align": "right",
							"padding": 0,
							"margin": 0,
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
						},
					})
					.append($("<canvas>", {
						id: "canvas_" + i + "_axis",
						css: {
							"position": "relative",
							"display": "block",
							"background-color": "none",
							"margin": 0,
							"padding": 0,
							"height": 80,
							"visibility": "visible"
						},
					})))

					// density
					.append($("<td>", {
						id: "table_" + i + "_" + 2,
						css: {
							"position": "relative",
							"min-width": 50,
							"max-width": 50,
							"width": 50,
							"background-color": colTable_Out,
							"font-weight": "500",
							"font-size": 18,
							"color": colTable_Out,
							"margin": 0,
							"text-align": "left",
							"padding": 0,
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
							"border-right": "solid 1px rgba(0,0,0,0.1)",
						},
					})
					.append($("<canvas>", {
						id: "canvas_" + i + "_density",
						css: {
							"position": "relative",
							"display": "block",
							"width": 70,
							"background-color": "none",
							"margin": 0,
							"padding": 0,
							"height": height,
							"transform": "rotate(270deg) translateX(-" + translate + "px)",
							"transform-origin": "0 0",
						},
					})))

					// npr
					.append($("<td>", {
						id: "table_" + i + "_" + 3,
						css: {
							"min-width": 70,
							"max-width": 70,
							"width": 70,
							"background-color": colTable_Out,
							"text-align": "right",
							"padding": 0,
							"margin": 0,
							"border-bottom": "solid 0px rgba(0,0,0,0.1)",
						},
					})
					.append($("<canvas>", {
						id: "canvas_" + i + "_npr",
						css: {
							"position": "relative",
							"min-width": 70,
							"max-width": 70,
							"width": 70,
							"display": "block",
							"height": 69,
							"background-color": "none",
							"margin": 0,
							"padding": 0,
							"padding-top": 0.8,
						},
					})))

					// -------- insert: column for slider, slider value ----------------- //

					// slider + slider val
					.append($("<td>", {
						html: "XXXXXXXXXXXX",
						id: "table_" + i + "_" + 4,
						css: {
							"min-width": 350 + 50,
							"background-color": colTable_In,
							"padding": 0,
							"margin": 0,
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
							"position": "relative",
							"text-align": "center",
							"color": "rgba(0,0,0,.1)",
						},
					})))

				}

				var error;
				var true_val;
				var npr;

				var NPR_plot = [];

				for (var i = 0; i < nFirms+1; i++) NPR_plot.push([]); //initialize an array for holding the sample sequence of each factor
				for (var i = 0; i < nFirms+1; i++) NPR_plot_last_n.push([]);
				for (var i = 0; i < nFirms+1; i++) NPR_plot_last_1.push([]);

				function updateNPR () { //function that updates the samples

					if (over < nFirms+1) { //if hovering over any factor

						// true_val = histories[t][random_order_stocks[over]];
						true_val = trial.next_period_realizations[random_order_stocks[over]]; //get the true value of the factor
						error = normal(trial.error_mean, trial.error_std); //generate the sample error
						while ((error > trial.error_mean + 4.5 * trial.error_std) || (error < trial.error_mean - 4.5 * trial.error_std)) error = normal(trial.error_mean, trial.error_std); //redraw if outlyling

						npr = true_val + error; //construct sample value
						npr = Math.round(npr); //round it to an integer

						NPR_plot[over].push({x:1, y:npr}); //add sample value to the end of the factor's sequence
						NPR_plot_last_1[over].push({x:1, y:npr});
						trial_data.npr_index.push(random_order_stocks[over]); //add factor index to stored data
						trial_data.npr_val.push(npr); //add sample value to stored data
						trial_data.npr_time.push((new Date()).getTime() - trial_data.userStart); //add time sample was shown to stored data
						trial_data.npr_last[random_order_stocks[over]] = npr; //add final shown sample value to stored data

						// JavaScript weirdness.
						while (NPR_plot_last_n[over].length > 0) NPR_plot_last_n[over].pop();
						while (NPR_plot_last_1[over].length > 0) NPR_plot_last_1[over].pop();

						var tmp = NPR_plot[over].slice(Math.max(0, NPR_plot[over].length - n_display), NPR_plot[over].length); //gets the last n_display samples from the factor

						for (var i = 0; i < tmp.length; i++) NPR_plot_last_n[over].push(tmp[i]); //show older points

						NPR_plot_last_1[over].push({x:1, y:npr})

					}

				}

				updateNPR()

				var update;
				var cvs_npr;
				var cvs_density;

				// Setting yMax, yMin. Can be set for each firm individually (array), uniformly for
				// all firms (integer), or set automatically (no input).

				var yMax = [];
				var yMin = [];

				if (!(trial.yMax instanceof Array)) {
					for (var i = 0; i < nFirms + 1; i++) {
						yMax.push(trial.yMax)
					}
				}
				else if (trial.yMax.length > 0) {
					yMax = trial.yMax;
				}

				if (!(trial.yMin instanceof Array)) {
					for (var i = 0; i < nFirms + 1; i++) {
						yMin.push(trial.yMin)
					}
				}
				else if (trial.yMin.length > 0) {
					yMin = trial.yMin;
				}

				var density_x = [];
				var density_y = [];

				for (var i = 0; i < nFirms+1; i++) {
					var tmp2 = [];
					for (var j = 0; j < n_periods; j++) {
						tmp2.push([])
					}
					density_x.push([])
					density_y.push(tmp2)
				}

				var x, y, mean, step;
				var n_steps = 500;

				// all density plots on same scale
				var global_max_density = 0.08; // density peak at N(0,sd=5)

				// density data
				for (var i = 0; i < nFirms + 1; i++) {

					step = (yMax[i] - yMin[i]) / n_steps;

					for (var k = 0; k < n_steps; k++) density_x[i].push(yMin[i] + k * step);

					for (var j = 0; j < n_periods; j++) {

						mean = prior_mean[i];
						std = prior_std[i];

						// !
						// mean = 75;
						// std = 0.1;

						for (var k = 0; k < n_steps; k++) {
							x = yMin[i] + k * step;
							y = (x - mean)**2;
							y = y / (2 * (std**2));
							y = -1 * y;
							y = Math.exp(y);
							y = (1 / Math.sqrt(2 * Math.PI * (std**2))) * y;
							// if (y > global_max_density) global_max_density = y; // rescale peak if needed
							density_y[i][j].push(y)
						}
					}
				}
				var all_charts = [];

				// densities
				for (var i = 0; i < nFirms + 1; i++) {

					const ii = i;
					var npr_chart;
					var density_chart;

					cvs_npr = document.getElementById("canvas_" + ii + "_npr").getContext("2d");
					cvs_density = document.getElementById("canvas_" + ii + "_density").getContext("2d");

					npr_chart = new Chart(cvs_npr, {
						type: "scatter",
						data: {
							datasets: [
								{
									data: [],
									borderWidth: .001,
									pointRadius: 3,
									borderColor: "rgba(255,0,0,0)",
									pointBackgroundColor: "rgba(255,20,20,1)",
								},
								{
									data: [],
									borderColor: "rgba(0,0,255,.2)",
									borderWidth: .001,
									pointBackgroundColor: "rgba(0,0,255,.2)",
									pointRadius: 3,
									pointHoverRadius: null,
								},
							]
						},
						options: {
							animation: {
								duration: 0,
							},
							responsive: false,
							hover: {
								mode: null,
							},
							tooltips: {
								enabled: false,
							},
							plugins: {
								datalabels: {
									display: function (context) {
										return context.datasetIndex == 0;
									},
									backgroundColor: null,
									align: "right",
									offset: 0,
									font: {
										family: "Open Sans",
										weight: 900,
										size: 13,
									},
									color: "blue",
									formatter: function(value, context) {
										return Math.round(context.chart.data.datasets[0].data[context.dataIndex].y);
									}
								}
							},
							legend: {
								display: false,
							},
							scales: {
								xAxes: [{
									display: false,
									offset: 5,
									stepSize: 5,
								}],
								yAxes: [{
									display: false,
									// display: true,
									ticks: {
										max: yMax[random_order_stocks[ii]],
										min: yMin[random_order_stocks[ii]],
									},
									stepSize: 10,
								}],
							},
							elements: {
								line: {
									tension: .8,
								},
								point: {
									pointStyle: 'rect',
								}
							},
							events: [],
							layout: {
								padding: {
									right: 0,
									left: 0,
								}
							}

						}

					});

					density_chart = new Chart(cvs_density, {
						type: "line",
						data: {
							labels: density_x[random_order_stocks[ii]],
							datasets: [{
								data: density_y[random_order_stocks[ii]][t],
								borderWidth: 1,
								borderColor: "rgba(0,0,0,0)",
								pointRadius: 0,
								backgroundColor: "rgba(0,0,255,.2)",
							}],
						},
						options: {
							animation: {
								duration: 0,
							},
							responsive: false,
							hover: {
								mode: null,
							},
							tooltips: {
								enabled: false,
							},
							legend: {
								display: false,
							},
							plugins: {
								datalabels: {
									display: false,
								}
							},
							scales: {
								xAxes: [{
									display: false,
									ticks: {
										min: yMin[random_order_stocks[ii]],
										max: yMax[random_order_stocks[ii]],
										callback: function(value, index, values) { return Math.round(value); },
										fontSize: 6,
										maxTicksLimit: 5,
									},
								}],
								yAxes: [{
									display: false,
									// display: true,
									ticks: {
										min: 0,
										max: global_max_density,
									},
								}],
							},
							elements: {
								line: {
									cubicInterpolationMode: "monotone",
									tension: 100,
								},
							},
							events: [],
							layout: {
								padding: {
									right: 0,
								}
							}

						}

					});

					all_charts.push(npr_chart);

					// hover stuff
					$(document.getElementById("table_" + i)).hover(

						function () {

							over = ii; //row hovering over
							npr_chart = all_charts[over];

							npr_chart.data.datasets[0].data = NPR_plot_last_1[over];
							npr_chart.data.datasets[1].data = NPR_plot_last_n[over];

							if (!trial.show_history) { // empty data for non hovered-over factors
								for (var k = 0; k < nFirms+1; k++) {
									if (k !== over) {
										all_charts[k].data.datasets[0].data = [];
										all_charts[k].data.datasets[1].data = [];
									}
								}
							}

							$(document.getElementById("canvas_" + ii + "_density")).css("visibility","visible")

							$(document.getElementById("table_" + ii + "_0")).css("background-color",colTable_0_In)
							$(document.getElementById("table_" + ii + "_1")).css("background-color",colTable_In)
							$(document.getElementById("table_" + ii + "_2")).css("background-color",colTable_In)
							$(document.getElementById("table_" + ii + "_3")).css("background-color",colTable_In)
							$(document.getElementById("table_" + ii + "_4")).css("background-color",colTable_In4)
							$(document.getElementById("table_" + ii + "_5")).css("background-color",colTable_In4)

							trial_data.eventTimes_index.push(random_order_stocks[over])
							trial_data.eventTimes_time.push((new Date()).getTime() - trial_data.userStart)

						},

						function () {

							mouseTimes[random_order_stocks[over]] += ((new Date()).getTime()) - trial_data.userStart - trial_data.eventTimes_time.slice(-1)[0];
						
							if (!trial.show_history) {
								npr_chart.data.datasets[0].data = []; // empty data for previously hovered-over factor
								npr_chart.data.datasets[1].data = []; // empty data for previously hovered-over factor
							}

							over = nFirms + 1;

							$(document.getElementById("table_" + ii + "_0")).css("background-color",colTable_0_Out)
							$(document.getElementById("table_" + ii + "_1")).css("background-color",colTable_Out)
							$(document.getElementById("table_" + ii + "_2")).css("background-color",colTable_Out)
							$(document.getElementById("table_" + ii + "_3")).css("background-color",colTable_Out)
							$(document.getElementById("table_" + ii + "_4")).css("background-color",x7)
							$(document.getElementById("table_" + ii + "_5")).css("background-color",x7)
							
							trial_data.eventTimes_index.push(-1)
							trial_data.eventTimes_time.push((new Date()).getTime() - trial_data.userStart)

						},
					)

				}

				// Charts
				for (var i = 0; i < nFirms + 1; i++) {

					const ii = i;

					var axis_ctx = document.getElementById("canvas_" + i + "_axis").getContext("2d");

					var labels = [];

					for (var j = 0; j < t; j++) labels.push(j);

					// axis-chart
					var axis_charts = new Chart(axis_ctx, {
						type: "line",
						options: {
							responsive: true,
							responsive: false,
							scales: {
								yAxes: [{
									display: true,
									offset: true,
									ticks: {
										display: true,
										maxTicksLimit: 3,
										padding: 3,
										max: yMax[random_order_stocks[ii]],
										min: yMin[random_order_stocks[ii]],

										beginAtZero: false,
										stepSize: (yMax[random_order_stocks[ii]] - yMin[random_order_stocks[ii]]) / 4,
										fontSize: 11,
									},
									gridLines: {
										display: true,
										drawTicks: true,
										tickMarkLength: 7,
										drawBorder: true,
										lineWidth: 0.2,
										drawOnChartArea: true,
										color: "black",
										offsetGridLines: false,
										borderDash: [2,5],
									},
									scaleLabel: {

									}

								}],
								xAxes: [{
									display: false,
								}],
							},
							legend: {
								display: false,
							},
							elements: {
								line: {
									tension: 0,
								},
								point: {
									pointStyle: "crossRot"
								}
							},
							layout: {
								padding: {
									left: 10,
									right: 0,
									bottom: 0,
								}
							}
						}
					});

				}

	})



}; // END OF TRIAL

//Return the plugin object which contains the trial
return plugin;
})();
