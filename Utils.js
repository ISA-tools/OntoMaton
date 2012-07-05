function getSourceAndAccessionPositionsForTerm(column) {
    // we will look at positions 1 & 2 after the column to determine if the source and accession columns
    // particular to ISAtab are present.
    var sheet = SpreadsheetApp.getActiveSheet();
    var sourceObject = new Object();

    for (var columnIndex = column + 1; columnIndex <= column + 2; columnIndex++) {
        if (sheet.getRange(1, columnIndex).getValue() == "Term Source Ref") {
            sourceObject.sourceRef = columnIndex;
        }
        if (sheet.getRange(1, columnIndex).getValue() == "Term Source Accession") {
            sourceObject.accession = columnIndex;
        }
    }

    return sourceObject;
}

function createOntologyObjectFromString(ontologyString) {
    // processes the ontology string into an ontology object to be used for population of ISA sections.
    var ontologyDetails = ontologyString.split("::");
    var ontologyObject = new Object();
    // cy5::http://purl.obolibrary.org/obo/CHEBI_37989::1123::47203::Ontology for Biomedical Investigations
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
    var termSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("terms");


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
