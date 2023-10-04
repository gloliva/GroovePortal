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
var cursor = new Array();
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


function setCursor() {
    if (inlet == 0) {
        cursor = new Array();
        cursor = arrayfromargs(arguments);

        if (points.length > 0 && coords.length > 0) {
            output();
        }
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

    var name;
    var bufferIdx;
    var cursorX = cursor[0];
    var pointX;
    var channel;
    for (var idx = 0; idx < points.length; idx++) {
        pointX = getCoordsByIndex(idx)[0];
        name = getBufferNameFromPoint(points[idx]);
        bufferIdx = getBufferIdxFromName(name);
        channel = calculateChannelGain(cursorX, pointX);
        matrixOut.push(bufferIdx, 0, channel[0], bufferIdx, 1, channel[1])
    }

    outlet(0, matrixOut);
}


/**************************
**** Utility Functions ****
***************************/
function calculateChannelGain(cursorX, pointX) {
    var diff = cursorX - pointX;
    var clippedDiff = Math.min(Math.max(diff, -0.5), 0.5);
    var channel = [0.5 + clippedDiff, 0.5 - clippedDiff];
    return channel;
}


function getBufferNameFromPoint(point) {
    // Handle Warp Point special case
    if (point[point.length - 1] == "]") {
        point = point.slice(0, point.length - 1);
    }
    
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