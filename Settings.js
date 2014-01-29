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
// Original Code is the ISA Team (Eamonn Maguire, eamonnmag@gmail.com;
// Philippe Rocca-Serra, proccaserra@gmail.com; Susanna-Assunta Sansone, sa.sanson@gmail.com; Alejandra Gonzalez-Beltran, alejandra.gonzalez.beltran@gmail.com 
// http://www.isa-tools.org). All portions of the code written by the ISA Team are
// Copyright (c) 2007-2012 ISA Team. All Rights Reserved.
//
// EXHIBIT B. Attribution Information
// Attribution Copyright Notice: Copyright (c) 2007-2012 ISA Team
// Attribution Phrase: Developed by the ISA Team
// Attribution URL: http://www.isa-tools.org
// Graphic Image provided in the Covered Code as file: http://isatab.sf.net/assets/img/tools/ontomaton-part-of-isatools.png
// Display of Attribution Information is required in Larger Works which are defined in the CPAL as a work which combines Covered Code or portions thereof with code not governed by the terms of the CPAL.


function showSettings() {
    var mydoc = SpreadsheetApp.getActiveSpreadsheet();

    var app = UiApp.createApplication().setHeight(480);

    app.setTitle("Move");

    var absolutePanel = app.createAbsolutePanel();
    absolutePanel.setSize(480, 390);

    absolutePanel.add(app.createImage("http://isatools.files.wordpress.com/2012/11/ontomaton-settings.png"), 120, 0);

    absolutePanel.add(createLabel(app, "How do you want ontology terms to be entered in the spreadsheet?",
        "sans-serif", "bolder", "13px", "#000"), 15, 100);

    var useDefault = isCurrentSettingOnDefault();
    Logger.log("Is it the default? " + useDefault);

    var option1 = app.createRadioButton("ontologyFormat", "Place hyperlinked term name in field.").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("font-weight", "lighter").setStyleAttribute("color", "#000");
    option1.setId("defaultValue").setName("defaultValue");
    option1.setValue(useDefault);

    absolutePanel.add(option1, 15, 130);

    var option2 = app.createRadioButton("ontologyFormat", "Place term name and accession in different fields.").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("font-weight", "lighter").setStyleAttribute("color", "#000");
    option2.setId("alternativeValue").setName("alternative");
    option2.setValue(!useDefault);

    absolutePanel.add(option2, 15, 150);

    var option1Handler = app.createServerValueChangeHandler('setDefaultOntologyInsertion');
    option1Handler.addCallbackElement(absolutePanel);
    option1.addValueChangeHandler(option1Handler);

    var option2Handler = app.createServerValueChangeHandler('setAlternativeOntologyInsertion');
    option2Handler.addCallbackElement(absolutePanel);
    option2.addValueChangeHandler(option2Handler);

    absolutePanel.add(createLabel(app, "Do you wish to restrict the search space for fields?", "sans-serif", "bolder", "13px", "#000"), 15, 220);
    absolutePanel.add(createLabel(app, "All restrictions are added to the 'Restrictions' sheet.", "sans-serif", "lighter", "12px", "#000"), 15, 240);

    var header = app.createHorizontalPanel();

    header.add(createLabel(app, "Field Name",
        "sans-serif", "bolder", "12px", "#000").setSize("125", "20"));

    header.add(createLabel(app, "Ontology",
        "sans-serif", "bolder", "12px", "#000").setSize("82", "20"))

    absolutePanel.add(header, 15, 265);

    var flow = app.createFlowPanel();

    flow.add(app.createTextBox().setName("columnName").setId("columnName").setTag("Column Name").setStyleAttribute("border", "thin solid #939598"));

    // get ontology names to populate the list box.
    var listBox = app.createListBox().setName("ontology").setId("ontology").setSize("80", "20");

    var ontologies = getAllOntologies();

    for (ontologyId in ontologies) {
        listBox.addItem(ontologyId + " - " + ontologies[ontologyId].name);
    }

    flow.add(listBox);

    var addRestrictionButton = app.createButton().setText("Add Restriction").setStyleAttribute("background", "#81A32B").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("font-size","11px").setStyleAttribute("color", "#ffffff").setStyleAttribute("border", "none");
    addRestrictionButton.setHeight(25).setWidth(100);
    addRestrictionButton.setId("ontologyRuleSet");

    var addRestrictionHandler = app.createServerClickHandler("addRestrictionHandler");
    addRestrictionHandler.addCallbackElement(app.getElementById("columnName"));
    addRestrictionHandler.addCallbackElement(app.getElementById("ontology"));
    addRestrictionButton.addClickHandler(addRestrictionHandler);

    flow.add(addRestrictionButton);

    absolutePanel.add(flow, 15, 280);
  
    absolutePanel.add(app.createLabel().setId("status").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("font-size", "10px"), 15, 330);
  
    var viewRestrictionsButton = app.createButton().setText("View All Restrictions").setStyleAttribute("background", "#666").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("font-size","11px").setStyleAttribute("color", "#ffffff").setStyleAttribute("border", "none");;
    viewRestrictionsButton.setHeight(25).setWidth(140);
  
    var applyAndCloseButton = app.createButton().setText("Apply").setStyleAttribute("background", "#81A32B").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("font-size","11px").setStyleAttribute("color", "#ffffff").setStyleAttribute("border", "none");;
    applyAndCloseButton.setHeight(25).setWidth(60);
  
    var viewRestrictionHandler = app.createServerClickHandler("viewRestrictionHandler");
    viewRestrictionsButton.addClickHandler(viewRestrictionHandler);
  
    var applyAndCloseHandler = app.createServerClickHandler("applyAndClose");
    applyAndCloseButton.addClickHandler(applyAndCloseHandler);
  
    absolutePanel.add(viewRestrictionsButton, 15, 355);
    absolutePanel.add(applyAndCloseButton, 400, 355);
  
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
  var restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Restrictions");

  if (restrictionSheet == undefined) {
    var activeSheet = SpreadsheetApp.getActiveSheet();
    restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Restrictions");
    restrictionSheet.getRange("A1").setValue("Column Name");
    restrictionSheet.getRange("B1").setValue("Ontology");
    restrictionSheet.getRange("C1").setValue("Branch");
    restrictionSheet.getRange("D1").setValue("Version");
    restrictionSheet.getRange("E1").setValue("Ontology Name");

    SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(activeSheet);
  }

  var app = UiApp.getActiveApplication();
  
  if(e.parameter.columnName == "") {
    app.getElementById("status").setText("Please enter a column name!");
  } else {
    var nextBlankRow = findNextBlankRow(restrictionSheet);
    
    var ontology = e.parameter.ontology;
    restrictionSheet.getRange(nextBlankRow, 1).setValue(e.parameter.columnName);
    restrictionSheet.getRange(nextBlankRow, 2).setValue(ontology.substring(0, ontology.indexOf("-")));
    restrictionSheet.getRange(nextBlankRow, 5).setValue(ontology.substring(ontology.indexOf("-")+1));
    
    app.getElementById("status").setText("Restriction for " + e.parameter.columnName + " added.");
  }
  return app;
}

