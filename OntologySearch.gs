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

function showOntologySearch() {
    var html = HtmlService.createHtmlOutputFromFile('Ontology-Search-Template')
      .setTitle('OntoMaton - Ontology Search & Tagging')
      .setWidth(300);

    SpreadsheetApp.getUi()
      .showSidebar(html);
}

function runSearch(service, term) {
  return performSearch(service,term);
}


function performSearch(service, term) {
  switch (service) {
    case "bioportal":
      return searchBioPortal(term);
    case "lov":
      return searchLOV(term);
    case "ols":
      return searchOLS(term);
    case "tib-ols":
      return searchTIBOLS(term);
    default:
      return searchLOV(term);
  }
}

function searchBioPortal(term) {
    try {
        var ontologies = getBioPortalOntologies();
        // only perform a search if there is a difference
        var restriction = findRestrictionForCurrentColumn("BioPortal");

        if (term.length > 2) {
            // todo check if particular column has a restriction in the hidden sheet. If so, restrict the search.
            var searchString = "http://data.bioontology.org/search?q=" + term + "&display_context=false";

            if (restriction) {
                if (restriction.branch)
                    searchString += "&ontology=" + restriction.ontologyId + "&subtree=" + restriction.branch + "&apikey=fd88ee35-6995-475d-b15a-85f1b9dd7a42";
                else
                    searchString += "&ontologies=" + restriction.ontologyId + "&apikey=fd88ee35-6995-475d-b15a-85f1b9dd7a42";
            }

            // we cache results and try to retrieve them on every new execution.
            var cacheResult = fetchFromCache(searchString);

            var text, key;
            if (cacheResult != undefined) {
                return JSON.parse(cacheResult);
                // SpreadsheetApp.getActiveSpreadsheet().toast("Terms retrieved from cache.", "Cache accessed", -1);
            } else {
                text = UrlFetchApp.fetch(searchString).getContentText();
                var doc = JSON.parse(text);
                var searchResultBeans = doc.collection;
                var ontologyDictionary = {};

                for (var resultIndex in searchResultBeans) {
                    var result = searchResultBeans[resultIndex];
                    var ontologyLabel = result.links.ontology.substring(result.links.ontology.lastIndexOf("/") + 1);

                    if (ontologyDictionary[ontologyLabel] == undefined) {
                        ontologyDictionary[ontologyLabel] = {"ontology-name": ontologies[ontologyLabel].name, "terms": []};
                    }

                    //key for the cache
                    key = ontologyLabel +":" + result["@id"]

                    var ontology_record = {
                      "label": result.prefLabel,
                      "id": key,
                      "ontology-label": ontologyLabel,
                      "ontology-name": ontologies[ontologyLabel].name,
                      "accession": result["@id"], //result.links.self,
                      "ontology": result.links.ontology,
                      "url": result["@id"] //result.links.ui
                    };
                    var ontology_record_string = JSON.stringify(ontology_record);

                    storeInCache(key, ontology_record_string);
                    ontologyDictionary[ontologyLabel].terms.push(ontology_record);
                }

                storeInCache(searchString, JSON.stringify(ontologyDictionary));

                return ontologyDictionary;
            }
        } else {
            throw 'Please enter a term with 3 or more characters.';
        }
    } catch (e) {
        throw e;
    }

    return {};
}

