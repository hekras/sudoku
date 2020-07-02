const _greenbg = "#def1d7";
const _greenfg = "#155724";
const _redbg = "#f8d7da";
const _redfg = "#721c24";
const _grayfg = "#383d41";
const _graybg = "#e2e3e5";
const _bluefg = "#004085";
const _bluebg = "#cce5ff";
const _select = "s";
const _cell = "c";

var cell = [];
var cellarr = [];
var row = [];
var col = [];
var group = [];
var sel = { value: 0, el: null };
var t0 = performance.now();
var tick = 0;
var building = false;
var crashed = false;
var board_ready = false;

// init datastructures
function init_datastructures() {

    //group, cell & cellarr
    var ptr = 0;
    for (var j = 0; j < 9; j++) {
        group[j] = { id: [], cell: [], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9] };
        for (var i = 0; i < 9; i++) {
            var id = _cell + (j * 10 + i);
            cell[id] = {
                r: 0,
                c: 0,
                g: j,
                i: i,
                id: id,
                'el': null,
                'value': 0,
                'preset': false,
                'shadow': [false, false, false, false, false, false, false, false, false, false],
            };
            cellarr[ptr++] = cell[id];
            group[j].id[i] = id;
            group[j].cell[i] = cell[id];
        }
    }

    // rows
    for (var r = 0; r < 9; r++) {
        row[r] = { id: [], cell: [], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9] };
        var j = 3 * Math.floor(r / 3);
        var i = (r % 3) * 3;
        var n1 = 3 * Math.floor(j / 3);
        var n2 = n1 + 3;
        var m1 = 3 * Math.floor(i / 3);
        var m2 = m1 + 3;
        var ptr = 0;
        for (var n = n1; n < n2; n++) {
            for (var m = m1; m < m2; m++) {
                var id = _cell + (n * 10 + m);
                row[r].id[ptr] = id;
                row[r].cell[ptr] = cell[id];
                row[r].cell[ptr].r = r;
                ptr++;
            }
        }
    }

    // col
    for (var c = 0; c < 9; c++) {
        col[c] = { id: [], cell: [], numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9] };
        var j = Math.floor(c / 3);
        var i = (c % 3);
        var n1 = (j % 3);
        var n2 = 9;
        var m1 = (i % 3);
        var m2 = 9;
        var ptr = 0;
        for (var n = n1; n < n2; n += 3) {
            for (var m = m1; m < m2; m += 3) {
                var id = _cell + (n * 10 + m);
                col[c].id[ptr] = id;
                col[c].cell[ptr] = cell[id];
                col[c].cell[ptr].c = c;
                ptr++;
            }
        }
    }
}

function toggle_hint() {
    var dom = document.getElementById("hint");
    if (dom == null) {
        dom = document.createElement("div");
        dom.id = "hint";
        document.body.appendChild(dom);
    }
    else {
        document.body.removeChild(dom);
        render_shadow(0);
    }
}

function update_hint() {
    var dom = document.getElementById("hint");
    if (dom != null) {
        document.body.removeChild(dom);
        dom = document.createElement("div");
        dom.id = "hint";
        document.body.appendChild(dom);

        for (var j = 0; j < 9; j++) {
            var xo = 185 * (j % 3);
            var yo = 185 * Math.floor(j / 3);
            for (var i = 0; i < 9; i++) {
                var xoo = xo + 20 + 59 * (i % 3);
                var yoo = yo + 20 + 59 * Math.floor(i / 3);
                var id = _cell + (j * 10 + i);
                var count = 0;
                if (cell[id].value == 0) {
                    for (var k = 0; k < 9; k++) {
                        var el = document.createElement("div");
                        if (cell[id].shadow[k] == true) {
                            el.style.background = _graybg;
                        }
                        else {
                            el.innerHTML = '<div class="center">' + (k + 1) + '</div>';
                            count++;
                        }
                        el.style.border = "1px solid black";
                        el.style.width = "11px";
                        el.style.height = "11px";
                        el.style.left = xoo + 10 * (k % 3) + "px";
                        el.style.top = yoo + 10 * Math.floor(k / 3) + "px";
                        el.style.position = "absolute";
                        el.style.fontSize = "10px";
                        el.align = "center";
                        el.style.pointerEvents = "none";
                        //                        el.style.zIndex = 10;
                        dom.appendChild(el);
                    }
                    if (count < 2) {
                        cell[id].el.style.background = _bluebg;
                    }
                }
            }
        }
    }
}

