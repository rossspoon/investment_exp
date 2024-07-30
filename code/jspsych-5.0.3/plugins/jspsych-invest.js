	jsPsych.plugins["invest"] = (function() {

		var plugin = {};

		//BEGINNING OF TRIAL
		plugin.trial = function(display_element, trial) {

			var countDown;
			var trial_data = {};
			//trial_data._parameters = {};
			//trial_data._messy = {};
			trial_data.startTime = (new Date()).getTime();
			//trial_data.clickTimes = [];
			//trial_data.userValues = [];
			//trial_data.eventType = [];
			//trial_data.finalVal = [];
			//trial_data._parameters = trial;
			trial_data.treatment_type = treatments[exp_type];
			trial_data.n_firms = trial.n_firms;
			trial_data.names = trial.names;
			trial_data.prior_mean = trial.prior_mean;
			trial_data.prior_std = trial.prior_std;
			trial_data.factor_val = trial.next_period_realizations;
			trial_data.random_order_stocks = trial.random_order_stocks;
			trial_data.true_total_val = [];
			trial_data.prediction = [];
			trial_data.errors = [];
			trial_data.errorSum = 0;

			//save trial parameters you want to save around here
			

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
			var indexIndustry;

			if (!trial.forecast_industry) indexIndustry = random_order_stocks.indexOf(0);

			//for (var i = 0; i < nFirms + 1; i++) trial_data.clickTimes.push([]);
			//for (var i = 0; i < nFirms + 1; i++) trial_data.userValues.push([]);
			//for (var i = 0; i < nFirms + 1; i++) trial_data.eventType.push([]);

			nFirms = random_order_stocks.length; //careful with this; caused undercalculation of error

			//--------------------- end trial parameters ---------------------
			//console.log(jsPsych.data.getLastTrialData())

			var npr_data_1 = jsPsych.data.getLastTrialData().npr_last_1;
			var npr_data_n = jsPsych.data.getLastTrialData().npr_last_n;

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

			var sliderHeight = 4;
			var thumbWidth = 16;

			var slider_max = trial.slider_max;
			var slider_min = trial.slider_min;
			slider_max = slider_max - slider_min;

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

			var n_display = 80;

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

			var feedbackDone = false;

			function feedback () {

				if (feedbackDone) return;
				feedbackDone = true;

				var i, j, k, ii, leftOff, click, newPos, slider, thumb, npr, error, errorPos, labelPos, litError;

				ii = 0;

				for (i = 0; i < nFirms; i++) {

					k = random_order_stocks[i];

					if (trial.forecast_industry || (k != 0)) {

						slider = $($('.slider')[ii]);
						sliderwrapper = $($('.sliderwrapper')[ii]);
						thumb = $(slider.children()[0]);

						slider.off()
						sliderwrapper.off()
						slider.css('cursor', 'auto')
						sliderwrapper.css('cursor', 'auto')
						thumb.draggable('disable')

						leftOff = slider.offset().left;

						// npr is industry + firm or just industry for industry
						npr = k == 0 ? trial.next_period_realizations[k] : trial.next_period_realizations[k] + trial.next_period_realizations[0];

						// marks true npr on slider
						newPos = ((npr - slider_min) / slider_max) * slider.width() - thumbWidth;
						newPos = Math.round(newPos);

						// discrepancy: true npr, current slider position
						sliderPos = (thumb.offset().left - leftOff);
						error = newPos - sliderPos;
						
						// starting point for red error bar
						errorPos = error < 0 ? newPos : newPos - error;

						// position of error label above bar
						//labelPos = (thumb.offset().left - leftOff + newPos) / 2;

						// number to go into the label
						sliderVal = Math.round(slider_min + slider_max * (thumb.offset().left - leftOff + thumbWidth/2) / slider.width())
						litError = npr - sliderVal;

						
						trial_data.errorSum += (Math.abs(litError)**2)/(nFirms - 1); //changed to fix errorSum calc issue


						// !
						trial_data.true_total_val[k] = npr;
						trial_data.prediction[k] = sliderVal;
						trial_data.errors[k] = litError;

						thumb.css("backgroundColor", "red")
						slider.append($("<div>", {
							html: npr,
							id: ii,
							class: "slider-thumb",
							css: {
								position: "absolute",
								top: "50%",
								marginTop: -32/2,
								backgroundColor: "red",
								width: 32,
								height: 32,
								borderRadius: "100%",
								//opacity: 1,
								zIndex: 20,
								fontSize: 16,
								color: "white",
								textAlign: "center",
								lineHeight: 2,
							},
							offset: {
								left: newPos,
							}
						}))
						slider.append($("<div>", {
							id: ii,
							class: "error",
							css: {
								position: "absolute",
								top: "50%",
								marginTop: -sliderHeight/2,
								backgroundColor: "red",
								width: Math.abs(error),
								height: sliderHeight,
								zIndex: 0,
							},
							offset: {
								left: errorPos,
							}
						}))

						const truval = $("<div>", {
							id: "truval_" + ii,
							html: litError < 0 ? "&#8722;" + Math.abs(litError) : "+" + Math.abs(litError),
							css: {
								color: "red",
								fontSize: 12,
								textAlign: "center",
								fontWeight: "light",
								position: "absolute",
								top: Math.abs(error) > 40 ? -25 : -32,
								marginTop: -sliderHeight/2,
								backgroundColor: "none",
								width: Math.abs(error) + 20,
								height: 20,
								zIndex: 2,
								marginLeft: 0,
								visibility: "hidden",
							},
							offset: {
								left: error < 0 ? errorPos + thumbWidth - 10 : errorPos + thumbWidth - 10,
							}
						});

						slider.append(truval)

						$(document.getElementById("table_" + i)).on("mouseover", function (event) {
							$(truval).css("visibility", "visible");
						})
						$(document.getElementById("table_" + i)).on("mouseout", function (event) {
							$(truval).css("visibility", "hidden");
						})

						ii++;

					}

				}

				clearInterval(countDown)
				$(document.getElementById("timer")).css("opacity", .5)
				$(document.getElementById("proceed")).off()
				$(document.getElementById("proceed-text")).html("next")
				$(document.getElementById("proceed")).on("click", done)

			}


			function done () {

				clearInterval(countDown);

				/*
				// Write clean userValues.

				trial_data.userValues = [];
				trial_data.userTimes = [];

				for (var i = 0; i < nFirms; i++) trial_data.userValues.push([]);
				for (var i = 0; i < nFirms; i++) trial_data.userTimes.push([]);
				for (var i = 0; i < nFirms; i++) {

					var eventType = trial_data.eventType[i];
					var clickTimes = trial_data.clickTimes[i];
					var userValues = trial_data.userValues[i];

					var j = 1;
					var lastEventType = "";
					var currentEventType = "";

					while (j < eventType.length) {

						currentEventType = eventType[j];
						lastEventType = eventType[j-1];

						if (currentEventType == "mouseup") {
							if ((lastEventType == "drag") || (lastEventType == "mousedown")) {
								trial_data.userTimes[i].push(clickTimes[j] - trial_data.userStart);
								trial_data.userValues[i].push(userValues[j]);
							}
						}

						j++;

					}

				}

				// finalVal
				for (var i = 0; i < nFirms; i++) {
					if (trial_data.userValues[i].length > 0) trial_data.finalVal.push(trial_data.userValues[i][trial_data.userValues[i].length - 1]);
				}
				*/

				trial_data.doneTime = (new Date()).getTime();
				trial_data.timeLeft = timeLeft;
				//trial_data.clickTimes = [];
				//trial_data.eventType = [];
				//trial_data.userValues = [];

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

			fwrap.append($("<div>", {
				"id": "proceed",
				"css": {
					"position": "fixed",
					"background-color": colTimer,
					"width": 90,
					"height": footerHeight,
					"margin-left": "calc(100% - 90px)",
					"z-index": 50,
					"display": "table",
					cursor: "not-allowed",
					opacity: .8
				},
			})
			.append($("<p>", {
				html: "submit",
				"id": "proceed-text",
				"css": {
					"color": "rgba(255,255,255,.9)",
					"font-size": 18,
					"font-weight": 300,
					"width": "100%",
					"text-align": "center",
					"display": "table-cell",
					"vertical-align": "middle",
					"text-transform": "uppercase",
					opacity: .2
				}
			})));

			var tim = "calc(90% - 90px)";

			// *******************************************************

			// Just immediately start the trial.
			play()

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

			function play () {

				trial_data.userStart = (new Date()).getTime();

				if (instructions != "") {

					display_element.append($("<p>", {
						"id": "instructions",
						html: instructions,
						"css": {
							"position": "relative",
							"width": "100%",
							//"height": 30,
							"height": 200,
							"margin-top": headerHeight + 30,
							"text-align": "center",
							"z-index": 10,
							color: "rgba(0,0,0,.5)",
							fontSize: 18,
							lineHeight: 1.25,
						}
					}));

				}

				$(this).off()
				$(this).css("cursor","default")
				$(document.getElementById("instructions")).css("visibility", "visible")

				$(document.getElementById("toStart")).remove()

				// Create table
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
				}));

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

					// slider
					.append($("<td>", {
						id: "table_header_" + 4,
						html: "stock prediction",
						css: {
							"background-color": colHeader2,
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
							"border-right": "solid 1px rgba(0,0,0,0.1)",
							"border-left": "solid 1px rgba(0,0,0,0.1)",
						},
					}))

					// sliderval - revisit: width fixed
					.append($("<td>", {
						id: "table_header_" + 3,
						css: {
							"background-color": colHeader2,
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
							"border-right": "solid 1px rgba(0,0,0,0.1)",
							"border-left": "solid 1px rgba(0,0,0,0.1)",
						},
					})
					.append($("<div>", {
						text: "",
						css: {
							"width": "100%",
							"overflow": "hidden",
						},
					}))));

				}

				// Terrible, horrible, no good, very bad.
				var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) / 100;
				var width = (100 / (nFirms + 1)) * vh - ((headerHeight + footerHeight + 2 * 30) / (nFirms + 1));
				// var width = 70;
				var width = 71.5;
				var height = 50;
				var translate = (width + height)/2;

				var k;

				// Fill table
				for (var i = 0; i < nFirms; i++) {

					k = random_order_stocks[i];

					$(document.getElementById("table")).append($("<tr>", {
						"id": "table_" + i,
					})

					// names
					.append($("<td>", {
						"id": "table_" + i + "_" + 0,
						"html": names[k],
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
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
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

					// slider, maybe
					.append(

						function forecast_industry () {

								var sliderstuff = $("<td>", {
														id: "table_" + i + "_" + 4,
														css: {
															"min-width": 350,
															"background-color": colTable_In,
															"padding": 0,
															"margin": 0,
															"border-bottom": "solid 1px rgba(0,0,0,0.1)",
															"position": "relative",
															"text-align": "center",
														},
													})
													.append($("<div>", {
														id: "sliderwrapper_" + i,
														class: "sliderwrapper",
														css: {
															position: "absolute",
															top: "50%",
															marginTop: -5*sliderHeight,
															backgroundColor: "none",
															width: "80%",
															height: 10 * sliderHeight,
															marginLeft: "10%",
															cursor: "pointer",
														}
													})
													.append($("<div>", {
														id: "" + i,
														class: "slider",
														css: {
															position: "absolute",
															top: "50%",
															marginTop: -sliderHeight/2,
															backgroundColor: "hsl(225, 20%, 85%)",
															width: "100%",
															height: sliderHeight,
															cursor: "pointer",
														}
													})
													.append($("<div>", {
														id: i,
														class: "slider-thumb",
														css: {
															position: "absolute",
															top: "50%",
															marginTop: -thumbWidth/2,
															backgroundColor: "black",
															backgroundColor: colTable_0_Out,
															width: thumbWidth,
															height: thumbWidth,
															borderRadius: "100%",
															visibility: "hidden",
															opacity: 1,
															zIndex: 10,
														}
													}))))
								var filler = $("<td>", {
														html: "XXXXXXXXXXXX",
														id: "table_" + i + "_" + 4,
														css: {
															"min-width": 350,
															"background-color": colTable_In,
															"padding": 0,
															"margin": 0,
															"border-bottom": "solid 1px rgba(0,0,0,0.1)",
															"position": "relative",
															"text-align": "center",
															"color": "rgba(0,0,0,.1)",
														},
													});

								if (trial.forecast_industry || (k != 0)) return sliderstuff;
								else return filler;

							}

					)

					// current slider value
					.append($("<td>", {
						id: "table_" + i + "_" + 5,
						html: "",
						css: {
							"width": 50,
							"max-width": 50,
							"min-width": 50,
							"border-bottom": "solid 1px rgba(0,0,0,0.1)",
							"background-color": x7,
							"text-align": "center",
							"font-size": 20,
							"font-weight": 400,
							"color": colTable_0_Out,
						},
					})))

				};

				//$(".slider-thumb").draggable({axis: 'x', containment: 'parent'})

				var leftOff = $(".slider").offset().left;
				var containL = leftOff - 8;
				var containR = containL + $(".slider").width();
				$(".slider-thumb").draggable({axis: 'x', containment: [containL, 0, containR, 0]})

				var checked = 0;

				var toCheck = nFirms;
				if (!trial.forecast_industry) toCheck--;


				// slider things
				var currentSlider = -1;
				var currentVal = -1;
				$(document).on("mouseup", function () {

					if (currentSlider == -1) return;

					var ix = random_order_stocks[currentSlider[0].id];

					//trial_data.clickTimes[ix].push((new Date()).getTime())
					//trial_data.userValues[ix].push(currentVal)
					//trial_data.eventType[ix].push("mouseup")
					currentSlider = -1;

				})

				$(".sliderwrapper").on("mousedown drag", function (event) {

					currentSlider = $($(this).children()[0]);

					var slider = $($(this).children()[0]);
					var thumb = $(slider.children()[0]);
					var valDisp = $(document.getElementById("table_"+ slider[0].id + "_5"));

					if (valDisp.html() == '') checked++;

					if (checked == toCheck) {

						$(document.getElementById("proceed")).css("cursor", "pointer")
						$(document.getElementById("proceed")).css("opacity", 1)
						$(document.getElementById("proceed-text")).css("opacity", 1)
						$(document.getElementById("proceed")).on("click", function () {if (trial.feedback == true) feedback(); else done();})

					}

					var leftOff = slider.offset().left;
					var click = event.pageX;

					var newPos = click - thumb.width() / 2;

					newPos = newPos < leftOff - thumbWidth/2 ? leftOff - thumbWidth/2 : newPos;
					newPos = newPos > (leftOff + slider.width() - thumbWidth/2) ? (leftOff + slider.width() - thumbWidth/2) : newPos;

					thumb.offset({left: newPos})
					thumb.css("visibility", "visible")

					// ------ slider_min edit ---------

					//currentVal = slider_min + (slider_max * (newPos - leftOff) / (slider.width() - thumb.width()));
					currentVal = slider_min + slider_max * (newPos - leftOff + thumbWidth/2) / slider.width();
					currentVal = Math.round(currentVal);
					valDisp.html(currentVal)

					// ---- end slider_min edit -------

					var ix = random_order_stocks[slider[0].id];

					//trial_data.clickTimes[ix].push((new Date()).getTime())
					//trial_data.userValues[ix].push(currentVal)
					//trial_data.eventType[ix].push(event.type)

				});

				var error;
				var true_val;
				var npr;

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

				for (var i = 0; i < nFirms + 1; i++) {
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

					k = random_order_stocks[i];

					step = (yMax[k] - yMin[k]) / n_steps;

					for (var s = 0; s < n_steps; s++) density_x[i].push(yMin[k] + s * step);

					for (var p = 0; p < n_periods; p++) {

						mean = prior_mean[k];
						std = prior_std[k];

						for (var s = 0; s < n_steps; s++) {

							x = yMin[k] + s * step;
							y = (x - mean)**2;
							y = y / (2 * (std**2));
							y = -1 * y;
							y = Math.exp(y);
							y = (1 / Math.sqrt(2 * Math.PI * (std**2))) * y;
							// if (y > global_max_density) global_max_density = y; // rescale peak if needed
							density_y[i][p].push(y)

						}

					}

				}

				var all_charts = [];

				// Charts 1
				for (var i = 0; i < nFirms; i++) {

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
									data: npr_data_1[i],
									borderWidth: .001,
									pointRadius: 3,
									borderColor: "rgba(255,0,0,0)",
									pointBackgroundColor: "rgba(255,20,20,1)",
								},
								{
									data: npr_data_n[i],
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
							labels: density_x[i],
							datasets: [{
								data: density_y[i][t],
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

							over = ii;
							npr_chart = all_charts[over];

							$(document.getElementById("canvas_" + ii + "_density")).css("visibility","visible")

							$(document.getElementById("table_" + ii + "_0")).css("background-color",colTable_0_In)
							$(document.getElementById("table_" + ii + "_1")).css("background-color",colTable_In)
							$(document.getElementById("table_" + ii + "_2")).css("background-color",colTable_In)
							$(document.getElementById("table_" + ii + "_3")).css("background-color",colTable_In)
							$(document.getElementById("table_" + ii + "_4")).css("background-color",colTable_In4)
							$(document.getElementById("table_" + ii + "_5")).css("background-color",colTable_In4)

						},

						function () {


							over = nFirms + 1;

							$(document.getElementById("table_" + ii + "_0")).css("background-color",colTable_0_Out)
							$(document.getElementById("table_" + ii + "_1")).css("background-color",colTable_Out)
							$(document.getElementById("table_" + ii + "_2")).css("background-color",colTable_Out)
							$(document.getElementById("table_" + ii + "_3")).css("background-color",colTable_Out)
							$(document.getElementById("table_" + ii + "_4")).css("background-color",x7)
							$(document.getElementById("table_" + ii + "_5")).css("background-color",x7)

						},
					)

				}

				// Charts 2
				for (var i = 0; i < nFirms; i++) {

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

			}



}; // END OF TRIAL

//Return the plugin object which contains the trial
return plugin;
})();
