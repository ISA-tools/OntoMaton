// OntoMaton is a component of the ISA software suite (http://www.isa-tools.org)
//
// License:
// OntoMaton is licensed under the Common Public Attribution License version 1.0 (CPAL)
//
// EXHIBIT A. CPAL version 1.0
// “The contents of this file are subject to the CPAL version 1.0 (the “License”);
// you may not use this file except in compliance with the License. You may obtain a
// copy of the License at http://isatab.sf.net/licenses/OntoMaton-license.html.
// The License is based on the Mozilla Public License version 1.1 but Sections
// 14 and 15 have been added to cover use of software over a computer network and
// provide for limited attribution for the Original Developer. In addition, Exhibit
// A has been modified to be consistent with Exhibit B.
//
// Software distributed under the License is distributed on an “AS IS” basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for
// the specific language governing rights and limitations under the License.
//
// The Original Code is OntoMaton.
// The Original Developer is the Initial Developer. The Initial Developer of the
// Original Code is the ISA Team (Eamonn Maguire, eamonnmag@gmail.com; Alejandra Gonzalez-Beltran, alejandra.gonzalez.beltran@gmail.com; Massimiliano Izzo <massimorgon@gmail.com>;
// Philippe Rocca-Serra, proccaserra@gmail.com; Susanna-Assunta Sansone, sa.sanson@gmail.com;
// http://www.isa-tools.org). All portions of the code written by the ISA Team are
// Copyright (c) 2007-2016 ISA Team. All Rights Reserved.
//
// EXHIBIT B. Attribution Information
// Attribution Copyright Notice: Copyright (c) 2007-2016 ISA Team
// Attribution Phrase: Developed by the ISA Team
// Attribution URL: http://www.isa-tools.org
// Graphic Image provided in the Covered Code as file: http://isatab.sf.net/assets/img/tools/ontomaton-part-of-isatools.png
// Display of Attribution Information is required in Larger Works which are defined in the CPAL as a work which combines Covered Code or portions thereof with code not governed by the terms of the CPAL.


//gets all the ontologies from BioPortal
function getBioPortalOntologies() {

    var searchString = "http://data.bioontology.org/ontologies?apikey=fd88ee35-6995-475d-b15a-85f1b9dd7a42&display_links=false&display_context=false";

    // we cache results and try to retrieve them on every new execution.
    var cache = CacheService.getPrivateCache();

    var text;

    if (cache.get("ontologies_fragments") == null) {
        text = UrlFetchApp.fetch(searchString).getContentText();
        splitResultAndCache(cache, "ontologies", text);
    } else {
        text = getCacheResultAndMerge(cache, "ontologies");
    }

    var doc = JSON.parse(text);
    var ontologies = doc;

    var ontologyDictionary = {};
    for (ontologyIndex in doc) {
        var ontology = doc[ontologyIndex];
      ontologyDictionary[ontology.acronym] = {"name":ontology.name, "uri":ontology["@id"]};
    }

    return sortOnKeys(ontologyDictionary);

}

//gets all the vocabularies from LOV
function getLinkedOpenVocabularies(){

  var vocabularies;
  var vocabsURL = "http://lov.okfn.org/dataset/lov/api/v2/vocabulary/list";
  var cache = CacheService.getPrivateCache();

  if (cache.get("lov_fragments") == null) {
     var vocabsResponse = UrlFetchApp.fetch(vocabsURL);
     var text = vocabsResponse.getContentText();
     splitResultAndCache(cache, "lov", text);
  } else {
     text = getCacheResultAndMerge(cache, "lov");
  }

  vocabularies = JSON.parse(text);

  var vocabularyDictionary = {};
  for (vocabularyIndex in vocabularies) {
    var vocabulary = vocabularies[vocabularyIndex];
    vocabularyDictionary[vocabulary.prefix] = {"name":vocabulary.titles[0].value, "uri":vocabulary.uri};
  }
  // Logger.log(vocabularyDictionary);

  return sortOnKeys(vocabularyDictionary);
}

/**
 * @method
 * @name getOLSOntologies
 * @description gets all the ontologies from OLS
 * @return{Object}
 */
