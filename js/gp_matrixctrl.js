/*
    Handles formatting messages to send to `thispatcher` object for
    dynamically creating groove~ objects and connecting them to a `route` object.
*/

inlets = 3;
outlets = 1;
autowatch = 1;


/***********************
**** Input / Output ****
************************/
var points = new Array();
var coords = new Array();
var matrixOut = new Array();


/****************************
**** Max Input Functions ****
*****************************/
function bang() {
    if (inlet == 0) {
        output();
    }
}


function setPoints() {
    if (inlet == 1) {
        points = new Array();
        points = arrayfromargs(arguments);
    }
}


function setCoords() {
    if (inlet == 2) {
        coords = new Array();
        coords = arrayfromargs(arguments);
    }
}


/*****************************
**** Max Output Functions ****
******************************/
function output() {
    matrixOut = new Array();

    var tmp = points[0];
    var name = getBufferNameFromPoint(tmp);
    var bufferIdx = getBufferIdxFromName(name);

    matrixOut.push(tmp, name, bufferIdx)
    outlet(0, matrixOut);
}


/**************************
**** Utility Functions ****
***************************/
function getBufferNameFromPoint(point) {
    var split = point.split("]");
    var name = "";
    if (split.length > 1) {
        name = split[ split.length - 1];
    } else {
        name = split[0];
    }

    if (name[0] == "[") {
        name = name.slice(1);
    }

    return name;
}

function getBufferIdxFromName(name) {
    return parseInt(name.slice(1)) - 1;
}

function getCoordsByIndex(index) {
    var startIndex = index * 2;

    if (startIndex >= 0 && startIndex + 1 < coords.length) {
        var x = coords[startIndex];
        var y = coords[startIndex + 1];
        return [x, y];
    } else {
        return null;
    }
}