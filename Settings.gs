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
// Copyright (c) 2007-2020 ISA Team. All Rights Reserved.
//
// EXHIBIT B. Attribution Information
// Attribution Copyright Notice: Copyright (c) 2007-2020 ISA Team
// Attribution Phrase: Developed by the ISA Team
// Attribution URL: http://www.isa-tools.org
// Graphic Image provided in the Covered Code as file: http://isatab.sf.net/assets/img/tools/ontomaton-part-of-isatools.png
// Display of Attribution Information is required in Larger Works which are defined in the CPAL as a work which combines Covered Code or portions thereof with code not governed by the terms of the CPAL.



function showSettings() {
    var html = HtmlService.createHtmlOutputFromFile('Settings-Template').setTitle('OntoMaton - Ontology Search & Tagging').setWidth(300);
    createSettingsTab();
    SpreadsheetApp.getUi().showSidebar(html);
}

function loadOntologies() { 
    return {
        'BioPortal': getBioPortalOntologies(),
        'LOV': getLinkedOpenVocabularies(),
        'OLS': getOLSOntologies()
    }
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

function viewRestrictionHandler() {
     var restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Restrictions");

    if (restrictionSheet == undefined) {
        UiApp.getActiveApplication().getElementById("status").setText("Restriction sheet doesn't exist yet. Add a restriction and it will be created automatically.");
        return UiApp.getActiveApplication();
    } else {
        SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(restrictionSheet);
    }
}

function loadPreferences() {
    var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");

    if (settingsSheet != undefined) {
        var settingsValue = settingsSheet.getRange("B1").getValue();
        return settingsValue;
    }
    return true;
}

function addRestrictionHandler(params) {
  
    var ontology = params.ontology.trim();
    var columnName = params.columnName.trim();
    var service = params.service.trim();
    
    var restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Restrictions");

    if (restrictionSheet == undefined) {
        var activeSheet = SpreadsheetApp.getActiveSheet();
        restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Restrictions");
        restrictionSheet.getRange("A1").setValue("Column Name");
        restrictionSheet.getRange("B1").setValue("Ontology");
        restrictionSheet.getRange("C1").setValue("Branch");
        restrictionSheet.getRange("D1").setValue("Version");
        restrictionSheet.getRange("E1").setValue("Ontology Name");
        restrictionSheet.getRange("F1").setValue("Service");

        SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(activeSheet);
    }

  
    if(columnName !== "") {
        var nextBlankRow = findNextBlankRow(restrictionSheet);
        restrictionSheet.getRange(nextBlankRow, 1).setValue(columnName);
        restrictionSheet.getRange(nextBlankRow, 2).setValue(ontology.substring(0, ontology.indexOf(" - ")));
        restrictionSheet.getRange(nextBlankRow, 5).setValue(ontology.substring(ontology.indexOf(" - ") + 3));
        restrictionSheet.getRange(nextBlankRow, 6).setValue(service);
        return "Restriction for " + columnName + " Added"
  }
  
  return "Column name cannot be empty."
}

function setOntologyInsertionPreference(insertSingleColumn) {
    var settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Settings");
    settingsSheet.getRange("B1").setValue(insertSingleColumn);
}


function getBioPortalOntologies() {

    var searchString = "http://data.bioontology.org/ontologies?apikey=fd88ee35-6995-475d-b15a-85f1b9dd7a42&display_links=false&display_context=false";

    // we cache results and try to retrieve them on every new execution.
    var cache = CacheService.getPrivateCache();

    var text;

    if (cache.get("bioportal_fragments") == null) {
        text = UrlFetchApp.fetch(searchString).getContentText();
        splitResultAndCache(cache, "bioportal_fragments", text);
    } else {
        text = getCacheResultAndMerge(cache, "bioportal_fragments");
    }
    var doc = JSON.parse(text);
    var ontologies = doc;

    var ontologyDictionary = {};
    for (ontologyIndex in doc) {
        var ontology = doc[ontologyIndex];
      ontologyDictionary[ontology.acronym] = {"name":ontology.name, "uri":ontology["@id"]};
    }

    return ontologyDictionary;
}

function getLinkedOpenVocabularies(){

  var vocabsURL = "https://lov.linkeddata.es/dataset/lov/api/v2/vocabulary/list";
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

  return vocabularyDictionary;
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

  if (cache.get("ols") == null) {
    do {
      res = UrlFetchApp.fetch(ontologiesUri);
      text = res.getContentText('utf-8');
      json = JSON.parse(text);
      ontologies = ontologies.concat(json._embedded.ontologies);
      ontologiesUri = json._links && json._links.next && json._links.next.href;
    }
    while (ontologiesUri);
    // store into cache the result as plain text
    splitResultAndCache(cache, "ols", JSON.stringify(ontologies));
  } else {
    ontologies = JSON.parse(getCacheResultAndMerge(cache, "ols"));
  }

  var ontologyDict = {};
  ontologies.forEach(function(ontology) {
    var config = ontology.config || {};
    ontologyDict[ontology.ontologyId] = {
      name: config.title,
      uri: config.id
    };
  });
  return ontologyDict;
}