function update_select_counters() {
    var counters = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    for (var n = 0; n < cellarr.length; n++) {
        counters[cellarr[n].value]++;
    }
    var winner = 0;
    for (var i = 1; i < 10; i++) {
        id = _select + "c" + i;
        document.getElementById(id).innerHTML = '<div class="center">' + counters[i] + '</div>';
        if (counters[i] === 9) {
            winner++;
        }
    }
    if (winner === 9) {
        document.getElementById('winner').innerHTML = '<div class="center">Solved!</div>'
    }
    else if (board_ready) {
        document.getElementById('winner').innerHTML = '<div class="center">Ready</div>'
    }
    else {
        document.getElementById('winner').innerHTML = '<div class="center"></div>'
    }
}

// init gui
function init_gui() {
    for (var j = 0; j < 9; j++) {
        var xo = 185 * (j % 3);
        var yo = 185 * Math.floor(j / 3);
        for (var i = 0; i < 9; i++) {
            var el = document.createElement("div");
            el.id = _cell + (j * 10 + i);
            el.style.border = "1px solid black";
            el.style.borderTop = (Math.floor(i / 3) == 0) ? "3px solid black" : "1px solid black";
            el.style.borderBottom = (Math.floor(i / 3) == 2) ? "3px solid black" : "1px solid black";
            el.style.borderLeft = ((i % 3) == 0) ? "3px solid black" : "1px solid black";
            el.style.borderRight = ((i % 3) == 2) ? "3px solid black" : "1px solid black";
            el.style.width = "60px";
            el.style.height = "60px";
            el.style.left = xo + 5 + 59 * (i % 3) + "px";
            el.style.top = yo + 5 + 59 * Math.floor(i / 3) + "px";
            el.style.position = "absolute";
            el.style.cursor = "pointer";
            el.style.fontSize = "40px";
            el.align = "center";
            cell[el.id].el = el;
            document.getElementById("soduko").appendChild(el);
            el.addEventListener("click", function () {
                var id = this.id;
                if (cell[id].preset === false) {
                    set_cell(id, sel.value, false);
                    render_shadow(cell[id].value);
                    update_select_counters();
                }
            });
        }
    }

    for (var i = 0; i < 10; i++) {
        var el = document.createElement("div");
        el.id = _select + i;
        el.style.border = "1px solid black";
        el.style.borderRadius = "3px";
        el.style.width = "60px";
        el.style.height = "60px";
        el.style.left = 560 + "px";
        el.style.top = 5 + 62 * i + "px";
        el.style.position = "absolute";
        el.style.cursor = "pointer";
        el.setAttribute("value", "" + i);
        el.style.fontSize = "40px";
        el.align = "center";
        if (i != 0) { el.innerText = '' + i; }
        document.getElementById("soduko").appendChild(el);
        el.addEventListener("click", function () {
            if (sel.el != null) {
                sel.el.style.background = 0;
                sel.el.style.color = "black";
            }
            sel.value = Number(this.getAttribute("value"));
            render_shadow(sel.value);
            this.style.background = _greenbg;
            this.style.color = _greenfg;
            sel.el = this;
        });
    }

    for (var i = 1; i < 10; i++) {
        var el = document.createElement("div");
        el.id = _select + "c" + i;
        el.className = "counter";
        el.style.width = "11px";
        el.style.height = "11px";
        el.style.left = 606 + "px";
        el.style.top = 7 + 62 * i + "px";
        el.style.position = "absolute";
        el.style.fontSize = "15px";
        el.innerHTML = '<div class="center">0</div>';
        el.style.pointerEvents = "none";
        document.getElementById("soduko").appendChild(el);
    }


    var top = 5;
    var el = document.createElement("div");
    el.id = "new";
    el.style.border = "3px solid #b8daff";
    el.style.borderRadius = "3px";
    el.style.width = "178px";
    el.style.height = "60px";
    el.style.left = "626px";
    el.style.top = top + "px";
    el.style.position = "absolute";
    el.style.cursor = "pointer";
    el.style.fontSize = "30px";
    el.style.background = _bluebg;
    el.style.color = _bluefg;
    el.innerHTML = '<div class="center">New</div>';
    document.getElementById("soduko").appendChild(el);
    el.addEventListener("click", function () {
        t0 = performance.now();
        state = 0;
        auto = true;
    });

    top += 62;
    el = document.createElement("div");
    el.id = "winner";
    el.style.border = "3px solid #b8daff";
    el.style.borderRadius = "3px";
    el.style.width = "178px";
    el.style.height = "60px";
    el.style.left = "626px";
    el.style.top = top + "px";
    el.style.position = "absolute";
    //el.style.cursor = "pointer";
    el.style.fontSize = "30px";
    el.style.background = _bluebg;
    el.style.color = _bluefg;
    //el.innerHTML = '<div class="center">Tick</div>';
    document.getElementById("soduko").appendChild(el);
    el.addEventListener("click", function () {
    });

    top += 62;
    el = document.createElement("div");
    el.style.border = "3px solid #b8daff";
    el.style.borderRadius = "3px";
    el.style.width = "178px";
    el.style.height = "60px";
    el.style.left = "626px";
    el.style.top = top + "px";
    el.style.position = "absolute";
    //el.style.cursor = "pointer";
    el.style.fontSize = "30px";
    el.style.background = _bluebg;
    el.style.color = _bluefg;
    //el.innerHTML = '<div class="center">reset</div>';
    document.getElementById("soduko").appendChild(el);

    top += 62;
    el = document.createElement("div");
    el.id = 'hint-button';
    el.style.border = "3px solid #b8daff";
    el.style.borderRadius = "3px";
    el.style.width = "178px";
    el.style.height = "60px";
    el.style.left = "626px";
    el.style.top = top + "px";
    el.style.position = "absolute";
    el.style.cursor = "pointer";
    el.style.fontSize = "30px";
    el.style.background = _bluebg;
    el.style.color = _bluefg;
    el.innerHTML = '<div class="center">hint</div>';
    document.getElementById("soduko").appendChild(el);
    el.addEventListener("click", function () {
        toggle_hint();
        update_hint();
    });

    top += 62;
    el = document.createElement("div");
    el.style.border = "3px solid #b8daff";
    el.style.borderRadius = "3px";
    el.style.width = "178px";
    el.style.height = "183px";
    el.style.left = "626px";
    el.style.top = top + "px";
    el.style.position = "absolute";
    //el.style.cursor = "pointer";
    el.style.fontSize = "20px";
    el.style.background = _bluebg;
    el.style.color = _bluefg;
    el.innerHTML = "<canvas></canvas>";
    document.getElementById("soduko").appendChild(el);

    top += 185;
    el = document.createElement("div");
    el.id = "crashed";
    el.style.border = "3px solid #b8daff";
    el.style.borderRadius = "3px";
    el.style.width = "178px";
    el.style.height = "60px";
    el.style.left = "626px";
    el.style.top = top + "px";
    el.style.position = "absolute";
    //el.style.cursor = "pointer";
    el.style.fontSize = "30px";
    el.style.background = _bluebg;
    el.style.color = _bluefg;
    el.innerHTML = '<div class="center"></div>';
    document.getElementById("soduko").appendChild(el);

    top += 62;
    el = document.createElement("div");
    el.id = "auto";
    el.style.border = "3px solid #b8daff";
    el.style.borderRadius = "3px";
    el.style.width = "178px";
    el.style.height = "60px";
    el.style.left = "626px";
    el.style.top = top + "px";
    el.style.position = "absolute";
    //el.style.cursor = "pointer";
    el.style.fontSize = "30px";
    el.style.background = _bluebg;
    el.style.color = _bluefg;
    //el.innerHTML = '<div class="center"></div>';
    document.getElementById("soduko").appendChild(el);
    el.addEventListener("click", function () {
        //auto = (!auto);
    });

    top += 62;
    el = document.createElement("div");
    el.id = "tick";
    el.style.border = "3px solid #b8daff";
    el.style.borderRadius = "3px";
    el.style.width = "178px";
    el.style.height = "60px";
    el.style.left = "626px";
    el.style.top = top + "px";
    el.style.position = "absolute";
    //el.style.cursor = "pointer";
    el.style.fontSize = "12px";
    el.style.background = _bluebg;
    el.style.color = _bluefg;
    //el.innerHTML = '<div class="center">Tick</div>';
    document.getElementById("soduko").appendChild(el);
    el.addEventListener("click", function () {
    });

    //top += 62;
    el = document.createElement("div");
    el.style.borderRadius = "3px";
    el.style.width = "548px";
    el.style.height = "61px";
    el.style.left = "5px";
    el.style.top = top + "px";
    el.style.position = "absolute";
    el.style.cursor = "pointer";
    el.style.fontSize = "40px";
    el.innerHTML = 'Sudoku 2020, by Henryk';
    document.getElementById("soduko").appendChild(el);


}

