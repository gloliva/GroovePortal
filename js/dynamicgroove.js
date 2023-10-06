/*
    Handles formatting messages to send to `thispatcher` object for
    dynamically creating groove~ objects and connecting them to a `route` object.
*/

inlets = 1;
outlets = 2;
autowatch = 1;

/*************************
**** String Templates ****
**************************/
// Route object
var globalRouteObjectTemplate = "script|newobject|newobj|@text|route <route>|@varname|global-groove-route|@patching_position|<x>|<y>";
var globalRouteSizeTemplate = "script|size|global-groove-route|<size>|22";
var inletGlobalRouteConnectionTemplate = "script|connect|target-groove-inlet|0|global-groove-route|0";
var subRouteObjectTemplate = "script|newobject|newobj|@text|route g1 g2 g3 sig amp|@varname|<groove>-route|@patching_position|<x>|<y>";
var subRouteSizeTemplate = "script|size|<groove>-route|144|22";
var globalRouteSubRouteConnectionTemplate = "script|connect|global-groove-route|<outlet>|<groove>-route|0";

// Groove objects
var grooveObjectTemplate = "script|newobject|newobj|@text|groove~ <buffer>|@varname|<groove>|@fixwidth|1|@patching_position|<x>|<y>";
var subRouteGrooveConnectionTemplate = "script|connect|<groove>-route|<outlet>|<groove>|<outlet>";

// Sig objects
var sigObjectTemplate = "script|newobject|newobj|@text|sig~ 1.|@varname|<groove>-sig|@fixwidth|1|@patching_position|<x>|<y>";
var subRouteSigConnectionTemplate = "script|connect|<groove>-route|3|<groove>-sig|0";
var sigGrooveConnectionTemplate = "script|connect|<groove>-sig|0|<groove>|0";

// Amplitude Multiplication objects
var ampObjectTemplate = "script|newobject|newobj|@text|*~ 1.|@varname|<groove>-amp|@fixwidth|1|@patching_position|<x>|<y>";
var ampSizeTemplate = "script|size|<groove>-amp|119|22";
var grooveAmpConnectionTemplate = "script|connect|<groove>|0|<groove>-amp|0";
var subRouteAmpConnectionTemplate = "script|connect|<groove>-route|4|<groove>-amp|1";

// Matrix object
var matrixObjectTemplate = "script|newobject|newobj|@text|matrix~ <num> 2|@varname|groove-matrix||@patching_position|<x>|<y>";
var matrixSizeTemplate = "script|size|groove-matrix|<size>|22";
var ampMatrixConnectionTemplate = "script|connect|<groove>-amp|0|groove-matrix|<inlet>";
var matrixOutletConnectionTemplate = "script|connect|groove-matrix|<outlet>|dg-audio-out-<outlet>|0";

// Matrixctrl object
var matrixctrlSizeTemplate = "script|size|dg-matrixctrl|<size>|144";
var matrixctrlMatrixConnectionTemplate = "script|connect|dg-matrixctrl|0|groove-matrix|0";

// Misc scripting
var deleteObjectTemplate = "script|delete|<obj>";


/***********************
**** Input / Output ****
************************/
var outMsg = new Array();
var grooveChange = 0;
var numGrooves = 1;


/******************
**** Constants ****
*******************/
var numGrooveInlets = 3;
var numAudioOutputs = 2;


/***************************
**** Position Variables ****
****************************/
var objectOffsetX = 50;
var objectSpacingX = 150;
var globalRouteX = 50;
var globalRouteY = 650;
var subRouteY = 725;
var sigOffsetX = 125;
var sigY = 775;
var grooveY = 825;
var ampY = 875;
var matrixX = 25;
var matrixY = 950;


/***********************
**** Size Variables ****
************************/
var globalRouteSizeStart = 169;
var globalRouteSizeIncrease = 150;
var matrixSizeStart = 194;
var matrixSizeIncrease = 150;
var matrixctrlSizeStart = 80;


