///////////////////////////////////////////////////////////////////////////////
//
// Topographic Attribute Maps Demo
// Copyright 2021 Reinhold Preiner
//
// This code is licensed under an MIT License.
// See the accompanying LICENSE file for details.
//
// i18n functionality added by huhwt
//
///////////////////////////////////////////////////////////////////////////////

const text_en = `{"values":{
                    "Yes": "Yes",
                    "No": "No",
                    "Ok": "Ok",
                    "Cancel": "Cancel",
                    "unknown": "unknown",
                    "birth": "Birth: ",
                    "death": "Death: ",
                    "age": "Age: ",
                    "mother": "Mother: ",
                    "father": "Father: ",
                    "wife": "Wife: ",
                    "husband": "Husband: ",
                    "children": "Children: ",
                    "Fchild": "First child: ",
                    "U_f_t" : "Unrecognized file type",
                    "L_pf_f" : "Loading parameters from file.",
                    "F_dnc_p" : "File does not contain parameters.",
                    "C_nfG_f" : "Couldn't find GEDCOM file",
                    "Ttl": "Trying to load",
                    "L_Xp_Xf": "Loaded %{nP} persons in %{nF} families",
                    "M_bdo_we": "Missing birth date of %{pFN} was estimated %{pbd}",
                    "S_mbd_o": "Still missing birth date of %{pFN}",
                    "LS_i_u": "Source %{pls} is undefined!",
                    "LT_i_u": "Target %{plt} is undefined!",
                    "C_Gw_Xn_Xl": "Created Graph with %{pNl} nodes and %{pLl} links.",
                    "F_G_I": "Force Graph Initialized.",
                    "SVG_E_i": "SVG Elements Initialized.",
                    "Int_i": "Interactions Initialized.",
                    "Top_l": "%{ptpl} Topopoints", 
                    "Ext_C": "Extracting Contours",
                    "Cre_T": "Creating Tunnels",
                    "Add_C": "Adding Contours",
                    "Add_HI": "Adding Height Indicators",
                    "Comp_NF": "Computing Normal Field",
                    "Ext_SCP": "Extracting Shading Contour Paths",
                    "Add_SL": "Adding Shading Layer",
                    "Done_uSF": "+++ Done Updating ScalarField",
                    "U_parm": "Unknown parameter %{pk}:%{pv}",
                    "L_dpf": "Loading default parameters for %{pTr}.",
                    "V_range": "Value range in data: %{pvmi},%{pvmx}",
                    "M_dim": "Map dimensions: %{pX}, %{pY}",
                    "S_NN": "+++ Starting Natural Neighbors",
                    "S_Cnstr": "Setting Constraints",
                    "D_Cnstr": "Dilate Constraints",
                    "Prpg": "Propagating",
                    "Intrpl": "Interpolating %{pw} x %{ph}, 1/%{pIS} Subsampling",
                    "Dffsng": "Diffusing",
                    "Smthng": "Smoothing",
                    "S_Dffsn": "+++ Starting Diffusion",
                    "F_Dffsn": "+++ Finished Diffusion",
                    "language": "Language",
                    "mb_LF": "Load File",
                    "mb_SF": "Save",
                    "mb_ntrct": "Interaction",
                    "mb_Frz": "<u>F</u>reeze",
                    "mb_HghlC": "<u>H</u>ighlight Contour",
                    "mb_sYV": "Show <u>Y</u>ear Value",
                    "mb_sNI": "Show Node <u>I</u>nfo",
                    "mb_GA": "Graph Appearance",
                    "mb_SG": "Show <u>G</u>raph",
                    "mb_SL": "Show <u>L</u>inks",
                    "mb_SN": "Show <u>N</u>ames",
                    "mb_LW": "Link Width:",
                    "mb_NR": "Node Radius:",
                    "mb_NLO": "Node Label Opacity:",
                    "mb_MA": "Map Appearance",
                    "mb_SM": "Show <u>M</u>ap",
                    "mb_RC": "<u>R</u>everse Colormap",
                    "mb_INN": "Interpolate NN",
                    "mb_EL": "Embed Links",
                    "mb_ST": "Show <u>T</u>unnels",
                    "mb_ES": "Enable <u>S</u>hading",
                    "mb_DD": "Dilation Degree:",
                    "mb_MinRV": "Min Range Value:",
                    "mb_MaxRV": "Max Range Value:",
                    "mb_CS": "Contour Step:",
                    "mb_CSb": "Big Contour Step:",
                    "mb_IS": "Indicator Size",
                    "mb_HScl": "Height Scale:",
                    "mb_Res": "Resolution:",
                    "mb_LSS": "Link Sample Step:",
                    "mb_UT": "Underground Thresh:",
                    "kc_Y": "Y",
                    "kc_M": "M",
                    "ZZZZ": "en"
            }}`;