function set_all_shadow() {
    for (var n = 0; n < cellarr.length; n++) {
        for (var k = 0; k < 9; k++) {
            cellarr[n].shadow[k] = false;
        }
    }

    for (var n = 0; n < cellarr.length; n++) {
        if (cellarr[n].value > 0) {
            var value = cellarr[n].value;
            var g = cellarr[n].g;
            var r = cellarr[n].r;
            var c = cellarr[n].c;
            for (var m = 0; m < 9; m++) {
                group[g].cell[m].shadow[value - 1] = true;
                row[r].cell[m].shadow[value - 1] = true;
                col[c].cell[m].shadow[value - 1] = true;
            }
        }
    }
}

function render_shadow(value) {
    for (var n = 0; n < cellarr.length; n++) {
        if (cellarr[n].value === 0) {
            cellarr[n].el.style.background = 0;
            cellarr[n].el.style.background = (cellarr[n].shadow[value - 1] === true) ? _graybg : 0;
        }
        else {
            cellarr[n].el.style.background = (cellarr[n].preset === true) ? _redbg : _greenbg;
            cellarr[n].el.style.color = (cellarr[n].preset === true) ? _redfg : _greenfg;
        }
    }
}

function set_cell(id, value, preset) {
    cell[id].value = value;
    cell[id].preset = preset;
    cell[id].el.innerText = (value > 0) ? value : "";
    //    document.getElementById(id).style.background = _bluebg;
    set_all_shadow();
    render_shadow(value);
    update_hint();
}