function getOLSOntologies() {
  var ontologiesUri = OLS_API_BASE_URI + "/ontologies?size=" + OLS_PAGINATION_SIZE;
  var  cache = CacheService.getPrivateCache(), res, text, json, ontologies = [];
  Logger.log(cache.get("ols_fragments"));

  if (true) {
    do {
      res = UrlFetchApp.fetch(ontologiesUri);
      // Logger.log("getOlsOntologies - fetching resource: " + ontologiesUri);
      text = res.getContentText('utf-8');
      // Logger.log(text);
      json = JSON.parse(text);
      // Logger.log("getOlsOntologies - found ontologies: #" + json._embedded.ontologies.length);
      ontologies = ontologies.concat(json._embedded.ontologies);
      // Logger.log("getOlsOntologies - found ontologies: #" + ontologies.length);
      ontologiesUri = json._links && json._links.next && json._links.next.href;
    }
    while (ontologiesUri);
    // store into cache the result as plain text
    splitResultAndCache(cache, "ols", JSON.stringify(ontologies));
  }
  else {
    ontologies = JSON.parse(getCacheResultAndMerge(cache, "ols"));
  }
  // Logger.log("getOlsOntologies - found ontologies: #" + ontologies.length);
  var ontologyDict = {};
  ontologies.forEach(function(ontology) {
    // Logger.log(ontology);
    var config = ontology.config || {};
    ontologyDict[ontology.ontologyId] = {
      name: config.title,
      uri: config.id
    };
  });
  // Logger.log(ontologyDict);
  return sortOnKeys(ontologyDict);
}

/**
 * @description retrieves a list of ontologies from an external web source/portal and adds them to the panel as a restriction option
 * @param{Application} app
 * @param{FlowPanel} panel
 * @param{function} ontologiesRetrievalFnc - a method that return an object of ontologies sorted by key. The key is the acronym/identifier of the ontology.
 * @param{string} btnLabel - the label for the button
  * @param{string} service - the service where the info comes from
 */
function addOntologiesToPanel(app, panel, ontologiesRetrievalFnc, btnLabel, service_name) {
    panel.add(app.createTextBox().setName("columnName").setId("columnName").setTag("Column Name").setStyleAttribute("border", "thin solid #939598"));

    // get ontology names to populate the list box.
    var listBox = app.createListBox().setName("ontology").setId("ontology").setSize("150", "20");

    var ontologies = ontologiesRetrievalFnc();

    for (ontologyId in ontologies) {
        listBox.addItem(ontologyId + " - " + ontologies[ontologyId].name);
    }
    panel.add(listBox);


    var hidden_service = "hidden_service"
    panel.add(app.createHidden(hidden_service, service_name).setId("hidden_service"))

    var addRestrictionButton = app.createButton().setText(btnLabel).setStyleAttribute("background", "#81A32B").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("font-size","11px").setStyleAttribute("color", "#ffffff").setStyleAttribute("border", "none");
    addRestrictionButton.setHeight(25).setWidth(150);
    addRestrictionButton.setId("ontologyRuleSet");


    var addRestrictionHandler = app.createServerClickHandler("addRestrictionHandler");
    addRestrictionHandler.addCallbackElement(app.getElementById("columnName"));
    addRestrictionHandler.addCallbackElement(app.getElementById("ontology"));
    addRestrictionHandler.addCallbackElement(app.getElementById("hidden_service"));


    addRestrictionButton.addClickHandler(addRestrictionHandler);

    panel.add(addRestrictionButton);
}


function showSettings() {
    var mydoc = SpreadsheetApp.getActiveSpreadsheet();

    var app = UiApp.createApplication().setHeight(580);

    var absolutePanel = app.createAbsolutePanel();
    absolutePanel.setSize(480, 560);

    absolutePanel.add(app.createImage("http://isatools.files.wordpress.com/2012/11/ontomaton-settings.png"), 120, 0);

    absolutePanel.add(createLabel(app, "How do you want ontology terms to be entered in the spreadsheet?",
        "sans-serif", "bolder", "13px", "#000"), 15, 100);

    var useDefault = isCurrentSettingOnDefault();

    var placementStrategyOptions = app.createListBox().setName("strategy").setId("strategy").setSize("350", "27");
    placementStrategyOptions.addItem("Place hyperlinked term name in field");
    placementStrategyOptions.addItem("Place term name and accession in different fields");

  if(!useDefault) {
    placementStrategyOptions.setSelectedIndex(1);
  }

    absolutePanel.add(placementStrategyOptions, 15, 130);

    var option1Handler = app.createServerValueChangeHandler('setOntologyInsertionStrategy');
    option1Handler.addCallbackElement(absolutePanel);
    placementStrategyOptions.addChangeHandler(option1Handler);

    absolutePanel.add(createLabel(app, "Restrictions are used to limit the search space for specific columns in your Google Spreadsheet. Do you wish to restrict the search space for fields? ", "sans-serif", "bolder", "13px", "#000"), 15, 200);
    absolutePanel.add(createLabel(app, "All restrictions are added to the 'Restrictions' sheet.", "sans-serif", "lighter", "12px", "#000"), 15, 250);

    var header = app.createHorizontalPanel();

    header.add(createLabel(app, "Field Name",
        "sans-serif", "bolder", "12px", "#000").setSize("125", "20"));

    header.add(createLabel(app, "Ontology",
        "sans-serif", "bolder", "12px", "#000").setSize("82", "20"))

    absolutePanel.add(header, 15, 285);

    var flow = app.createFlowPanel();

    // BioPortal
    addOntologiesToPanel(app, flow, getBioPortalOntologies, "Add BioPortal Restriction", "BioPortal");
    absolutePanel.add(flow, 15, 290);

    // LOV
    addOntologiesToPanel(app, flow, getLinkedOpenVocabularies, "Add LOV Restriction", "LOV");
    absolutePanel.add(flow, 15, 300);

    // OLS
    addOntologiesToPanel(app, flow, getOLSOntologies, "Add OLS Restriction", "OLS");
    absolutePanel.add(flow, 15, 310);

    absolutePanel.add(app.createLabel().setId("status").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("font-size", "12px"), 15, 420);

    var viewRestrictionsButton = app.createButton().setText("View All Restrictions").setStyleAttribute("background", "#666").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("font-size","11px").setStyleAttribute("color", "#ffffff").setStyleAttribute("border", "none");;
    viewRestrictionsButton.setHeight(25).setWidth(140);

    var applyAndCloseButton = app.createButton().setText("Apply").setStyleAttribute("background", "#81A32B").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("font-size","11px").setStyleAttribute("color", "#ffffff").setStyleAttribute("border", "none");;
    applyAndCloseButton.setHeight(25).setWidth(60);

    var viewRestrictionHandler = app.createServerClickHandler("viewRestrictionHandler");
    viewRestrictionsButton.addClickHandler(viewRestrictionHandler);

    var applyAndCloseHandler = app.createServerClickHandler("applyAndClose");
    applyAndCloseButton.addClickHandler(applyAndCloseHandler);

    absolutePanel.add(viewRestrictionsButton, 10, 445);
    absolutePanel.add(applyAndCloseButton, 400, 445);

    app.add(absolutePanel);

    createSettingsTab();
    mydoc.show(app);
}

