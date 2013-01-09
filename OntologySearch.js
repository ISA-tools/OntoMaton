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

function ontologySearch() {
    var mydoc = SpreadsheetApp.getActiveSpreadsheet();

    var app = UiApp.createApplication().setHeight(480);
    createOntologySearchGUI(app);
    app.setTitle("Move");

    var progressIndicator = app.getElementById("progressIndicator");
    var searchButton = app.getElementById("searchButton");
    var searchBox = app.getElementById("searchTerm");
    var loadSpinner = app.createClientHandler().forTargets(progressIndicator).setVisible(true);
    var buttonDisabler = app.createClientHandler().forEventSource().setEnabled(false);
    var enterKeyHandler = app.createServerKeyHandler('handleEnterKeyEvent');
  
    searchBox.addKeyUpHandler(enterKeyHandler);
    searchBox.addKeyUpHandler(loadSpinner);
  
    var clickHandlerOnSearchBox = app.createClientHandler().forTargets(searchBox).setText("");
    searchBox.addClickHandler(clickHandlerOnSearchBox);

    var submitHandler = app.createServerClickHandler("searchBioportal");
    submitHandler.addCallbackElement(app.getElementById("searchTerm"));
    searchButton.addClickHandler(submitHandler);
    searchButton.addClickHandler(loadSpinner);
    searchButton.addClickHandler(buttonDisabler);

    SpreadsheetApp.getActiveSpreadsheet().show(app);
}

function createOntologySearchGUI(app) {
    var absolutePanel = app.createAbsolutePanel();
    absolutePanel.setSize(480, 480);
    
    absolutePanel.add(app.createImage("http://isatab.sf.net/assets/img/tools/ontomaton-search.png"),120,0);

    // adding search entry field and button
    var searchBox = app.createTextBox().setStyleAttribute("background", "WhiteSmoke").setStyleAttribute(
      "font-family", "sans-serif").setStyleAttribute("font-size", "11px").setStyleAttribute("color", "#939495").setStyleAttribute("border", "none");
    searchBox.setHeight(25).setWidth(220);  
    searchBox.setName("searchTerm");
    searchBox.setId("searchTerm");
    searchBox.setText("Enter Search Term");
  
    var searchButton = app.createButton().setText("Search").setStyleAttribute("background", "#81A32B").setStyleAttribute("font-family", "sans-serif").setStyleAttribute("color", "#ffffff").setStyleAttribute("border", "none");
    searchButton.setHeight(25).setWidth(59);  
    searchButton.setId("searchButton");
    
    absolutePanel.add(searchBox, 95, 86);
    absolutePanel.add(searchButton, 325, 82);
    absolutePanel.add(app.createImage("http://mentalized.net/activity-indicators/indicators/netlife/spinner3-greenie.gif").setHeight(30).setWidth(30).setId("progressIndicator").setVisible(false),400,82);  
    
    // adding results pane.
    var scrollPanel = app.createScrollPanel().setStyleAttribute("background", "whiteSmoke");
    scrollPanel.setHeight(308).setWidth(461);
    scrollPanel.setId("resultScroller");
  
    absolutePanel.add(scrollPanel, 16, 134);
    
    // finally adding footer showing any errors and the isatools logo.
    absolutePanel.add(createLabel(app, "", "sans-serif", "bold", "11px", "crimson").setId("termDefinition").setWidth(300), 16, 450);
    absolutePanel.add(app.createImage("http://isatab.sourceforge.net/assets/img/isatools-sml.png"),380,450);
    
    app.add(absolutePanel);
  
    return app;
}

function handleEnterKeyEvent(e) {
    var app = UiApp.getActiveApplication();
    if (e.parameter.keyCode == 13) {
        app.getElementById("progressIndicator").setVisible(true);
        Logger.log("Enter key pressed");
        return searchBioportal(e);
    } else {
        app.getElementById("progressIndicator").setVisible(false);
        return app;
    }
}


