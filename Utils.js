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


function getSourceAndAccessionPositionsForTerm(column) {
    // we will look at positions 1 & 2 after the column to determine if the source and accession columns
    // particular to ISAtab are present.
    var sheet = SpreadsheetApp.getActiveSheet();
    var sourceObject = new Object();

    for (var columnIndex = column + 1; columnIndex <= column + 2; columnIndex++) {
        if (sheet.getRange(1, columnIndex).getValue() == "Term Source Ref") {
            sourceObject.sourceRef = columnIndex;
        }
        if (sheet.getRange(1, columnIndex).getValue() == "Term Accession Number") {
            sourceObject.accession = columnIndex;
        }
    }

    return sourceObject;
}

function createOntologyObjectFromString(ontologyString) {
    // processes the ontology string into an ontology object to be used for population of ISA sections.
    var ontologyDetails = ontologyString.split("::");
    var ontologyObject = new Object();
    // BioPortal -> cy5::http://purl.obolibrary.org/obo/CHEBI_37989::1123::47203::Ontology for Biomedical Investigations
    // LOV ->   swpo:hasStreetAddress::http://sw-portal.deri.org/ontologies/swportal#hasStreetAddress
    ontologyObject.term = ontologyDetails[0];
    ontologyObject.accession = ontologyDetails[1];
    ontologyObject.ontologyId = ontologyDetails[2];
    ontologyObject.conceptId = ontologyDetails[3];
    ontologyObject.ontologyVersion = ontologyDetails[4];
    ontologyObject.ontologyDescription = ontologyDetails[5];
    // we will have an additional freeText variable from the auto tagger value
    if (ontologyDetails.length > 5) {
        ontologyObject.freeText = ontologyDetails[6];
    }

    return ontologyObject;
}

function insertOntologySourceInformationInInvestigationBlock(ontologyObject) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();

    var investigationSheet;
    var ontologySectionStartIndex;


    // find investigation file
    for (var sheet in sheets) {
        if (sheets[sheet].getName().indexOf("i_") > -1) {
            Logger.log("Found investigation file..." + sheets[sheet].getName())
            // we've now got the investigation file.
            // insert the ontology source information if it doesn't already exist here.
            investigationSheet = sheets[sheet];
            break;
        }
    }

    // find section we're looking for.
    if (investigationSheet != undefined) {
        // we need to find the section, which should always be at position 1 in the investigation file.
        // However, we should be careful and allow for automated discovery of the location.
        for (var row = 1; row <= investigationSheet.getLastRow(); row++) {
            if (investigationSheet.getRange(row, 1).getValue() == "ONTOLOGY SOURCE REFERENCE") {
                ontologySectionStartIndex = row;
                break;
            }
        }
    }

    if (ontologySectionStartIndex != undefined) {
        // now we can proceed to adding the information about the ontology source, if it doesn't already exist.

        var locationInformation = getIndexesToInsertInto(investigationSheet, ontologySectionStartIndex, ontologyObject.ontologyId);

        investigationSheet.getRange(locationInformation.sourceName, locationInformation.insertionPoint).setValue(ontologyObject.ontologyId);
        investigationSheet.getRange(locationInformation.sourceFile, locationInformation.insertionPoint).setValue("");
        investigationSheet.getRange(locationInformation.sourceVersion, locationInformation.insertionPoint).setValue(ontologyObject.ontologyVersion);
        investigationSheet.getRange(locationInformation.sourceDescription, locationInformation.insertionPoint).setValue(ontologyObject.ontologyDescription);
    }
  

}

function getIndexesToInsertInto(sheet, ontologySectionIndex, sourceName) {
    // will find either the place where this source name currently resides (to update it) or the place to insert all other terms.
    var locationInformation = new Object();
    // default.
    locationInformation.insertionPoint = 2;
    sheet.insertColumns(sheet.getLastColumn(), 1);

    for (var rowIndex = ontologySectionIndex + 1; rowIndex <= ontologySectionIndex + 4; rowIndex++) {
        var value = sheet.getRange(rowIndex, 1).getValue();
        if (value == "Term Source Name") {
            locationInformation.sourceName = rowIndex;
            for (var columnIndex = 2; columnIndex <= sheet.getMaxColumns(); columnIndex++) {
                // if the value is empty, or equals the current source name, then add it.
                if (sheet.getRange(rowIndex, columnIndex).getValue() == "" || sheet.getRange(rowIndex, columnIndex).getValue() == sourceName) {
                    locationInformation.insertionPoint = columnIndex;
                    break;
                }
            }
        } else if (value == "Term Source File") {
            locationInformation.sourceFile = rowIndex;
        } else if (value == "Term Source Version") {
            locationInformation.sourceVersion = rowIndex;
        } else if (value == "Term Source Description") {
            locationInformation.sourceDescription = rowIndex;
        }
    }
  
    return locationInformation;
}

function insertTermInformationInTermSheet(ontologyObject) {
    var termSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Terms");
    
    if(termSheet == undefined) {
        termSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Terms");
        SpreadsheetApp.getActiveSpreadsheet().toast("The Term sheet is used to maintain information about all the ontologies you have entered.", 
                                                    "Term Sheet Added Automatically", -1);
    }

    if(termSheet != undefined) {
        // we have a term sheet, so we can enter information about the term here. 
        var insertionRow = findNextBlankRow(termSheet);
        termSheet.getRange(insertionRow, 1).setValue(ontologyObject.term);
        termSheet.getRange(insertionRow, 2).setValue(ontologyObject.accession);
        termSheet.getRange(insertionRow, 3).setValue(ontologyObject.ontologyId);
        termSheet.getRange(insertionRow, 4).setValue(ontologyObject.ontologyVersion);
        termSheet.getRange(insertionRow, 5).setValue(ontologyObject.ontologyDescription);
    }
}