function createSettingsTab() {
    var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
    if (settingsSheet == undefined) {
        var activeSheet = SpreadsheetApp.getActiveSheet();
        settingsSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Settings");
        settingsSheet.getRange("A1").setValue("insertTermInOneColumn");
        settingsSheet.getRange("B1").setValue(true);
        SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(activeSheet);
    }
}

function viewRestrictionHandler(e) {
     var restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Restrictions");

    if (restrictionSheet == undefined) {
        UiApp.getActiveApplication().getElementById("status").setText("Restriction sheet doesn't exist yet. Add a restriction and it will be created automatically.");
        return UiApp.getActiveApplication();
    } else {
        SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(restrictionSheet);
    }
}

function isCurrentSettingOnDefault() {
    var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");

    if (settingsSheet != undefined) {
        var settingsValue = settingsSheet.getRange("B1").getValue();
        if (settingsValue == false) {
            return false;
        }
    }
    return true;
}

function applyAndClose(e) {
  var app = UiApp.getActiveApplication();
  return app.close();
}

function addRestrictionHandler(e) {
  var app, activeSheet, restrictionSheet, nextBlankRow, columnName, ontology, service;
  try {
    restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Restrictions");

    if (restrictionSheet == undefined) {
      activeSheet = SpreadsheetApp.getActiveSheet();
      restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Restrictions");
      restrictionSheet.getRange("A1").setValue("Column Name");
      restrictionSheet.getRange("B1").setValue("Ontology");
      restrictionSheet.getRange("C1").setValue("Branch");
      restrictionSheet.getRange("D1").setValue("Version");
      restrictionSheet.getRange("E1").setValue("Ontology Name");
      restrictionSheet.getRange("F1").setValue("Service");

      SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(activeSheet);
    }

    app = UiApp.getActiveApplication();

    if (e.parameter.columnName === "") {
      app.getElementById("status").setText("Please enter a column name!");
    } else {
      nextBlankRow = findNextBlankRow(restrictionSheet);

      columnName = e.parameter.columnName

      ontology = e.parameter.ontology;

      service = e.parameter.hidden_service;

      restrictionSheet.getRange(nextBlankRow, 1).setValue(columnName);
      restrictionSheet.getRange(nextBlankRow, 2).setValue(ontology.substring(0, ontology.indexOf("-")));
      restrictionSheet.getRange(nextBlankRow, 5).setValue(ontology.substring(ontology.indexOf("-")+1));
      restrictionSheet.getRange(nextBlankRow, 6).setValue(service);

      app.getElementById("status").setText("Restriction for " + columnName + " added based on "+ ontology +" from " + service).setStyleAttribute("color", "#F00")
    }
    return app;
  }
  catch(err) {
    app = UiApp.getActiveApplication();
    Logger.log(err);
    app.getElementById("status").setText("Error caught: " + err);
    return err;
  }
}

function setOntologyInsertionStrategy(e) {
    var option = e.parameter.strategy;

    var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
    settingsSheet.getRange("B1").setValue(option == "Place hyperlinked term name in field" ? true : false);
    return UiApp.getActiveApplication();
}

