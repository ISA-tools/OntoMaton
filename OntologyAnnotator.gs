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
// Attribution Copyright Notice: Copyright (c) 2007-2015 ISA Team
// Attribution Phrase: Developed by the ISA Team
// Attribution URL: http://www.isa-tools.org
// Graphic Image provided in the Covered Code as file: http://isatab.sf.net/assets/img/tools/ontomaton-part-of-isatools.png
// Display of Attribution Information is required in Larger Works which are defined in the CPAL as a work which combines Covered Code or portions thereof with code not governed by the terms of the CPAL.


function performAnnotation() {
    try {
        var sheet = SpreadsheetApp.getActiveSheet();
        var selectedRange = SpreadsheetApp.getActiveRange();

        var valuesToSend = {};
        for (var rowIndex = selectedRange.getRow(); rowIndex <= selectedRange.getLastRow(); rowIndex++) {
            for (var columnIndex = selectedRange.getColumn(); columnIndex <= selectedRange.getLastColumn(); columnIndex++) {
                var value = sheet.getRange(rowIndex, columnIndex).getValue();
                if (valuesToSend[value] == undefined) {
                    valuesToSend[value] = new Object();
                }
            }
        }
      
        var valuesToTag = "";
        for (var valueToTag in valuesToSend) {

            valuesToTag += valueToTag + " ";
            valuesToSend[valueToTag].from = valuesToTag.indexOf(valueToTag);
            valuesToSend[valueToTag].to = valuesToSend[valueToTag].from + valueToTag.length;
        }

        if (valuesToTag != "") {
            var payload =
            {
                "apikey": "fd88ee35-6995-475d-b15a-85f1b9dd7a42",
                "withSynonyms": "true",
                "wholeWords": "true",
                "include": "prefLabel",
                "text": valuesToTag
            };

            var options =
            {
                "method": "post",
                "payload": payload
            };

            var result = UrlFetchApp.fetch("http://data.bioontology.org/annotator", options).getContentText();

            var ontologies = getBioPortalOntologies();

            var doc = JSON.parse(result, true);

            for (var annotation in doc) {
                var annotationResult = doc[annotation].annotatedClass;
                var concept = annotationResult.prefLabel;

                var ontologyId = annotationResult.links.ontology;

                var ontologyAbbreviation = annotationResult.links.ontology.substring(annotationResult.links.ontology.lastIndexOf("/") + 1);
                var ontologyName = ontologies[ontologyAbbreviation].name;

                if (ontologyId != undefined) {
                    // add each result to an object in valuesToSend dictionary. We'll use this to build the tree.
                    for (var originalTerm in valuesToSend) {
                        for (var annotationIndex in doc[annotation].annotations) {
                            var annotationDetails = doc[annotation].annotations[annotationIndex];
                            if (originalTerm.indexOf(valuesToTag.substring(annotationDetails.from, annotationDetails.to)) != -1) {
                                var valueToAnnotatorResult = valuesToSend[originalTerm];

                                if (valueToAnnotatorResult.results == undefined) {
                                    valueToAnnotatorResult.results = {};
                                }

                                if (valueToAnnotatorResult.results[ontologyAbbreviation] == undefined) {
                                    valueToAnnotatorResult.results[ontologyAbbreviation] = {"ontology-name": ontologyName, "terms": []};
                                }

                              var ontology_record = {"label": concept, "id": annotationResult["@id"], "ontology-label": ontologyAbbreviation, "ontology-name": ontologyName, "accession": annotationResult["@id"], "ontology": ontologyId, "details": "", "freeText":originalTerm};
                                var ontology_record_string = JSON.stringify(ontology_record);
                              
                                storeInCache(annotationResult["@id"], ontology_record_string);
                              
                                valueToAnnotatorResult.results[ontologyAbbreviation].terms.push(ontology_record);
                            }
                        }
                    }
                }
            }

            return valuesToSend;

        } else {
            throw 'Please select spreadsheet cells with content for tagging to work.';
        }
    } catch (e) {
      throw e;
    }
}

function replaceTermWithSelectedValue(term_id) {

    var term = JSON.parse(fetchFromCache(term_id));
    var ontologyObject = {
        "term": term["label"],
        "accession": term_id,
        "ontologyId": term["ontology-label"],
        "ontologyVersion": term["ontology"],
        "ontologyDescription": term["ontology-name"],
        "freeText": term["freeText"]
    }

    insertTermInformationInTermSheet(ontologyObject);

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = SpreadsheetApp.getActiveSheet();
    var selectedRange = sheet.getActiveSelection();

    // figure out where the source ref and accession columns exist, if they do exist at all. Insertion technique will vary
    // depending on the file being looked at.
    var sourceAndAccessionPositions = getSourceAndAccessionPositionsForTerm(selectedRange.getColumn());

    for (var row = selectedRange.getRow(); row <= selectedRange.getLastRow(); row++) {

        for (var col = selectedRange.getColumn(); col <= selectedRange.getLastColumn(); col++) {
            // if the currently selected column is an ISA defined ontology term, then we should insert the source and accession in subsequent
            // columns and add the ontology source information to the investigation file if it doesn't already exist.
            // we do a replacement if we have a match with the free text version.
            if (sheet.getRange(row, col).getValue() == ontologyObject.freeText) {
                if (sourceAndAccessionPositions.sourceRef != undefined && sourceAndAccessionPositions.accession != undefined) {
                    insertOntologySourceInformationInInvestigationBlock(ontologyObject);
                    sheet.getRange(row, selectedRange.getColumn()).setValue(ontologyObject.term);
                    sheet.getRange(row, sourceAndAccessionPositions.sourceRef).setValue(ontologyObject.ontologyId);
                    sheet.getRange(row, sourceAndAccessionPositions.accession).setValue(ontologyObject.accession);
                } else {
                  
            var isDefaultInsertionMechanism = isCurrentSettingOnDefault();
            var selectedColumn = selectedRange.getColumn();
            var nextColumn = selectedColumn +1;
            if(!isDefaultInsertionMechanism) {
              sheet.getRange(row, selectedColumn).setValue(ontologyObject.term); 
              sheet.getRange(row, nextColumn).setValue(ontologyObject.accession);
            } else {
              sheet.getRange(row, selectedColumn).setFormula('=HYPERLINK("'+  ontologyObject.accession +'","' + ontologyObject.term + '")')
            }
                }
            }
        }
    }
}
