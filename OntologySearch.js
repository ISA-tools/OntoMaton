function onOpen() {
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var ontologyMenu = [
        {name:"Ontology Search", functionName:"ontologySearch"},
        {name:"Autotag with Ontologies", functionName:"autotagTerms"}
    ];

    spreadsheet.addMenu("OntoMaton", ontologyMenu);

}

function ontologySearch() {
    var mydoc = SpreadsheetApp.getActiveSpreadsheet();

    var app = UiApp.createApplication().setHeight(480);
    app.add(app.loadComponent("OntologySearchGUI"));
    app.setTitle("Drag to move");

    // Setting

    var progressIndicator = app.getElementById("progressIndicator")
        .setUrl("http://mentalized.net/activity-indicators/indicators/netlife/spinner3-greenie.gif");

    var loadSpinner = app.createClientHandler().forTargets(progressIndicator).setVisible(true);

    var buttonDisabler = app.createClientHandler().forEventSource().setEnabled(false);

    var searchButton = app.getElementById("searchButton");
    var searchBox = app.getElementById("searchTerm");

    var enterKeyHandler = app.createServerKeyHandler('handleEnterKeyEvent');
    searchBox.addKeyUpHandler(enterKeyHandler);
    searchBox.addKeyUpHandler(loadSpinner);


    var submitHandler = app.createServerClickHandler("searchBioportal");
    submitHandler.addCallbackElement(app.getElementById("searchTerm"));
    searchButton.addClickHandler(submitHandler);
    searchButton.addClickHandler(loadSpinner);
    searchButton.addClickHandler(buttonDisabler);

    SpreadsheetApp.getActiveSpreadsheet().show(app);
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
            
            Logger.log(searchString);

            var text = UrlFetchApp.fetch(searchString).getContentText();
            var doc = Xml.parse(text, true);
            var searchResultBeans = doc.success.data.page.contents.searchResultList.getElements("searchBean");

            var tree = app.createTree().setAnimationEnabled(true).setWidth(350).setId("ontologyTree");
            // tree styling
            tree.setStyleAttribute("font-family", "sans-serif").setStyleAttribute("color", "#666").setStyleAttribute("background", "none");

            var rootPanel = app.createHorizontalPanel();
            var rootLabel = app.createHTML("<span style=\"font-size:11px;font-weight:bold;color:olivedrab\">" + searchResultBeans.length + " results</span>");
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
                var selectButton = app.createButton("<div style=\"font-size:10px;padding-top:0;font-weight:bold\">Select</div>").setSize("30px", "10px")
                    .setId(result.preferredName.getText() + "::" + result.conceptId.getText() + "::" + result.ontologyId.getText() + "::" + result.conceptIdShort.getText() + "::" + result.ontologyVersionId.getText() + "::" + result.ontologyDisplayLabel.getText());
                selectButton.setStyleAttribute("background", "#E6E7E8").setStyleAttribute("color", "#666");

                //var definitionButton  = app.createButton("<div style=\"font-size:10px;padding-top:0\">Definition</div>").setSize("47px", "10px")
                //    .setId(result.preferredName.getText() + "::" + result.conceptId.getText() + "::" + result.ontologyId.getText() +"::" + result.conceptIdShort.getText() + "::" + result.ontologyVersionId.getText());
                //definitionButton.setStyleAttribute("background", "#E6E7E8").setStyleAttribute("color", "#666");

                var label = app.createHTML("<div style=\"padding-top:4px; padding-left:3px\"><span style=\"font-size:11px\">" + result.preferredName.getText() + "</span></div>");
                panel.add(selectButton);
                //panel.add(definitionButton);
                panel.add(label);

                var selectHandler = app.createServerClickHandler("itemSelectionHandler");
                selectButton.addClickHandler(selectHandler);

                //var definitionHandler = app.createServerClickHandler("itemDefinitionHandler");
                //definitionButton.addClickHandler(definitionHandler);

                var treeItem = app.createTreeItem().setWidget(panel);

                ontologyDictionary[ontologyLabel].addItem(treeItem);
            }

            app.getElementById("resultScroller").clear();
            app.getElementById("resultScroller").add(tree);

            // Need to add a listener to the tree to get the selected term.
            // this then needs to be inserted into the spreadsheet cell, if running normally,
            // or if an investigation sheet is detected, things are done as in ISAcreator.
        } else {
            app.getElementById("termDefinition").setStyleAttribute("color", "crimson").setText("Please enter a term with 3 or more characters. ");
            app.createDialogBox(false, true).setText("Please enter a term with more than 3 characters").setTitle("Input Error");
        }
    } catch (e) {
        Logger.log(e.message);
        app.getElementById("termDefinition").setStyleAttribute("color", "crimson").setText("Sorry, BioPortal appears to be down at present. Sorry for the inconvenience.");
        //app.getElementById("termDefinition").setStyleAttribute("color", "crimson").setText(e.message);
    }

    app.getElementById("progressIndicator").setVisible(false);
    app.getElementById("searchButton").setEnabled(true);
    return app;
}

function findRestrictionForCurrentColumn() {
  var restriction = new Object();
    restriction.ontologyId = "";
    restriction.branch = "";
    restriction.version = "";
  
  try {
  
    var ss = SpreadsheetApp.getActiveSpreadsheet();
  
    var sheets = ss.getSheets();

    var activeSheet = SpreadsheetApp.getActiveSheet();
    var selectedRange = activeSheet.getActiveSelection();
    var columnName = activeSheet.getRange(1, selectedRange.getColumn()).getValue();
    Logger.log("Getting restriction for " + columnName);
    
    for (var sheet in sheets) {
        if (sheets[sheet].getName() == "Restrictions") {
            for (var row = 1; row <= sheets[sheet].getLastRow(); row++) {
                if (sheets[sheet].getRange(row, 1).getValue() == columnName) {
                    restriction.ontologyId = sheets[sheet].getRange(row, 2).getValue();
                    restriction.branch = sheets[sheet].getRange(row, 3).getValue();
                    restriction.version = sheets[sheet].getRange(row, 4).getValue();
                    return restriction;
                }
            }
        }
    }
} catch(e) {
  app.getElementById("termDefinition").setStyleAttribute("color", "crimson").setText(e.message);
} finally {
  return restriction;
}
    
}

function itemSelectionHandler(e) {
    var app = UiApp.getActiveApplication();
    var value = e.parameter.source;

    var ontologyObject = createOntologyObjectFromString(value);

    app.getElementById("termDefinition").setStyleAttribute("color", "#414241").setText("Selected " + ontologyObject.term);
 
    var sheet = SpreadsheetApp.getActiveSheet();
    var selectedRange = sheet.getActiveSelection();

    // insert the ontology source information into the investigation file's ontology source reference section.


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
            sheet.getRange(row, selectedRange.getColumn()).setValue(ontologyObject.term + "(" + ontologyObject.accession + ")");
        }
    }
    return app;
}

function itemDefinitionHandler(e) {
    var app = UiApp.getActiveApplication();
    var value = e.parameter.source;

    var ontologyObject = createOntologyObjectFromString(value);

    var searchString = "http://rest.bioontology.org/bioportal/concepts/" + ontologyObject.ontologyVersion
        + "?conceptid=" + ontologyObject.conceptId + "&apikey=fd88ee35-6995-475d-b15a-85f1b9dd7a42";
    Logger.log(searchString);

    var text = UrlFetchApp.fetch(searchString).getContentText();
    var doc = Xml.parse(text, true);

    var entries = doc.success.data.classBean.getElements("relations");

    return app;
}