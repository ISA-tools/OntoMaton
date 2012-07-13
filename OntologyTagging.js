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

function autotagTerms() {
    var mydoc = SpreadsheetApp.getActiveSpreadsheet();

    var app = UiApp.createApplication().setHeight(500);
    app.add(app.loadComponent("TermTaggerGUI"));
    app.setTitle("Move");

    // Setting
    var progressIndicator = app.getElementById("progressIndicator")
        .setUrl("http://mentalized.net/activity-indicators/indicators/netlife/spinner3-greenie.gif");

    var loadSpinner = app.createClientHandler()
        .forTargets(progressIndicator)
        .setVisible(true);
    var searchButton = app.getElementById("tagTerms");

    var submitHandler = app.createServerClickHandler("tagTermHandler");
    searchButton.addClickHandler(submitHandler);
    searchButton.addClickHandler(loadSpinner);

    SpreadsheetApp.getActiveSpreadsheet().show(app);
}

function tagTermHandler() {

    try {
        var app = UiApp.getActiveApplication();
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
            var restriction = findRestrictionForCurrentColumn();

            Logger.log("values to send " + valuesToTag);

            var payload =
            {
                "apikey":"fd88ee35-6995-475d-b15a-85f1b9dd7a42",
                "withSynonyms":"true",
                "wholeWords":"true",
                "scored":"false",
                "textToAnnotate":valuesToTag
            };

            var options =
            {
                "method":"post",
                "payload":payload
            };

            var result = UrlFetchApp.fetch("http://rest.bioontology.org/obs/annotator", options).getContentText();

            var doc = Xml.parse(result, true);
            var annotations = doc.success.data.annotatorResultBean.annotations.getElements("annotationBean");

            var ontologies = processOntologiesInAnnotatorResult(doc.success.data.annotatorResultBean.ontologies.getElements("ontologyUsedBean"), restriction.ontologyId);

            Logger.log("There are " + annotations.length + " results.");
            for (var annotation in annotations) {
                var annotationResult = annotations[annotation];
                var concept = annotationResult.context.term.concept;
                var ontology = ontologies[concept.localOntologyId.getText()];

                if (ontology != undefined) {
                    // add each result to an object in valuesToSend dictionary. We'll use this to build the tree.
                    for (var originalTerm in valuesToSend) {
                        if (originalTerm.indexOf(valuesToTag.substring(annotationResult.context.from.getText(), annotationResult.context.to.getText())) != -1) {
                            var valueToAnnotatorResult = valuesToSend[originalTerm];

                            if (valueToAnnotatorResult.results == undefined) {
                                valueToAnnotatorResult.results = {};
                            }
                            var fullId = concept.fullId.getText();
                            valueToAnnotatorResult.results[fullId] = new Object();
                            valueToAnnotatorResult.results[fullId].term = concept.preferredName.getText();
                            valueToAnnotatorResult.results[fullId].accession = concept.fullId.getText();
                            valueToAnnotatorResult.results[fullId].ontologyId = ontology.ontologyId;
                            valueToAnnotatorResult.results[fullId].ontologyDescription = ontology.ontologyDescription;
                            valueToAnnotatorResult.results[fullId].ontologyVersion = concept.localOntologyId.getText();
                        }
                    }
                }
            }


            var tree = app.createTree().setAnimationEnabled(true).setWidth(350).setId("ontologyTree");
            // tree styling
            tree.setStyleAttribute("font-family", "sans-serif").setStyleAttribute("color", "#666").setStyleAttribute("background", "none");

            var rootPanel = app.createHorizontalPanel();
            var rootLabel = app.createHTML("<span style=\"font-size:12px;font-weight:bold;color:olivedrab\">Results - choose replacement(s) for free text</span>");
            rootPanel.add(rootLabel);

            var rootNode = app.createTreeItem().setWidget(rootPanel).setId("resultNode");

            tree.addItem(rootNode);

            var ontologyDictionary = {};

            for (var value in valuesToSend) {
                var freeTextToTerms = valuesToSend[value];

                var freeTextValuePanel = app.createHorizontalPanel();
                var freeTextValueInformationLabel = app.createHTML("<span style=\"font-size:12px;font-weight:lighter;\">" + value + "</span>");
                freeTextValuePanel.add(freeTextValueInformationLabel);

                var freeTextTermTreeItem = app.createTreeItem().setWidget(freeTextValuePanel);

                rootNode.addItem(freeTextTermTreeItem);


                for (var result in freeTextToTerms.results) {
                    var resultObj = freeTextToTerms.results[result];

                    var key = value + resultObj.ontologyDescription;

                    if (ontologyDictionary[key] == undefined) {

                        var panel = app.createHorizontalPanel();
                        var ontologyInformationLabel = app.createHTML("<span style=\"font-size:11px;font-weight:bold\">" + resultObj.ontologyDescription + "</span>");
                        panel.add(ontologyInformationLabel);

                        ontologyDictionary[key] = app.createTreeItem().setWidget(panel).setId(resultObj.ontologyDescription);

                        freeTextTermTreeItem.addItem(ontologyDictionary[key]);
                    }

                    var panel = app.createHorizontalPanel();
                    var button = app.createButton("<div style=\"font-size:10px\">Replace</div>").setSize("40px", "10px")
                        .setId(resultObj.term + "::" + resultObj.accession + "::" + resultObj.ontologyId + "::" + resultObj.conceptIdShort + "::" + resultObj.ontologyVersion + "::" + resultObj.ontologyDescription + "::" + value);
                    button.setStyleAttribute("background", "#E6E7E8").setStyleAttribute("color", "#666").setStyleAttribute("padding-top", "0px");

                    var label = app.createHTML("<div style=\"padding-top:4px; padding-left:3px\"><span style=\"font-size:11px\">"
                        + resultObj.term + " <span style=\"color:olivedrab;\">(" + resultObj.ontologyDescription + " version " + resultObj.ontologyVersion + ")</span></span></div>");
                    panel.add(button);

                    var selectHandler = app.createServerClickHandler("replaceItemSelectionHandler");
                    button.addClickHandler(selectHandler);

                    // add selection listener for the button.
                    panel.add(label);
                    ontologyDictionary[key].addItem(app.createTreeItem().setWidget(panel));

                }
            }

            app.getElementById("resultScroller").clear();
            app.getElementById("resultScroller").add(tree);
        } else {
            app.getElementById("termDefinition").setText("Please select cells with content.");
        }
    } catch (e) {
        app.getElementById("termDefinition").setText("Problem encountered searching in BioPortal.");
    } finally {
        app.getElementById("progressIndicator").setVisible(false);
    }

    return app;
}