/****************************
**** Max Input Functions ****
*****************************/
function msg_int(i) {
    if (i > 0) {
        grooveChange = 1;
    } else if (i < 0) {
        grooveChange = -1;
    } else {
        grooveChange = 0;
    }

    // Short-circuit if trying to remove a single groove
    if (grooveChange === -1 && numGrooves === 1) {
        return;
    }

    output();
}


function bang() {
    output();
}


/*****************************
**** Max Output Functions ****
******************************/
function output() {
    // Increase grooves
    if (grooveChange === 1) {
        numGrooves += 1;
        var grooveName = "g" + numGrooves;
        var groovePosX = objectOffsetX + (objectSpacingX * (numGrooves - 1))

        // Recreate global route
        deleteGlobalRoute();
        createGlobalRoute();
        connectInletToGlobalRoute();

        // Create sub routes
        createSubRoute(grooveName, groovePosX);
        connectGlobalRouteToSubRoutes();

        // Create sig
        createSig(grooveName);
        connectSubRouteToSig(grooveName);

        // Create groove objects
        createGroove(grooveName, groovePosX);
        createAmp(grooveName, groovePosX);
        connectGrooveToAmp(grooveName);
        connectSubRouteToGroove(grooveName);
        connectSubRouteToAmp(grooveName);
        connectSigToGroove(grooveName);

        // Recreate matrix object
        deleteMatrix();
        createMatrix();
        connectMatrixctrlToMatrix();
        connectAmpsToMatrix();
        connectMatrixToOutlets();

        // Resize matrixctrl object
        resizeMatrixctrl();
    // Decrease grooves
    } else if (grooveChange === -1) {
        var grooveName = "g" + numGrooves;

        // Remove last groove
        deleteGroove(grooveName);

        // Remove last subroute
        deleteSubRoute(grooveName);

        // Remove last sig
        deleteSig(grooveName);

        // Remove last amp
        deleteAmp(grooveName);

        numGrooves -= 1;

        // Recreate global route
        deleteGlobalRoute();
        createGlobalRoute();
        connectInletToGlobalRoute();

        // Connect all sub routes to global route
        connectGlobalRouteToSubRoutes();

        // Recreate matrix object
        deleteMatrix();
        createMatrix();
        connectMatrixctrlToMatrix();
        connectAmpsToMatrix();
        connectMatrixToOutlets();

        // Resize matrixctrl object
        resizeMatrixctrl();
    }
}


/*************************
**** Create Functions ****
**************************/
function createGlobalRoute() {
    // Create the object
    var routeText = "";
    for (var i = 0; i < numGrooves; i++) {
        routeText = routeText + i + " ";
    }

    var globalRouteObject = globalRouteObjectTemplate
        .replace("<route>", routeText.trim())
        .replace("<x>", globalRouteX)
        .replace("<y>", globalRouteY);

    outMsg = globalRouteObject.split("|");
    outlet(0, outMsg);

    // Adjust the object size
    var size = globalRouteSizeStart + (globalRouteSizeIncrease * (numGrooves - 1));
    var globalRouteSize = globalRouteSizeTemplate
        .replace("<size>", size);

    outMsg = globalRouteSize.split("|");
    parseIntsInArray(outMsg);
    outlet(0, outMsg);

}


function createSubRoute(grooveName, groovePosX) {
    // Create the object
    var subRouteObject = subRouteObjectTemplate
        .replace("<groove>", grooveName)
        .replace("<x>", groovePosX)
        .replace("<y>", subRouteY);

    outMsg = subRouteObject.split("|");
    outlet(0, outMsg);

    // Adjust the object size
    var subRouteSize = subRouteSizeTemplate
        .replace("<groove>", grooveName);

    outMsg = subRouteSize.split("|");
    parseIntsInArray(outMsg);
    outlet(0, outMsg);

}