function searchLOV(term) {

    try {
        // only perform a search if there is a difference
        var restriction = findRestrictionForCurrentColumn("LOV");
        var vocabularies = getLinkedOpenVocabularies();

        var url = "http://lov.okfn.org/dataset/lov/api/v2/search?q=" + term;
        var vocabShortname;
        var vocabURI;
        if (restriction.source) {
            vocabShortname = restriction.ontologyId.replace(/\s/g, "");  //string trim
            if (vocabularies[vocabShortname]) {
                vocabURI = vocabularies[vocabShortname].uri;
                if (vocabURI)
                    url = "http://lov.okfn.org/dataset/lov/api/v2/search?q=" + term + "&voc=" + vocabURI;
            } else {
                url = "";
            }
        }

        if (url) {

            // we cache results and try to retrieve them on every new execution.
            var cacheResult = fetchFromCache(url);

            var text, label;

            if (cacheResult != null) {
                text = cacheResult;
            } else {
                text = UrlFetchApp.fetch(url).getContentText();
            }

            var ontologyDictionary = {};

            var parsed_result = JSON.parse(text);

            if (!parsed_result.error) {

                var results = parsed_result.results;

                for (var i in results) {

                    var uriPrefixed = results[i]['prefixedName'][0];
                    label = uriPrefixed.split(':')[1];
                    var key = uriPrefixed;
                    var uri = results[i].uri[0];
                    var vocabularyPrefix = results[i]['vocabulary.prefix'][0];

                    if (vocabularyPrefix != null) {

                        var vocab_record = vocabularies[vocabularyPrefix];

                        var ontologyLabel = vocab_record.name + "\n (" + vocab_record.uri + ")";

                        if (ontologyDictionary[ontologyLabel] === undefined) {
                            ontologyDictionary[ontologyLabel] = {"ontology-name": vocab_record.name, "terms": []};
                        }

                        var ontology_record = {
                          "label": label,
                          "id": key,
                          "ontology-label": vocabularyPrefix,
                          "ontology-name": vocab_record.name,
                          "accession": uri,//vocab_record.uri,
                          "ontology": vocab_record.uri,
                          "details": "",
                          "url":uri
                        };
                        var ontology_record_string = JSON.stringify(ontology_record);
                        storeInCache(key, ontology_record_string);
                        ontologyDictionary[ontologyLabel].terms.push(ontology_record);

                    } //vocabularyPrefix not null

                }//for
                //storeInCache(url, JSON.stringify(text));
                storeInCache(url, text);
                return ontologyDictionary;
            }// no error
        }
    } catch (e) {
        Logger.log(e);
        throw e;
    }

    return {};
}

/**
 * @method
 * @name searchOLS
 * @param{string} term
 */
function searchOLS(term) {
  try {
    var restriction = findRestrictionForCurrentColumn("OLS");
    var ontologies = getOLSOntologies();
    var url = OLS_API_BASE_URI + '/search';
    var queryObj = {
      q: term,
      rows: OLS_PAGINATION_SIZE,
      start: 0,
      ontology: restriction ? restriction.ontologyId : undefined
    };
    var queryString = jsonToQueryString(queryObj);
    url += '?' + queryString;
    var cacheResult = fetchFromCache(url);
    if (cacheResult) {
      return JSON.parse(cacheResult);
    }
    var text = UrlFetchApp.fetch(url).getContentText(), json = JSON.parse(text), ontologyDict = {};

    var docs = json.response && json.response.docs;
    if (!docs || docs.length === 0) {
      throw "No Result found.";
    }
    docs.forEach(function(elem) {
      var ontology = ontologies[elem.ontology_name], ontologyLabel = elem.ontology_prefix, record;
      if (!ontologyDict[ontologyLabel]) {
        ontologyDict[ontologyLabel] = {"ontology-name": elem.ontology_name, "terms": []};
        record = {
          label: elem.label,
          id: elem.short_form,
          'ontology-label': elem.ontology_prefix,
          'ontology-name': elem.ontology_name,
          accession: elem.iri,//elem.obo_id,
          ontology: elem.ontology_name,
          details: '',
          url: elem.iri
        };

        storeInCache(record.id, JSON.stringify(record));
        ontologyDict[ontologyLabel].terms.push(record);
      }
    });
    storeInCache(url, JSON.stringify(ontologyDict));
    // Logger.log(ontologyDict);
    return ontologyDict;
  }
  catch(e) {
    Logger.log(e);
    throw(e);
  }
}


/**
 * @method
 * @name searchTIBOLS
 * @param{string} term
 */