function searchBioportal(e) {
    var app = UiApp.getActiveApplication();

    try {
        // only perform a search if there is a difference
        var restriction = findRestrictionForCurrentColumn();

        if (e.parameter.searchTerm.length > 2) {
            // todo check if particular column has a restriction in the hidden sheet. If so, restrict the search.
            var searchString = "http://rest.bioontology.org/bioportal/search/" + e.parameter.searchTerm + 
                "/?ontologyids=" + restriction.ontologyId + "&subtreerootconceptid=" + restriction.branch + 
                "&apikey=fd88ee35-6995-475d-b15a-85f1b9dd7a42";
            
            // we cache results and try to retrieve them on every new execution.
            var cacheResult = fetchFromCache(searchString);
            var text;
            
            if(cacheResult != null) {
                text = cacheResult;
                SpreadsheetApp.getActiveSpreadsheet().toast("Terms retrieved from cache.", "Cache accessed", -1);
            } else {
                text = UrlFetchApp.fetch(searchString).getContentText();
                storeInCache(searchString, text);
            }

            var doc = Xml.parse(text, true);
            var searchResultBeans = doc.success.data.page.contents.searchResultList.getElements("searchBean");

            var tree = app.createTree().setAnimationEnabled(true).setWidth(450).setId("ontologyTree");
            // tree styling
            tree.setStyleAttribute("font-family", "sans-serif").setStyleAttribute("color", "#666").setStyleAttribute("background", "none").setStyleAttribute("font-weight", "lighter");
            tree.setWidth(450);
            var rootPanel = app.createHorizontalPanel();
            var rootLabel = app.createHTML("<span style=\"font-size:11px;font-weight:bold;color:olivedrab\">" + searchResultBeans.length + " results for " + e.parameter.searchTerm + "</span>");
            rootPanel.add(rootLabel);

            var rootNode = app.createTreeItem().setWidget(rootPanel).setId("resultNode");

            tree.addItem(rootNode);
          
          var ontologyDictionary = {};
          
          for (var resultIndex in searchResultBeans) {
                var result = searchResultBeans[resultIndex];
                var ontologyLabel = result.ontologyDisplayLabel.getText() + " (version " + result.ontologyVersionId.getText() + ")";

                if (ontologyDictionary[ontologyLabel] == undefined) {
                    var panel = app.createHorizontalPanel();
                    var ontologyInformationLabel = app.createHTML("<span style=\"font-size:11px;font-weight:bold\">" + ontologyLabel + "</span>");
                    panel.add(ontologyInformationLabel);
                    ontologyDictionary[ontologyLabel] = app.createTreeItem().setWidget(panel).setId(ontologyLabel);
                    rootNode.addItem(ontologyDictionary[ontologyLabel]);
                }

                var panel = app.createHorizontalPanel();
                var selectButton = app.createButton("<div style=\"font-size:10px;padding-top:0;font-weight:bold\">Select</div>").setHeight(17).setWidth(45)
                    .setId(result.preferredName.getText() + "::" + result.conceptId.getText() + "::" + result.ontologyId.getText() + "::" + result.conceptIdShort.getText() + "::" + result.ontologyVersionId.getText() + "::" + result.ontologyDisplayLabel.getText());
                selectButton.setStyleAttribute("background", "#666").setStyleAttribute("color", "#fff").setStyleAttribute("border", "none");
            
                var detailButton = app.createButton("<div style=\"font-size:10px;padding-top:0;font-weight:bold\">Details</div>").setHeight(17).setWidth(45)
                    .setId(result.preferredName.getText() + "::" + result.conceptId.getText() + "::" + result.ontologyId.getText() + "::" + result.conceptIdShort.getText() + "::" + result.ontologyVersionId.getText() + "::" + result.ontologyDisplayLabel.getText() + "::detail");
                detailButton.setStyleAttribute("background", "#666").setStyleAttribute("color", "#fff").setStyleAttribute("border", "none");

                var label = app.createHTML("<div style=\"padding-top:4px; padding-left:3px\"><span style=\"font-size:11px\">" + result.preferredName.getText() + "</span></div>");
                panel.add(selectButton);
                panel.add(detailButton);
                //panel.add(definitionButton);
                panel.add(label);

                var selectHandler = app.createServerClickHandler("itemSelectionHandler");
                selectButton.addClickHandler(selectHandler);
            
                var detailHandler = app.createServerClickHandler("itemDefinitionHandler");
                detailButton.addClickHandler(detailHandler);

              
                var treeItem = app.createTreeItem().setWidget(panel);

                ontologyDictionary[ontologyLabel].addItem(treeItem);
            }

            app.getElementById("resultScroller").clear();
            app.getElementById("resultScroller").add(tree);

            // Need to add a listener to the tree to get the selected term.
            // this then needs to be inserted into the spreadsheet cell, if running normally,
            // or if an investigation sheet is detected, things are done as in ISAcreator.
            app.getElementById("termDefinition").setStyleAttribute("color", "crimson").setText(""); 
        } else {
            app.getElementById("termDefinition").setStyleAttribute("color", "crimson").setText("Please enter a term with 3 or more characters. ");
            app.createDialogBox(false, true).setText("Please enter a term with more than 3 characters").setTitle("Input Error");
        }
    } catch (e) {
        Logger.log(e.message);
        app.getElementById("termDefinition").setStyleAttribute("color", "crimson").setText("Sorry, BioPortal appears to be having problems present. Sorry for the inconvenience.");
        //app.getElementById("termDefinition").setStyleAttribute("color", "crimson").setText(e.message);
    } finally {
      app.getElementById("progressIndicator").setVisible(false);
      app.getElementById("searchButton").setEnabled(true);
    }
    
    return app;
}

function itemSelectionHandler(e) {
    var app = UiApp.getActiveApplication();
    var value = e.parameter.source;

    var ontologyObject = createOntologyObjectFromString(value);

    app.getElementById("termDefinition").setStyleAttribute("color", "#414241").setText(ontologyObject.term + " added to cell(s)!");
 
    var sheet = SpreadsheetApp.getActiveSheet();
    var selectedRange = sheet.getActiveSelection();

    // figure out where the source ref and accession columns exist, if they do exist at all. Insertion technique will vary
    // depending on the file being looked at.
    var sourceAndAccessionPositions = getSourceAndAccessionPositionsForTerm(selectedRange.getColumn());

    // add all terms into a separate sheet with all their information.
    insertTermInformationInTermSheet(ontologyObject);
  
    if (sourceAndAccessionPositions.sourceRef != undefined && sourceAndAccessionPositions.accession != undefined) {
      insertOntologySourceInformationInInvestigationBlock(ontologyObject);
    }

    for (var row = selectedRange.getRow(); row <= selectedRange.getLastRow(); row++) {
        Logger.log(selectedRange.getRow() + " " + selectedRange.getColumn());

        // if the currently selected column is an ISA defined ontology term, then we should insert the source and accession in subsequent
        // columns and add the ontology source information to the investigation file if it doesn't already exist.
        if (sourceAndAccessionPositions.sourceRef != undefined && sourceAndAccessionPositions.accession != undefined) {
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
               sheet.getRange(row, selectedColumn).setValue('=hyperlink("'+  ontologyObject.accession +'";"' + ontologyObject.term + '")')
            }
        }
    }
    return app;
}