function setDefaultOntologyInsertion(e) {
    var selected = e.parameter.id;
    var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");

    var app = UiApp.getActiveApplication();
    app.getElementById("alternativeValue").setValue(false);

    settingsSheet.getRange("B1").setValue(true);
    return app;
}

function setAlternativeOntologyInsertion(e) {
    var selected = e.parameter.id;
    var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
    var app = UiApp.getActiveApplication();

    app.getElementById("defaultValue").setValue(false);
    settingsSheet.getRange("B1").setValue(false);
    return app;
}

function getAllOntologies() {

    var searchString = "http://data.bioontology.org/ontologies?apikey=fd88ee35-6995-475d-b15a-85f1b9dd7a42";

    // we cache results and try to retrieve them on every new execution.
    var cache = CacheService.getPublicCache();

    var text;

    if (cache.get("ontologies_fragments") == null) {
        text = UrlFetchApp.fetch(searchString).getContentText();
        splitResultAndCache(cache, "ontologies", text);
    } else {
        text = getCacheResultAndMerge(cache, "ontologies");
    }
  
    var doc = JSON.parse(text);
    var ontologies = doc;

    var ontologyDictionary = [];
    for (ontologyIndex in doc) {
        var ontology = doc[ontologyIndex];
      ontologyDictionary[ontology.acronym] = {"name":ontology.name, "uri":ontology["@id"]};
    }

    return sortOnKeys(ontologyDictionary);

}