function createSig(grooveName) {
    var sigX = sigOffsetX + (objectSpacingX * (numGrooves - 1));
    var sigObject = sigObjectTemplate
        .replace("<groove>", grooveName)
        .replace("<x>", sigX)
        .replace("<y>", sigY);

    outMsg = sigObject.split("|");
    outlet(0, outMsg);

}


function createGroove(grooveName, groovePosX) {
    var bufferName = "b" + numGrooves;
    var grooveObject = grooveObjectTemplate
        .replace("<buffer>", bufferName)
        .replace("<groove>", grooveName)
        .replace("<x>", groovePosX)
        .replace("<y>", grooveY);

    outMsg = grooveObject.split("|");
    outlet(0, outMsg);
}


function createAmp(grooveName, groovePosX) {
    // Create the object
    var grooveAmpObject = ampObjectTemplate
        .replace("<groove>", grooveName)
        .replace("<x>", groovePosX)
        .replace("<y>", ampY);

    outMsg = grooveAmpObject.split("|");
    outlet(0, outMsg);

    // Adjust the object size
    var ampSize = ampSizeTemplate
        .replace("<groove>", grooveName);

    outMsg = ampSize.split("|");
    parseIntsInArray(outMsg);
    outlet(0, outMsg);
}


function createMatrix() {
    // Create the object
    var matrixObject = matrixObjectTemplate
        .replace("<num>", numGrooves)
        .replace("<x>", matrixX)
        .replace("<y>", matrixY);

    outMsg = matrixObject.split("|");
    outlet(0, outMsg);

    // Adjust the object size
    var multiplier = Math.max(0, (numGrooves - 2))
    var size = matrixSizeStart + (matrixSizeIncrease * multiplier);
    var matrixSize = matrixSizeTemplate
        .replace("<size>", size);

    outMsg = matrixSize.split("|");
    parseIntsInArray(outMsg);
    outlet(0, outMsg);
}


/*************************
**** Delete Functions ****
**************************/
function deleteGlobalRoute() {
    var deleteObject = deleteObjectTemplate
        .replace("<obj>", "global-groove-route");
    outMsg = deleteObject.split("|");
    outlet(0, outMsg);
}


function deleteGroove(grooveName) {
    var deleteObject = deleteObjectTemplate
        .replace("<obj>", grooveName);
    outMsg = deleteObject.split("|");
    outlet(0, outMsg);
}


function deleteSubRoute(grooveName) {
    var deleteObject = deleteObjectTemplate
        .replace("<obj>", grooveName + "-route");
    outMsg = deleteObject.split("|");
    outlet(0, outMsg);
}


function deleteSig(grooveName) {
    var deleteObject = deleteObjectTemplate
        .replace("<obj>", grooveName + "-sig");
    outMsg = deleteObject.split("|");
    outlet(0, outMsg);
}


function deleteAmp(grooveName) {
    var deleteObject = deleteObjectTemplate
        .replace("<obj>", grooveName + "-amp");
    outMsg = deleteObject.split("|");
    outlet(0, outMsg);
}


function deleteMatrix() {
    var deleteObject = deleteObjectTemplate
        .replace("<obj>", "groove-matrix");
    outMsg = deleteObject.split("|");
    outlet(0, outMsg);
}


/*************************
**** Resize Functions ****
**************************/
function resizeMatrixctrl() {
    // Resize object
    var size = matrixctrlSizeStart * numGrooves;
    var matrixctrlSize = matrixctrlSizeTemplate
        .replace("<size>", size);

    outMsg = matrixctrlSize.split("|");
    parseIntsInArray(outMsg);
    outlet(0, outMsg);

    // Change number of columns
    outMsg = new Array();
    outMsg.push("columns", numGrooves);
    outlet(1, outMsg);

    // Change presentation rect and size
    outMsg = new Array();
    outMsg.push("presentation_rect", 0, 23, size, 144);
    outlet(1, outMsg);

    // Update amplitudes
    outMsg = new Array();
    for (var i = 0; i < numGrooves; i++) {
        outMsg.push(i, 0, 0.5, i, 1, 0.5);
    }
    outlet(1, outMsg);
}