const text_de = `{"values":{
                    "Yes": "Ja",
                    "No": "Nein",
                    "Ok": "Ok",
                    "Cancel": "Abbruch",
                    "unknown": "-unbekannt-",
                    "birth": "geboren: ",
                    "death": "gestorben: ",
                    "age": "Alter: ",
                    "mother": "Mutter: ",
                    "father": "Vater: ",
                    "wife": "Ehefrau: ",
                    "husband": "Ehemann: ",
                    "children": "Anz.Kinder: ",
                    "Fchild": "1. Kind: ",
                    "U_f_t" : "Datei-Typ nicht erkannt",
                    "L_pf_f" : "Parameter werden gelesen.",
                    "F_dnc_p" : "Keine Parameter in Datei.",
                    "C_nfG_f" : "GEDcom-Datei nicht gefunden",
                    "Ttl": "Versuche zu laden ...",
                    "L_Xp_Xf": "%{nP} Personen in %{nF} Familien geladen",
                    "M_bdo_we": "%{pFN} - Datum Geburt fehlt -> geschätzt: %{pbd}",
                    "LS_i_u": "Link-Quelle %{pls} nicht definiert!",
                    "LT_i_u": "Link-Ziel %{plt} nicht definiert!",
                    "S_mbd_o": "%{pFN} - Datum Geburt konnte nicht gesetzt werden",
                    "C_Gw_Xn_Xl": "Graph erzeugt - %{pNl} Nodes und %{pLl} Links.",
                    "F_G_I": "Force Graph initialisiert.",
                    "SVG_E_i": "SVG Elemente initialisiert.",
                    "Int_i": "Interaktive Elemente initialisiert.",
                    "Top_l": "%{ptpl} Topopoints", 
                    "Ext_C": "Konturen werden ermittelt",
                    "Cre_T": "Tunnel werden erzeugt",
                    "Add_C": "Konturen werden sichtbar gemacht",
                    "Add_HI": "Höhenwerte werden sichtbar gemacht",
                    "Comp_NF": "Berechne Normalen-Feld",
                    "Ext_SCP": "Verschattungen werden ermittelt",
                    "Add_SL": "Layer Verschattungen wird sichtbar gemacht",
                    "Done_uSF": "+++ Update ScalarFeld abgeschlossen",
                    "U_parm": "Parameter %{pk}:%{pv} unbekannt",
                    "L_dpf": "Default Parameter für %{pTr} werden geladen",
                    "V_range": "Werte-Bereich: %{pvmi},%{pvmx}",
                    "M_dim": "Karte Ausdehnung -  x:%{pX}, y:%{pY}",
                    "S_NN": "+++ Natural Neighbors - Start",
                    "S_Cnstr": "Setze Randbedingungen",
                    "D_Cnstr": "Dilatation Randbedingungen",
                    "Prpg": "Ausbreitung läuft",
                    "Intrpl": "Interpolation läuft - %{pw} x %{ph}, 1/%{pIS} Subsampling",
                    "Dffsng": "Verbreitung läuft",
                    "Smthng": "Glättung läuft",
                    "S_Dffsn": "+++ Verbreitung beginnt",
                    "F_Dffsn": "+++ Verbreitung abgeschlossen",
                    "language": "Sprache",
                    "mb_LF": "Bestand laden",
                    "mb_SF": "Speichern",
                    "mb_ntrct": "Darstellung",
                    "mb_Frz": "ein<u>F</u>rieren",
                    "mb_HghlC": "<u>H</u>ervorheben Konturen",
                    "mb_sYV": "<u>J</u>ahr zu Kontur zeigen",
                    "mb_sNI": "Node <u>I</u>nfo zeigen",
                    "mb_GA": "Graph Darstellung",
                    "mb_SG": "<u>G</u>raph zeigen",
                    "mb_SL": "<u>L</u>inks zeigen",
                    "mb_SN": "<u>N</u>amen zeigen",
                    "mb_LW": "Link Intensität:",
                    "mb_NR": "Node Radius:",
                    "mb_NLO": "Node Text Deckkraft:",
                    "mb_MA": "Karte Darstellung",
                    "mb_SM": "Zeige <u>K</u>arte",
                    "mb_RC": "Farben inve<u>R</u>tieren",
                    "mb_INN": "Interpolieren NN",
                    "mb_EL": "Links einbetten",
                    "mb_ST": "<u>T</u>unnel zeigen",
                    "mb_ES": "<u>S</u>chatten aktiv",
                    "mb_DD": "Erweiterung Stufe:",
                    "mb_MinRV": "Minimum Wertebereich:",
                    "mb_MaxRV": "Maximum Wertebereich:",
                    "mb_CS": "Abstufung Höhenlinien:",
                    "mb_CSb": "Abst. Höhenlinien B:",
                    "mb_IS": "Größe Höhenlinien-Text",
                    "mb_HScl": "Höhen-Skala:",
                    "mb_Res": "Auflösung:",
                    "mb_LSS": "Link Sample Step:",
                    "mb_UT": "Hintergrund Schwellw.:",
                    "kc_Y": "J",
                    "kc_M": "K",
                    "ZZZZ": "de"
            }}`;

function switch_locale(_locale) {
    let _text = '';
    switch(_locale) {
        case 'de':
            _text = text_de;
            break;
        default:
            _text = text_en;
    }
    // Prepare - remove newlines and double whitespaces to get proper JSON-ready text
    _text = _text.replace(/[\r]/g, '');
    _text = _text.replace(/ {2,}/g, ' ');
    // Parse it
    let data = JSON.parse(_text);
    // Clear previous state
    i18n.translator.reset();
    // Set the data
    i18n.translator.add(data);
}

switch_locale('de');