function set_cell_quick(id, value, preset) {
    cell[id].value = value;
    cell[id].preset = preset;
    cell[id].el.innerText = (value > 0) ? value : "";
    //    document.getElementById(id).style.background = _bluebg;
    set_all_shadow();
}



function remove_number_from_row(r, number) {
    var newnumbers = [];
    var p = 0;
    for (var m = 0; m < row[r].numbers.length; m++) {
        if (row[r].numbers[m] != number) {
            newnumbers[p++] = row[r].numbers[m];
        }
    }
    row[r].numbers = newnumbers;
}

var toggle = false;
var state = 0;
var rowcounter = 0;
var colcounter = 0;
var auto = false;
var blink = false;

function blinker() {
    blink = (blink === false) ? true : false;
    if (auto) {
        document.getElementById('auto').style.background = (blink) ? _bluebg : 0;
        document.getElementById('auto').innerHTML = '<div class="center">Auto</div>';

        if (blink === true) {
            build_soduko();
        }
    }
    else {
        document.getElementById('auto').style.background = _bluebg;
        document.getElementById('auto').innerHTML = '<div class="center"></div>';
    }

    if (document.getElementById('hint') != null) {
        document.getElementById('hint-button').style.background = (blink == true) ? _bluebg : 0;
    }
    else {
        document.getElementById('hint-button').style.background = _bluebg;
    }

    if (building) {
        document.getElementById('new').style.background = (blink == true) ? _bluebg : 0;
    }
    else {
        document.getElementById('new').style.background = _bluebg;
    }

}

