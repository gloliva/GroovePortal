/*
    Handles formatting messages to send to `thispatcher` object for
    dynamically creating groove~ objects and connecting them to a `route` object.
*/

inlets = 1;
outlets = 2;
autowatch = 1;

/*************************
**** String Templates ****
*************************/
// Route object
var routeObjectTemplate = "script|newobject|newobj|@text|route <route>|@varname|groove-route|@patching_position|<x>|<y>";
var inletRouteConnectionTemplate = "script|connect|route-inlet|0|groove-route|0";

// Groove objects
var grooveObjectTemplate = "script|newobject|newobj|@text|groove~ <name>|@varname|<name>|@fixwidth|1|@patching_position|<x>|<y>";
var routeGrooveConnectionTemplate = "script|connect|groove-route|<outlet>|<groove>|0";
var grooveAmpObjectTemplate = "script|newobject|newobj|@text|*~ 1.|@varname|<name>-amp|@fixwidth|1|@patching_position|<x>|<y>";
var grooveAmpConnectionTemplate = "script|connect|<groove>|0|<groove>-amp|0";

// Matrix object
var matrixObjectTemplate = "script|newobject|newobj|@text|matrix~ <num> 2|@varname|groove-matrix||@patching_position|<x>|<y>";
var grooveAmpMatrixConnectionTemplate = "script|connect|<groove>|"

// Misc scripting
var deleteObjectTemplate = "script|delete|<obj>";
