/*
    Handles formatting messages to send to `thispatcher` object for
    dynamically creating buffer~ objects and connecting them to the `route` object.
*/

inlets = 1;
outlets = 2;
autowatch = 1;

/*************************
**** String Templates ****
**************************/
var routeObjectTemplate = "script|newobject|newobj|@text|route <route>|@varname|buffer-route|@patching_position|<x>|<y>";
var inletRouteConnectionTemplate = "script|connect|route-inlet|0|buffer-route|0";
var bufferObjectTemplate = "script|newobject|newobj|@text|buffer~ <name>|@varname|<name>|@fixwidth|1|@patching_position|<x>|<y>";
var routeBufferConnectionTemplate = "script|connect|buffer-route|<outlet>|<buffer>|0";
var deleteObjectTemplate = "script|delete|<obj>";

/***********************
**** Input / Output ****
************************/
var outMsg = new Array();

var bufferChange = 0;
var numBuffers = 1;
var routeOutlets = 1;

// Position Constants
var routeX = 25;
var routeY = 650;
var bufferXOffset = 25;
var bufferSpacing = 75;
var bufferY = 700;


function msg_int(i) {
    if (i > 0) {
        bufferChange = 1;
    } else if (i < 0) {
        bufferChange = -1;
    } else {
        bufferChange = 0;
    }

    // Short-circuit if trying to remove a single buffer
    if (bufferChange === -1 && numBuffers === 1) {
        return;
    }

    output();
}


function bang() {
    output();
}


function output() {
    // Increase buffers
    if (bufferChange === 1) {
        numBuffers += 1;

        // Recreate route if necessary
        if (numBuffers > routeOutlets) {
            deleteRoute();
            createRoute();
            connectInletToRoute();
            routeOutlets = numBuffers;
        }

        // Create new buffer
        createBuffer();

        // Connect all buffers to route
        connectRouteToBuffers();
    // Decrease buffers
    } else if (bufferChange === -1) {
        // Remove last buffer
        deleteBuffer();

        numBuffers -= 1;

        // Recreate route object
        deleteRoute();
        createRoute();
        connectInletToRoute();
        routeOutlets = numBuffers;

        // Connect all buffers to route
        connectRouteToBuffers();

    }

    sendUmenuMsg();
}


function createRoute() {
    var routeText = "";
    for (var i = 0; i < numBuffers; i++) {
        routeText = routeText + i + " ";
    }

    var routeObjectReplace = routeObjectTemplate
        .replace("<route>", routeText.trim())
        .replace("<x>", routeX)
        .replace("<y>", routeY);
    outMsg = routeObjectReplace.split("|");
    outlet(0, outMsg);
}


function deleteRoute() {
    var deleteObjectReplace = deleteObjectTemplate
        .replace("<obj>", "buffer-route");
    outMsg = deleteObjectReplace.split("|");
    outlet(0, outMsg);
}


function connectInletToRoute() {
    outMsg = inletRouteConnectionTemplate.split("|");
    outMsg[3] = 0;
    outMsg[5] = 0;
    outlet(0, outMsg);
}


function createBuffer() {
    var bufferName = "b" + numBuffers;
    var xPos = bufferXOffset + (bufferSpacing * (numBuffers - 1));
    var bufferObjectReplace = bufferObjectTemplate
        .replace("<name>", bufferName)
        .replace("<name>", bufferName)
        .replace("<x>", xPos)
        .replace("<y>", bufferY);

    outMsg = bufferObjectReplace.split("|");
    outlet(0, outMsg);
}

function connectRouteToBuffers() {
    for (var bufferIdx = 0; bufferIdx < numBuffers; bufferIdx++) {
        var routeBufferConnectionReplace = routeBufferConnectionTemplate
            .replace("<outlet>", bufferIdx)
            .replace("<buffer>", "b" + (bufferIdx + 1));
        outMsg = routeBufferConnectionReplace.split("|");
        outMsg[3] = parseInt(outMsg[3]);
        outMsg[5] = 0;
        outlet(0, outMsg);
    }
}


function deleteBuffer() {
    var bufferName = "b" + numBuffers;

    var deleteObjectReplace = deleteObjectTemplate
        .replace("<obj>", bufferName);
    outMsg = deleteObjectReplace.split("|");
    outlet(0, outMsg);
}


function sendUmenuMsg() {
    var umenuMsg = new Array();
    if (bufferChange === 1) {
        umenuMsg.push("append", "Buffer " + numBuffers);
    } else if (bufferChange === -1) {
        umenuMsg.push("delete", numBuffers);
    }
    outlet(1, umenuMsg);
    outlet(1, "count");
}