function searchTIBOLS(term) {
  try {
    var restriction = findRestrictionForCurrentColumn("OLS");
    var ontologies = getTIBOLSOntologies();
    var url = TIBOLS_API_BASE_URI + '/search';
    var queryObj = {
      q: term,
      rows: OLS_PAGINATION_SIZE,
      start: 0,
      ontology: restriction ? restriction.ontologyId : undefined
    };
    var queryString = jsonToQueryString(queryObj);
    url += '?' + queryString;
    var cacheResult = fetchFromCache(url);
    if (cacheResult) {
      return JSON.parse(cacheResult);
    }
    var text = UrlFetchApp.fetch(url).getContentText(), json = JSON.parse(text), ontologyDict = {};

    var docs = json.response && json.response.docs;
    if (!docs || docs.length === 0) {
      throw "No Result found.";
    }
    docs.forEach(function(elem) {
      var ontology = ontologies[elem.ontology_name], ontologyLabel = elem.ontology_prefix, record;
      if (!ontologyDict[ontologyLabel]) {
        ontologyDict[ontologyLabel] = {"ontology-name": elem.ontology_name, "terms": []};
        record = {
          label: elem.label,
          id: elem.short_form,
          'ontology-label': elem.ontology_prefix,
          'ontology-name': elem.ontology_name,
          accession: elem.iri,//elem.obo_id,
          ontology: elem.ontology_name,
          details: '',
          url: elem.iri
        };

        storeInCache(record.id, JSON.stringify(record));
        ontologyDict[ontologyLabel].terms.push(record);
      }
    });
    storeInCache(url, JSON.stringify(ontologyDict));
    // Logger.log(ontologyDict);
    return ontologyDict;
  }
  catch(e) {
    Logger.log(e);
    throw(e);
  }
}

function handleTermInsertion(term_id) {
  try {
    var sheet = SpreadsheetApp.getActiveSheet();
    var selectedRange = sheet.getActiveSelection();
    var textTerm = fetchFromCache(term_id);
    var term = JSON.parse(textTerm);

    var ontologyObject = {
        "term": term["label"],
        "accession": term_id,
        "ontologyId": term["ontology-label"],
        "ontologyVersion": term["ontology"],
        "ontologyDescription": term["ontology-name"],
        "url": term["url"]
    }

    // figure out whether the Term Source REF and Term Accession Number columns exist, if they do exist at all. Insertion technique will vary
    // depending on the file being looked at.
    var sourceAndAccessionPositions = getSourceAndAccessionPositionsForTerm(selectedRange.getColumn());

    // add all terms into a separate sheet with all their information.
    if (sourceAndAccessionPositions.sourceRef != undefined && sourceAndAccessionPositions.accession != undefined) {
        insertOntologySourceInformationInInvestigationBlock(ontologyObject);
    }

    for (var row = selectedRange.getRow(); row <= selectedRange.getLastRow(); row++) {

        // if the currently selected column is an ISA defined ontology term, then we should insert the source and accession in subsequent
        // columns and add the ontology source information to the investigation file if it doesn't already exist.
        if (sourceAndAccessionPositions.sourceRef != undefined && sourceAndAccessionPositions.accession != undefined) {
            sheet.getRange(row, selectedRange.getColumn()).setValue(ontologyObject.term);
            sheet.getRange(row, sourceAndAccessionPositions.sourceRef).setValue(ontologyObject.ontologyId);
            sheet.getRange(row, sourceAndAccessionPositions.accession).setValue(ontologyObject.url);
        } else {

            var isDefaultInsertionMechanism = loadPreferences();
            var selectedColumn = selectedRange.getColumn();
            var nextColumn = selectedColumn + 1;

            if (!isDefaultInsertionMechanism) {
                sheet.getRange(row, selectedColumn).setValue(ontologyObject.term);
                sheet.getRange(row, nextColumn).setValue(ontologyObject.url);
            } else {
                sheet.getRange(row, selectedColumn).setFormula('=HYPERLINK("' + ontologyObject.url + '","' + ontologyObject.term + '")')
            }
        }
    }
    insertTermInformationInTermSheet(ontologyObject);
  }
  catch(err) {
    Logger.log(err);
    throw err;
  }

}
