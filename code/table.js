
//-------------  Adding the text box for investment amount		
function make_investment_td(idx, show_textbox) {

    var td = $("<td>", {
        id: "table_" + idx + "_" + 4,
        class: 'investment-cell td_field',
      },
    );

    if (!show_textbox){
        td.html = "&nbsp;";
        return td;
    }

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

function make_return_td(idx) {
    var td = $("<td>", {
        id: "table_" + idx + "_" + "ret",
        class: 'return-cell td_field',
      },
    );

    var return_div= $("<div>", {
        id: "return_amt_" + idx,
        class: "return-amt right-al",
        html: "&nbsp;",
    });
    td.append( return_div );

    return td;
}


//-----------   Create a table cell for the result column
function make_result_td(idx){
    var td = $("<td>", {
        id: "table_" + idx + "_5",
        class: "result-cell td_field",
    });

    var result_div= $("<div>", {
        id: "result_amt_" + idx,
        class: "result-amt right-al",
        html: "&nbsp;",
    });
    td.append(result_div);

    return td;
}

function make_cash_row() {
    var row = $("<tr>", {
        id: "cash_row",
        class: "tr_main",
    });

    var name_td = $("<td>", {
                id: "cash_idx",
                class: 'idx_td',
                html: 'Cash',
    });
    row.append(name_td);
    
    // skip the three graphic td's with a colspan 3
    var graph_td = $("<td>", {
                id: "cash_graph",
                class: 'td_field',
                colspan: 3,
                html: '&nbsp',
    });
    row.append(graph_td);
    
    //investment amt
    //var inv_td = make_investment_td('c', false);
    //row.append(inv_td);
    // Cash Investment cell
    var inv_td = $("<td>", {
        id: "cash_inv",
        class: 'td_field',
        html: "100",
    });
    row.append(inv_td);
    
    var ret_td = $("<td>", {
                id: "cash_ret",
                class: 'td_field',
                html: '&nbsp',
    });
    row.append(ret_td);
    
    var res_td = make_return_td('c');
    row.append(res_td);

    return row;
}

function make_totals_row() {
    var row = $("<tr>", {
        id: "totals_row",
        class: "tr_bottom",
    });

    var name_td = $("<td>", {
                id: "totals_idx",
                class: 'idx_td_bottom',
                html: 'Total',
    });
    row.append(name_td);
    
    // skip the three graphic td's with a colspan 3
    var graph_td = $("<td>", {
                id: "totals_graph",
                class: 'td_bottom',
                colspan: 3,
                html: '&nbsp',
    });
    row.append(graph_td);
    
    // Total Investment cell
    var tot_td = $("<td>", {
        id: "totals_tot",
        class: 'td_bottom',
        html: "&nbsp;",
    });
    row.append(tot_td);
    
    // skip the return column
    var graph_td = $("<td>", {
                id: "totals_ret",
                class: 'td_bottom',
                html: '&nbsp',
    });
    row.append(graph_td);
    
    // Total Result cell
    var res_td = $("<td>", {
        id: "totals_res",
        class: 'td_bottom',
        html: "&nbsp;",
    });
    row.append(res_td);

    return row;
}


function get_spacer_div(){
    var div = $("<div>", {
        class: "top-spacer",
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

// Create table
function makeTable(nfirms, ros, names, show_investment) {
    tab = $("<table>", {
            "id": "main_table",
        });

    tab.append(make_header_row());

    for (var i = 0; i < nfirms; i++) {
        tab.append(make_table_row(i, ros, names, show_investment));
    }
    
    // Cash Row
    tab.append(make_cash_row());

    // Total Row
    tab.append(make_totals_row());

    return tab;
}

// Column headers

function make_header_row() {
    tr = $("<tr>", {
            "id": "table_header",
            class: "main-table-row header-row",
    })
    .append(get_header_cell("names", 0, "left"))

    // y-axis
    .append(get_header_cell("factor", 1, "center"))

    // npr
    .append(get_header_cell("values", 2, "center"))

    // investment input
    .append(get_header_cell("Investment Amount", 3, "center"))

    // stock return column
    .append(get_header_cell("Return", "ret", "center"))

    // result column
    .append(get_header_cell("Result", 4, "center"));

    return tr;
}



function make_table_row(i, ros, names, show_investment) {
    k = ros[i];

    tr = $("<tr>", {
            "id": "table_" + i,
            "class": "tr_main",
    });

    // names
    td = $("<td>", {
            "id": "table_" + i + "_" + 0,
            "html": names[k],
            "class": "idx_td",
    });
    tr.append(td);


    //density cell
    td = $("<td>", {
            id: "table_" + i + "_" + 2,
            class: "td-dense",
    });
    tr.append(td);
    canv_d = $("<canvas>", {
            id: "canvas_" + i + "_density",
            class: "canvas-dense",
    });
    td.append(canv_d);


    //y-axis
    td = $("<td>", {
            id: "table_" + i + "_" + 1,
            class: "td-axis",
    });
    tr.append(td);
    canv_ax = $("<canvas>", {
            id: "canvas_" + i + "_axis",
            //width: "200px",
            height: "189px",
            class: "canvas-axis",
    });
    td.append(canv_ax);

    // npr
    td = $("<td>", {
            id: "table_" + i + "_" + 3,
            class: "td-npr",
    });
    tr.append(td);
    canv_npr = $("<canvas>", {
            id: "canvas_" + i + "_npr",
            width: "150px",
            height: "180px",
    });
    td.append(canv_npr);

    tr.append( make_investment_td(i, show_investment) )
    tr.append( make_return_td(i) )
    tr.append( make_result_td(i) )

    return tr;
}