/**************************
**** Connect Functions ****
***************************/
function connectInletToGlobalRoute() {
    outMsg = inletGlobalRouteConnectionTemplate.split("|");
    parseIntsInArray(outMsg);
    outlet(0, outMsg);
}


function connectGlobalRouteToSubRoutes() {
    for (var grooveIdx = 0; grooveIdx < numGrooves; grooveIdx++) {
        var globalRouteSubRouteConnection = globalRouteSubRouteConnectionTemplate
        .replace("<outlet>", grooveIdx)
        .replace("<groove>", "g" + (grooveIdx + 1));

        outMsg = globalRouteSubRouteConnection.split("|");
        parseIntsInArray(outMsg);
        outlet(0, outMsg);
    }
}


function connectSubRouteToSig(grooveName) {
    var subRouteSigConnection = subRouteSigConnectionTemplate
        .replace("<groove>", grooveName)
        .replace("<groove>", grooveName);

        outMsg = subRouteSigConnection.split("|");
        parseIntsInArray(outMsg);
        outlet(0, outMsg);
}


function connectGrooveToAmp(grooveName) {
    var grooveAmpConnection = grooveAmpConnectionTemplate
        .replace("<groove>", grooveName)
        .replace("<groove>", grooveName);

        outMsg = grooveAmpConnection.split("|");
        parseIntsInArray(outMsg);
        outlet(0, outMsg);
}


function connectSubRouteToGroove(grooveName) {
    for (var outletIdx = 0; outletIdx < numGrooveInlets; outletIdx++) {
        var subRouteGrooveConnection = subRouteGrooveConnectionTemplate
        .replace("<groove>", grooveName)
        .replace("<outlet>", outletIdx)
        .replace("<groove>", grooveName)
        .replace("<outlet>", outletIdx);

        outMsg = subRouteGrooveConnection.split("|");
        parseIntsInArray(outMsg);
        outlet(0, outMsg);
    }
}


function connectSubRouteToAmp(grooveName) {
    var subRouteAmpConnection = subRouteAmpConnectionTemplate
        .replace("<groove>", grooveName)
        .replace("<groove>", grooveName);

        outMsg = subRouteAmpConnection.split("|");
        parseIntsInArray(outMsg);
        outlet(0, outMsg);
}


function connectSigToGroove(grooveName) {
    var sigGrooveConnection = sigGrooveConnectionTemplate
        .replace("<groove>", grooveName)
        .replace("<groove>", grooveName);

        outMsg = sigGrooveConnection.split("|");
        parseIntsInArray(outMsg);
        outlet(0, outMsg);
}


function connectAmpsToMatrix() {
    for (var grooveIdx = 0; grooveIdx < numGrooves; grooveIdx++) {
        var ampMatrixConnection = ampMatrixConnectionTemplate
            .replace("<groove>", "g" + (grooveIdx + 1))
            .replace("<inlet>", grooveIdx);

            outMsg = ampMatrixConnection.split("|");
            parseIntsInArray(outMsg);
            outlet(0, outMsg);
    }
}


function connectMatrixToOutlets() {
    for (var audioOut = 0; audioOut < numAudioOutputs; audioOut++){
        var matrixOutletConnection = matrixOutletConnectionTemplate
            .replace("<outlet>", audioOut)
            .replace("<outlet>", audioOut);

            outMsg = matrixOutletConnection.split("|");
            parseIntsInArray(outMsg);
            outlet(0, outMsg);
    }
}


function connectMatrixctrlToMatrix() {
    outMsg = matrixctrlMatrixConnectionTemplate.split("|");
    parseIntsInArray(outMsg);
    outlet(0, outMsg);
}


/**************************
**** Utility Functions ****
***************************/
function parseIntsInArray(inputArray) {
    for (var i = 0; i < inputArray.length; i++) {
        var parsedInt = parseInt(inputArray[i]);
        if (!isNaN(parsedInt)) {
            inputArray[i] = parsedInt;
        }
    }
}
