/*
    Utility functions for buffers that are easier to program in js
    compared to Max or odot scripting.
*/

inlets = 1;
outlets = 1;
autowatch = 1;


/***********************
**** Input / Output ****
************************/
var prevNames = new Array();
var currNames = new Array();


/****************************
**** Max Input Functions ****
*****************************/
function setCurrNames() {
    currNames = arrayfromargs(arguments);
}


function setPrevNames() {
    prevNames = arrayfromargs(arguments);
}


/*********************
**** Buffer Utils ****
**********************/
function extractBuffers() {
    var names = new Array();
    var fullNames = arrayfromargs(arguments);

    for (var i = 0; i < fullNames.length; i++) {
        names.push(
            extractBufferFromPoint(fullNames[i])
        );
    }
    outlet(0, names);
}


function mutePreviousLayer() {
    post(currNames);
    post(prevNames);
    post();
    var muteNames = new Array();
    var buf;
    var mute;
    for (var i = 0; i < prevNames.length; i++) {
        buf = prevNames[i];
        mute = true;
        for (var j = 0; j < currNames.length; j++) {
            if (buf === currNames[j]) {
                mute = false;
                break;
            }
        }
        if (mute) {
            muteNames.push(buf);
        }
    }
    outlet(0, muteNames);
}


function extractBufferFromPoint(fullName) {
    // Handle Warp fullName special case
    if (fullName[fullName.length - 1] == "]") {
        fullName = fullName.slice(0, fullName.length - 1);
    }
    
    var split = fullName.split("]");
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
