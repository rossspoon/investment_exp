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



var lineWidth = 1;
var dotRadius = 5;

//----------------------- end color palette -------------------



//-------------  Adding the text box for investment amount		
function make_investment_td(idx) {

    var td = $("<td>", {
        id: "table_" + idx + "_" + 4,
        class: 'investment-cell',
      },
    );

    var div = $("<div>",{
        class: "inv-input-container",
    });
    td.append(div);

    var text_box = $("<input>", {
        id: "input_" + idx,
        class: "inv-input",
        type: "text",
    });
    div.append(text_box);

    return td;
}


//-----------   Create a table cell for the result column
function make_result_td(idx){
    var td = $("<td>", {
        id: "table_" + idx + "_5",
        class: "result-cell",
    });

    var result_div= $("<div>", {
        id: "result_amt_" + idx,
        class: "result-amt",
        html: "&nbsp;",
    });
    td.append(result_div);

    return td;
}


function get_info_table(endowment) {
    var table = $("<table>", {
        id: "info_table",
        class: "info-table",
    });

    var header_row = $("<tr>", {
        id: "info_head",
        class: "table-head",
    });
    table.append(header_row)

    var head_endow_td = $("<td>", {
        class: "head-cell",
        html: "Endowment",
    });
    header_row.append(head_endow_td);

    var head_bal_td = $("<td>", {
        class: "head-cell",
        html: "Balance",
    });
    header_row.append(head_bal_td);

    var head_result_td = $("<td>", {
        class: "head-cell",
        html: "Result",
    });
    header_row.append(head_result_td);

    // information row
    var info_row= $("<tr>", {
        id: "info_head",
    });
    table.append(info_row)

    var endow_td = $("<td>", {
        html: "" + endowment,
    });
    info_row.append(endow_td);

    var bal_td = $("<td>", {
        id: "balance_amount",
        html: "" + endowment,
    });
    info_row.append(bal_td);

    var result_td = $("<td>", {
        id: "result_amount",
        html: "&nbsp;",
    });
    info_row.append(result_td);

    return table;
}

function get_spacer_div(instr){
    var div = $("<div>", {
        class: instr ? "top-spacer-instr": "top-spacer",
        html: "&nbsp;",
    });

    return div;
}

function get_header_cell(content, elem_id, text_align){
    var colspan = 1;
    if (content == "factor"){
        colspan = 2;
    }

    td = $("<td>", {
        id: "table_header_" + elem_id,
        html: content,
        colspan: colspan,
        css: {"text-align": text_align},
        class: "header-cell",
    });

    return td
}



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

                trial_data.investments = [];
                trial_data.returns = [];
                trial_data.results = [];
                trial_data.total_result = 0;

                trial_data.show_history = trial.show_history;

                trial_data.endowment = trial.endowment;
                trial_data.balance = trial.endowment;

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


                //------------------------- Charts --------------------
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
                //------------------------- end Charts --------------------

                if (trial.show_history) {
                        var npr_data_1 = jsPsych.data.getLastTrialData().npr_last_1;
                        var npr_data_n = jsPsych.data.getLastTrialData().npr_last_n;
                } else {
                        var npr_data_1 = [];
                        var npr_data_n = [];
                }


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


                var feedbackDone = false;

                function feedback () {
                    total_reward = 0;

                    for (var i = 0; i < nFirms; i++) {
                            k = random_order_stocks[i];

                            mean = prior_mean[k];
                            std = prior_std[k];

                            draw = normal(mean, std);
                            inv = Number($("#input_"+i).val());
                            result = (inv + (draw * inv)/100);

                            $("#result_amt_"+i).html(result.toFixed(2));
                            total_reward += result;
                    }

                    $("#result_amount").html(total_reward.toFixed(2));

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
                        class: "btn btn-off",
                })
                .append($("<p>", {
                        html: "submit",
                        "id": "proceed-text",
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

                        //Add a div to go behind the fix-in-place header
                        display_element.append( get_spacer_div(instructions) )

                        //Add Main Information Table
                        display_element.append( get_info_table(trial_data.endowment) );

                        // Create table
                        display_element.append($("<table>", {
                                "id": "table",
                                "css": {

                                        "position": "relative",
                                        "width": "80%",
                                        "min-width": 500,
                                        "max-width": 700,

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
                                        class: "main-table-row",
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

                                .append(get_header_cell("names", 0, "left"))

                                // y-axis
                                .append(get_header_cell("factor", 1, "center"))

                                // npr
                                .append(get_header_cell("values", 2, "center"))

                                // investment input
                                .append(get_header_cell("Investment Amount", 3, "center"))

                                // result column
                                .append(get_header_cell("Result", 4, "center"))
                                );
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

                                // endowment or investment text box
                                .append( make_investment_td(i) )
                                .append( make_result_td(i) )
                                )
                        };


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
                                                                //data: npr_data_1[i],
                                                                data: [], //don't highlight last point in red
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
                                                        // mode: null,
                                                        mode: 'x',
                                                intersect: false,
                                                },
                                                tooltips: {
                                                        // enabled: false,
                                                        mode: 'x',
                                                intersect: false,
                                                },
                                                plugins: {
                                                        datalabels: {
                                                                display: function (context) {
                                                                        return context.datasetIndex == 0;
                                                                },
                                                                display: false, //don't show data label for last point
                                                                // display: true,
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
                                                                        // return Math.round(context.chart.data.datasets[0].data[context.dataIndex].y); //show last one point?
                                                                        return Math.round(context.chart.data.datasets[1].data[context.dataIndex].y); //show last n points?
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

                    //event listeners
                    add_event_listeners();
                }



    //  Calling this function is the last thing the that play() function does
    //  This is going to add event listeners to the DOM elements created by the
    //  play() function.
    var time_out_identifier = null;
    function add_event_listeners(){
        $('.inv-input').on('focus', function(){
            current_balance = trial_data.balance;
            $(this).attr('balance', current_balance);
        });

        $('.inv-input').on('keyup', function(){
            //There might be a time out in place that will update the
            // balance.  This keyup event should preempt that timer
            if (time_out_identifier != null){
                clearTimeout(time_out_identifier);
            }
            $('.inv-input-container').removeClass('inv-err');
            $('#proceed').removeClass('btn-on');

            this.value = this.value.replace(/[^0-9]/g, '');


            //current_balance = $(this).attr('balance');
            // Add up all investment choices
            var sum = 0
            $('.inv-input').each(function(){
                val = this.value;
                if (val) {
                    sum += parseInt(val);
                }
            });
            
            
            //Test if the value is less than the available balance
            container_div = $(this).parent('.inv-input-container');
            if (sum > trial_data.endowment) {
                container_div.addClass('inv-err');
                if (current_balance > 0){
                    container_div.attr('err_msg', "Must be " + current_balance + " or less");
                } else {
                    container_div.attr('err_msg', "Reduce investment amounts");
                }
            } else {
                container_div.removeClass('inv-err');
            }

            //all is well
            // update the balance row
            // Give a pause before updating the balance information
            // This gives time for typing multi-digit inputs
            time_out_identifier = setTimeout( function(){
                trial_data.balance = trial_data.endowment - sum
                $('#balance_amount').html("" + trial_data.balance);
                current_balance = trial_data.balance;


                if (sum == trial_data.endowment){
                    $('#proceed').addClass('btn-on');
                } else {
                    $('#proceed').removeClass('btn-on');
                }
            }, 500);
        });

        $("#proceed").on("click", function () {if (trial.feedback == true) feedback(); else done();});
    }

}; // END OF TRIAL

//Return the plugin object which contains the trial
return plugin;
})();

