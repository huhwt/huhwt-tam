///////////////////////////////////////////////////////////////////////////////
//
// File open functionality added by Idefix2020
//
// i18n functionality added by huhwt
//
///////////////////////////////////////////////////////////////////////////////

let tfmNodePositions = null;


function resetSVGLayers()
{
    d3.select("#topolayer").remove();
    d3.select("#shadinglayer").remove();
    d3.select("#graphlayer").remove();
}

function readSingleFile(e)
{
    var file = e.target.files[0];
    if (!file)
        return;

    var reader = new FileReader();
    reader.onload = function (e) {
        var url = e.target.result;
        PARAM_FILENAME = file.name;

        if (renderer.FORCE_SIMULATION) renderer.FORCE_SIMULATION.stop();
        resetSVGLayers();

        if (file.name.endsWith(".json") || file.name.endsWith(".tam")) {
            renderer = new TAMRenderer();

            d3.json(url).then(function (json) { processJSON(json, file.name); });
        }
        else if (file.name.endsWith(".ged")) {
            renderer = new TFMRenderer();
            setDefaultParameters();
            PARAM_SOURCE_FILE = file.name;

            loadGedcom(url, function (gedcom) {
                estimateMissingDates(gedcom, PARAM_PROCREATION_AGE);
                renderer.createFamilyForceGraph(gedcom);
            });
        }
        else if (file.name.endsWith(".tfm")) {
            renderer = new TFMRenderer();

            d3.json(url).then(function (json) { processTFM(json); });
        }
        else
            console.error(i18n("U_f_t"));               // "Unrecognized file type"
    };
    reader.readAsDataURL(file);
}


// Wrapper by rp
function onChangeFile(event)
{
    var fileinput = document.getElementById("browse");
    var textinput = document.getElementById("filename");
    textinput.value = fileinput.files[0].name;

    readSingleFile(event);
}

///////////////////////////////////////////////////////////////////////////////


// load data, choose renderer based on the filetype and create force graph
function loadFileFromDisk()
{
    PARAM_SOURCE_FILE = PARAM_FILENAME;

    if (PARAM_FILENAME.endsWith(".json") || PARAM_FILENAME.endsWith(".tam"))
    {
        renderer = new TAMRenderer();

        d3.json(folder + "/" + PARAM_FILENAME).then(function(json) { processJSON(json, PARAM_FILENAME); });
    }
    else if (PARAM_FILENAME.endsWith(".ged"))
    {
        renderer = new TFMRenderer();

        setDefaultParameters();
        loadGedcom(folder + "/" + PARAM_FILENAME, function(gedcom)
        {
            estimateMissingDates(gedcom, PARAM_PROCREATION_AGE);
            renderer.createFamilyForceGraph(gedcom);
        });
    }
    else if (PARAM_FILENAME.endsWith(".tfm"))
    {
        renderer = new TFMRenderer();

        d3.json(folder + "/" + PARAM_FILENAME).then(function(json) { processTFM(json); });
    }
    else
        console.error(i18n("U_f_t"));                   // Unrecognized file type
}


// Process JSON loaded from a .json or .tam,
// then create graph.
function processJSON(json, filename)
{
    if ("parameters" in json) {
        console.log(i18n("L_pf_f"));                   // Loading parameters from file.
        setParameters(json.parameters);
    }
    else {
        console.log(i18n("F_dnc_p"));                   // File does not contain parameters
        setDefaultParameters();
    }
    PARAM_SOURCE_FILE = filename;
    renderer.createForceGraphJSON(json);
}


// Process JSON loaded from a .tfm, load linked .ged or
// ask user to upload .ged, then create graph.
function processTFM(json)
{
    // first try to load parameters from .tfm
    if ("parameters" in json) {
        console.log(i18n("L_pf_f"));                   // Loading parameters from file.
        setParameters(json.parameters);
    }
    else {
        console.log(i18n("F_dnc_p"));                   // File does not contain parameters
        setDefaultParameters();
    }

    let sourcePath = folder + "/" + PARAM_SOURCE_FILE; // PARAM_SOURCE_FILE is set by setParameters()
    if (!checkFileExistence(sourcePath))
    {
        console.error(i18n("C_nfG_f"), sourcePath);     // Couldn't find GEDCOM file

        // Store node positions for later use
        if("nodePositions" in json)
            tfmNodePositions = json.nodePositions;
        else
            tfmNodePositions = null;

        // Open modal to ask user for the missing file
        showModal(PARAM_SOURCE_FILE);
        return;
    }

    // then load the data file .ged
    loadGedcom(sourcePath, function (gedcom) {
        estimateMissingDates(gedcom, PARAM_PROCREATION_AGE);

        // use node positions from .tfm (if available)
        if ("nodePositions" in json)
            renderer.createFamilyForceGraph(gedcom, json.nodePositions);
        else
            renderer.createFamilyForceGraph(gedcom);
    });
}


function checkFileExistence(url)
{
    try {
        console.log(i18n("Ttl"), url);                           // Trying to load

        let req = new XMLHttpRequest();
        req.open("HEAD", url, false);
        req.send();

        return req.status != 404;
    } catch (error) {
        return false;
    }
}


function closeModal()
{
    document.querySelector("#overlay").style.display = "none";
}


function showModal(missingFileName) {
    if (missingFileName)
        document.querySelector("#missing-ged-file-name").textContent = missingFileName;
    else
        document.querySelector("#missing-ged-file-name").textContent = i18n("unknown");

    document.querySelector("#overlay").style.display = "";
}


// Loads the GEDCOM file and creates the graph
function processModalFileUpload()
{
    let file = document.querySelector('#modal-file-upload').files[0];
    if (file) {
        closeModal();

        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            loadGedcom(reader.result, function (gedcom) {
                estimateMissingDates(gedcom, PARAM_PROCREATION_AGE);

                PARAM_SOURCE_FILE = file.name;

                // use previously stored node positions (if available)
                if (tfmNodePositions)
                    renderer.createFamilyForceGraph(gedcom, tfmNodePositions);
                else
                    renderer.createFamilyForceGraph(gedcom);
            });
        };
    }
}