function reset_board() {
    for (var n = 0; n < cellarr.length; n++) {
        cellarr[n].value = 0;
        cellarr[n].preset = false;
        cellarr[n].el.innerText = "";
    }
    set_cell('c0', 0, false);
}

function statemachine() {
    if (auto) {
        toggle = (toggle === false) ? true : false;
        if (toggle === true) {
            build_soduko();
        }
    }
}

var tick_state = {
    blanks: 0,
    crash: 10,
};

function build_board() {
    crashed = false;

    for (var r = 0; r < 9; r++) {
        row[r].numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    // create valid bord
    var err = false;
    for (var r = 0; r < 9;) {
        for (var c = 0; c < 9;) {
            var err = false;
            for (var i = r; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    if (row[i].cell[j].value === 0) {
                        var count = 0;
                        for (var k = 0; k < 9; k++) {
                            if (row[i].cell[j].shadow[k] === false) {
                                count++;
                            }
                        }
                        if (count === 0) {
                            err = true;
                        }
                    }
                }
            }
            if (!err) {
                var validnumbers = [];
                var vp = 0;
                for (var k = 0; k < row[r].numbers.length; k++) {
                    var val = row[r].numbers[k];
                    if (cell[row[r].id[c]].shadow[val - 1] === false) {
                        validnumbers[vp++] = val;
                    }
                }

                var ptr = Math.floor(validnumbers.length * Math.random());
                var value = validnumbers[ptr];
                set_cell_quick(row[r].id[c], value, true);
                remove_number_from_row(r, value)
                c++;
                if (c == 9) {
                    r++;
                }
            }
            else {
                row[r].numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                for (var m = 0; m < 9; m++) {
                    set_cell_quick(row[r].id[m], 0, true);
                }
                c = 0;
            }
        }
    }

    // remove numbers and try solving puzzle
    var blanks = 0;
    var crash = 250;
    do {
        for (var n = 0; n < cellarr.length; n++) {
            if (!cellarr[n].preset) {
                set_cell_quick(cellarr[n].id, 0, false);
            }
        }

        var ptr = Math.floor(cellarr.length * Math.random());
        if (cellarr[ptr].preset) {
            var saved_value = cellarr[ptr].value;
            set_cell_quick(cellarr[ptr].id, 0, false);

            var hints = 0;
            for (var n = 0; n < cellarr.length; n++) {
                if (cellarr[n].value === 0) {
                    var count = 0;
                    for (var k = 0; k < 9; k++) {
                        if (cellarr[n].shadow[k] === false) {
                            count++;
                        }
                    }
                    if (count === 1) {
                        hints++;
                    }
                }
            }

            var cells_set = 0;
            do {
                var again = false;
                cells_set = 0;
                for (var n = 0; n < cellarr.length; n++) {
                    if (cellarr[n].value === 0) {
                        var count = 0;
                        var value = 0;
                        for (var k = 0; k < 9; k++) {
                            if (cellarr[n].shadow[k] === false) {
                                count++;
                                value = k + 1;
                            }
                        }
                        cells_set++;
                        if (count === 1) {
                            set_cell_quick(cellarr[n].id, value, false);
                            again = true;
                        }
                    }
                }
            } while (again);

            if (cells_set > 0) {
                //console.log(blanks + ":" + cells_set + ":" + hints + " - undo");
                set_cell_quick(cellarr[ptr].id, saved_value, true);
                crash--;
            }
            else {
                blanks++;
            }
        }
    } while ((blanks < 40) || (hints > 1) || (cells_set > 0));

    console.log("crash: " + crash);
    crashed = (crash <= 0);
    if (crashed) {
        var el = document.getElementById("crashed");
        el.innerHTML = '<div class="center">Crashed</div>';
        el.style.background = _redbg;
        el.style.color = _redfg;
    }
    else {
        var el = document.getElementById("crashed");
        el.innerHTML = '<div class="center">Ok</div>';
        el.style.background = _greenbg;
        el.style.color = _greenfg;
    }

    for (var n = 0; n < cellarr.length; n++) {
        if (!cellarr[n].preset) {
            set_cell_quick(cellarr[n].id, 0, false);
        }
    }

    render_shadow(0);
    update_hint();
}