function findNextBlankRow(sheet) {
  return sheet.getLastRow()+1;
}

function findRestrictionForCurrentColumn() {
  var restriction = new Object();
    restriction.ontologyId = "";
    restriction.source = "";
    restriction.branch = "";
    restriction.version = "";
    restriction.service = "";
  
  try {
  
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var restrictionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Restrictions");
    
    var activeSheet = SpreadsheetApp.getActiveSheet();
    var selectedRange = activeSheet.getActiveSelection();
    
    var columnName = activeSheet.getRange(1, selectedRange.getColumn()).getValue();
    var transposedColumnName = activeSheet.getRange(selectedRange.getRow(), 1).getValue();
    
    Logger.log("Getting restriction for " + columnName);
    
    if (restrictionSheet != undefined) {
            
      for (var row = 1; row <= restrictionSheet.getLastRow(); row++) {
              
              var restrictionColumn = restrictionSheet.getRange(row, 1).getValue();
              
              if (restrictionColumn == columnName) {
                    restriction.ontologyId = restrictionSheet.getRange(row, 2).getValue();
                    restriction.branch = restrictionSheet.getRange(row, 3).getValue();
                    restriction.version = restrictionSheet.getRange(row, 4).getValue();
                    restriction.service = restrictionSheet.getRange(row, 5).getValue();
                    return restriction;
                }
        
              if(restrictionColumn == transposedColumnName) {
                    restriction.ontologyId = restrictionSheet.getRange(row, 2).getValue();
                    restriction.branch = restrictionSheet.getRange(row, 3).getValue();
                    restriction.version = restrictionSheet.getRange(row, 4).getValue();
                    restriction.service = restrictionSheet.getRange(row, 5).getValue();
                    return restriction;
              }
    }
  }
       
} catch(e) {
  app.getElementById("termDefinition").setStyleAttribute("color", "crimson").setText(e.message);
} finally {
  return restriction;
}
}


function fetchFromCache(searchString) {
  var cache = CacheService.getPublicCache();
  var cachedContent = cache.get(searchString);
  if (cachedContent != null) {
    return cachedContent;
  }
}

function storeInCache(searchString, content) {
  try {
  var cache = CacheService.getPublicCache();
  cache.put(searchString, content, 1500); // caches result for 25 minutes
  } catch(e) {
    Logger.log("Can't store this value.")
  }
}

function createLabel(app, text, fontfamily, fontweight, fontsize, color) {
     var label = app.createLabel(text); 
     label.setStyleAttribute("font-family", fontfamily).setStyleAttribute("font-weight", fontweight)
       .setStyleAttribute("font-size", fontsize).setStyleAttribute("color", color);
     return label;
}

function sortOnKeys(dict) {

    var sorted = [];
    for(var key in dict) {
        sorted[sorted.length] = key;
    }
  sorted.sort();

    var tempDict = {};
    for(var i = 0; i < sorted.length; i++) {
        tempDict[sorted[i]] = dict[sorted[i]];
    }

    return tempDict;
}

function itemDefinitionHandler(e) {
    var app = UiApp.getActiveApplication();
    var value = e.parameter.source;
    
    var term = value.substring(0,value.indexOf("::"));
    var definition = value.substring(value.lastIndexOf("::") + 2);

    SpreadsheetApp.getActiveSpreadsheet().toast("Definition: " + definition, term, -1);

    return app;
}


function itemDefinitionHandlerLOV(e) {

    var app = UiApp.getActiveApplication();
    var value = e.parameter.source;
    Logger.log("itemDefinitionHandlerLOV "+value);
  
    var term = value.substring(0,value.indexOf("::"));
    var definition = value.substring(value.lastIndexOf("::") + 2);    

    if(definition == "") {
      definition = "No definition available for this term.";
    }
  
    SpreadsheetApp.getActiveSpreadsheet().toast(definition, term, -1);

    return app;
}

/**
   The cache items have a limited size. This method splits up large 
   results and can put them back together again
   
   cache is an instance of CacheService
   cache key will be something like lov or bioportal
   toStore is the text to keep
**/
function splitResultAndCache(cache, cacheKey, toStore) {
  var fragments = 1;
  if(toStore.length > 5000) {
    fragments = Math.floor(toStore.length/5000 + (toStore.length%5000 > 0 ? 1 : 0));
  }
  
  var fragmentCount = 0;
  while(fragmentCount < fragments) {
    var string_fragment = toStore.substring(fragmentCount * 5000, (fragmentCount + 1) *5000);
    cache.put(cacheKey + "_" + fragmentCount, string_fragment, 5000);
    fragmentCount++;
  }
  Logger.log("There are " + fragmentCount + " fragments.");
  cache.put(cacheKey + "_fragments", fragmentCount, 5000);
}


function getCacheResultAndMerge(cache, cacheKey) {
    var fragments = cache.get(cacheKey + "_fragments");
    
    var fullResult = "";
    
    var fragmentCount = 0;
    while(fragmentCount < fragments) {
       fullResult += cache.get(cacheKey + "_" + fragmentCount);
       fragmentCount++;
  }
  return fullResult;
  
}

function getTextFromHtml(html) {
  return getTextFromNode(Xml.parse(html, true).getElement());
}

function getTextFromNode(x) {
  switch(x.toString()) {
    case 'XmlText': return x.toXmlString();
    case 'XmlElement': return x.getNodes().map(getTextFromNode).join('');
    default: return '';
  }
}