// As a result of the way in which the annotator works and the results it contains, we have to collect the ontologies
// listed from the result XML and use this to filter the results afterwards. We also need it to get the description for the
// ontology.
function processOntologiesInAnnotatorResult(ontologyList, ontologyId) {
    var ontologies = {};

    for (var ontology in ontologyList) {
        var ontologyBean = ontologyList[ontology];

        var localOntologyId = ontologyBean.localOntologyId.getText();

        if (ontologyId == "" || ontologyBean.virtualOntologyId.getText() == ontologyId) {
            if (ontologies[localOntologyId] == undefined) {
                ontologies[localOntologyId] = new Object();
                ontologies[localOntologyId].ontologyId = ontologyBean.virtualOntologyId.getText();
                ontologies[localOntologyId].ontologyDescription = ontologyBean.name.getText();
            }
        }
    }
    return ontologies;
}

function replaceItemSelectionHandler(e) {
    var app = UiApp.getActiveApplication();
    var value = e.parameter.source;
    Logger.log(value);
    var ontologyObject = createOntologyObjectFromString(value);

    insertTermInformationInTermSheet(ontologyObject);

    app.getElementById("termDefinition").setText(ontologyObject.freeText + " replaced by " + ontologyObject.term);
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
                    sheet.getRange(row, selectedRange.getColumn()).setValue(ontologyObject.term + "(" + ontologyObject.accession + ")");
                }
            }
        }
    }
    return app;
}