function build_soduko() {
    switch (state) {
        case 0: // init gui and structures
            for (var r = 0; r < 9; r++) {
                row[r].numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            }
            reset_board();
            board_ready = false;
            rowcounter = 0;
            state = 1;
            break;
        case 1: // loop of collumns
            colcounter = 0;
            state = 2;
            break;
        case 2: // loop of rows
            var r = rowcounter;
            var n = colcounter;

            var err = false;
            for (var i = rowcounter; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    if (row[i].cell[j].value === 0) {
                        var count = 0;
                        for (var k = 0; k < 9; k++) {
                            if (row[i].cell[j].shadow[k] === false) {
                                count++;
                            }
                        }
                        if (count === 0) {
                            err = true;
                        }
                    }
                }
            }

            if (!err) {
                var validnumbers = [];
                var vp = 0;
                for (var k = 0; k < row[r].numbers.length; k++) {
                    var val = row[r].numbers[k];
                    if (cell[row[r].id[n]].shadow[val - 1] === false) {
                        validnumbers[vp++] = val;
                    }
                }

                var ptr = Math.floor(validnumbers.length * Math.random());
                var value = validnumbers[ptr];

                var el = document.getElementById(_select + value);
                if (sel.el != null) {
                    sel.el.style.background = 0;
                    sel.el.style.color = "black";
                }
                sel.value = value;
                el.style.background = _greenbg;
                el.style.color = _greenfg;
                sel.el = el;
                set_cell(row[r].id[n], value, true);
                update_select_counters();
                remove_number_from_row(r, value)
                colcounter++;
                if (colcounter == 9) {
                    rowcounter++;
                    state = 1;
                }
                if (rowcounter == 9) {
                    rowcounter = 50; // using rowcounter as pause counter
                    state = 4;
                }
            }
            else {
                state = 3;
            }
            break;
        case 3:
            row[rowcounter].numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            for (var m = 0; m < 9; m++) {
                row[rowcounter].cell[m].el.innerHTML = "";
                row[rowcounter].cell[m].el.style.color = "black";
                row[rowcounter].cell[m].el.style.background = "white";
                set_cell(row[rowcounter].id[m], 0, false);
            }
            update_select_counters();
            state = 1;
            break;
        case 4:
            state = (--rowcounter < 0) ? 10 : 4;
            break;

        case 10:
            state = 20;
            tick_state.blanks = 0;
            tick_state.crash = 10;
            render_shadow(0);
            break;

        case 20:
            var carr = [];
            var ptr = 0;
            for (var n = 0; n < cellarr.length; n++) {
                if (!cellarr[n].preset) {
                    set_cell_quick(cellarr[n].id, 0, false);
                }
                else {
                    carr[ptr++] = cellarr[n];
                }
            }

            var ptr = Math.floor(carr.length * Math.random());
            var saved_value = carr[ptr].value;
            set_cell_quick(carr[ptr].id, 0, false);

            var hints = 0;
            for (var n = 0; n < cellarr.length; n++) {
                if (cellarr[n].value === 0) {
                    var count = 0;
                    for (var k = 0; k < 9; k++) {
                        if (cellarr[n].shadow[k] === false) {
                            count++;
                        }
                    }
                    if (count === 1) {
                        hints++;
                    }
                }
            }

            var cells_set = 0;
            do {
                var again = false;
                cells_set = 0;
                for (var n = 0; n < cellarr.length; n++) {
                    if (cellarr[n].value === 0) {
                        var count = 0;
                        var value = 0;
                        for (var k = 0; k < 9; k++) {
                            if (cellarr[n].shadow[k] === false) {
                                count++;
                                value = k + 1;
                            }
                        }
                        cells_set++;
                        if (count === 1) {
                            set_cell_quick(cellarr[n].id, value, false);
                            again = true;
                        }
                    }
                }
            } while (again);

            if (cells_set > 0) {
                //console.log(tick_state.blanks + ":" + cells_set + ":" + hints + ":" + tick_state.crash + " - undo");
                set_cell_quick(carr[ptr].id, saved_value, true);
                if (tick_state.crash-- <= 0) {
                    state = 30;
                }
            }
            else {
                if ((tick_state.blanks++ > 40) && (cells_set > 2)) {
                    state = 30;
                }
                tick_state.crash = 10;
            }
            update_select_counters();
            render_shadow(0);
            update_hint();
            cellarr[ptr].el.style.background = _bluebg;
            break;

        case 30:
            for (var n = 0; n < cellarr.length; n++) {
                if (!cellarr[n].preset) {
                    set_cell(cellarr[n].id, 0, false);
                }
            }
            state = 40;
            break;

        case 40:
            rowcounter = 50; // using rowcounter as pause counter
            state = 50;
            break;

        case 50:
            auto = false;
            board_ready = true;
            render_shadow(0);
            update_hint();
            update_select_counters();
            break;


    }
}

function initCells() {
    for (var n = 0; n < 9; n++) {
        for (var m = 0; m < 9; m++) {
            var id = _cell + (n * 10 + m);
            cell[id].el.innerHTML = "";
            cell[id].el.style.color = "black";
            cell[id].el.style.background = "white";
            set_cell(id, 0, false);
        }
    }

    var savedCellsJson = localStorage.getItem("soduko");
    if (savedCellsJson != null) {
        var compressed = JSON.parse(savedCellsJson);
        for (var n = 0; n < compressed.length; n++) {
            set_cell(compressed[n].i, compressed[n].v, true);
        }
        t0 = performance.now();
        var t1 = localStorage.getItem("sodukotime");
        t0 = (t1 != null) ? t0 - t1 : t0;
        set_all_shadow();
    }
    else {
        var compressed = [];
        var i = 0;
        for (var n = 0; n < 9; n++) {
            for (var m = 0; m < 9; m++) {
                var id = _cell + (n * 10 + m);
                if (cell[id].value != 0) {
                    compressed[i++] = {
                        'i': id,
                        'v': cell[id].value
                    };
                }
            }
        }
        localStorage.setItem("soduko", JSON.stringify(compressed));
        t0 = performance.now();
    }
}

function animateloop() {
    dc.clearRect(0, 0, width, height);

    var dato = new Date();
    var t1 = performance.now();
    var radius = (width < height) ? width / 2 : height / 2;
    tick++;
    if ((tick % 1) == 0) statemachine();
    if ((tick % 20) == 0) blinker();

    dc.fillStyle = "black";
    for (var j = 0; j < 60; j++) {
        var a = j / 60 * 2 * Math.PI;
        var r = ((j % 5) == 0) ? 0.02 : 0.005;
        dc.beginPath();
        dc.arc(width / 2 + 0.9 * radius * Math.sin(a), height / 2 - 0.9 * radius * Math.cos(a), radius * r, 0, 6.28);
        dc.fill();
    }

    var dt = t1 - t0;
    localStorage.setItem("sodukotime", dt);

    var seconds = dt / 1000 / 60 * 2 * Math.PI;
    var minutes = seconds / 60;
    var hours = minutes / 12;

    dc.strokeStyle = "black";
    dc.lineWidth = 2;
    dc.beginPath();
    dc.moveTo(width / 2, height / 2);
    dc.lineTo(width / 2 + 0.9 * radius * Math.sin(seconds), height / 2 - 0.9 * radius * Math.cos(seconds));
    dc.moveTo(width / 2, height / 2);
    dc.lineTo(width / 2 + 0.85 * radius * Math.sin(minutes), height / 2 - 0.85 * radius * Math.cos(minutes));
    dc.moveTo(width / 2, height / 2);
    dc.lineTo(width / 2 + 0.5 * radius * Math.sin(hours), height / 2 - 0.5 * radius * Math.cos(hours));
    dc.stroke();
    dc.fillStyle = "black";
    dc.beginPath();
    dc.arc(width / 2, height / 2, radius * 0.05, 0, 6.28);
    dc.fill();
}



/***********************************
// main - program starts here !!!!!!
************************************/
init_datastructures();
init_gui();
initCells();
render_shadow(0);

const canvas = document.querySelector("canvas");
const width = canvas.width = 170;
const height = canvas.height = 170;
const dc = canvas.getContext("2d");
window.setInterval(animateloop, 1000 / 60);

