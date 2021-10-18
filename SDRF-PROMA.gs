function showPROMA() {
    var html = HtmlService.createHtmlOutputFromFile('SDRF-PROMA-Template')
      .setTitle('PROMA - Ontology Search & SDRF Anotate')
      .setWidth(300);

    SpreadsheetApp.getUi()
      .showSidebar(html);
}

function runSearchSDRF(term) {
  return searchSDRF(term);
}


function searchSDRF(term) {
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
          id: elem.id,
          'ontology-label': elem.ontology_prefix,
          'ontology-name': elem.ontology_name,
          'ontology-obo_id': elem.obo_id,
          accession: elem.iri,
          ontology: elem.ontology_name,
          details: '',
          url: elem.iri
        };

        storeInCache(record.id, JSON.stringify(record));
        ontologyDict[ontologyLabel].terms.push(record);
      }
    });
    storeInCache(url, JSON.stringify(ontologyDict));
    return ontologyDict;
  }
  catch(e) {
    Logger.log(e);
    throw(e);
  }
}


function handleSDRFInsertion(term_id,MT,TA,parameter) {
  try {
    var Sheet = SpreadsheetApp.getActiveSheet();
    var selectedRange = Sheet.getActiveSelection();
    var selectedRow = selectedRange.getRow();
    var selectedColumn = selectedRange.getColumn();
    var textTerm = fetchFromCache(term_id);
    var term = JSON.parse(textTerm);

    var ontologyObject = {
        "term": term["label"],
        "accession": term_id,
        "ontologyId": term["ontology-label"],
        "ontologyVersion": term["ontology"],
        "ontologyDescription": term["ontology-name"],
        "url": term["url"],
        "obo_id": term["ontology-obo_id"]
    }

    if(parameter == 'modification parameters'){
      if(MT == ''){
        var modification = "NT=" + ontologyObject.term + ';TA=' + TA + ";AC=" + ontologyObject.obo_id;
      }
      else{
        var modification = "NT=" + ontologyObject.term + ";MT=" + MT + ';TA=' + TA + ";AC=" + ontologyObject.obo_id;
      }
      for (var row = selectedRow; row <= selectedRange.getLastRow(); row++) {
        Sheet.getRange(row,selectedColumn).setValue(modification);
      }
    }
    else if(parameter == 'instrument' || parameter == 'cleavage agent details' || parameter == 'label'){
      var modification = "NT=" + ontologyObject.term + ";AC=" + ontologyObject.obo_id;
      for (var row = selectedRow; row <= selectedRange.getLastRow(); row++) {
        Sheet.getRange(row,selectedColumn).setValue(modification);
      }
    }                                                                                       
    insertSDRFInRecordSheet(modification,parameter,ontologyObject);
  }
  catch(err) {
    Logger.log(err);
    throw err;
  }
}

function handleTemplateInsertion(template){
      var Sheet = SpreadsheetApp.getActiveSheet();
      //var selectedRange = Sheet.getActiveSelection();
      //var selectedRow = selectedRange.getRow();
      var data = Sheet.getDataRange().getValues();
      
      for(var i = 0; i < data[0].length; i++){  //Clear the first row.
        Sheet.getRange(1, i+1).setValue('');
      }

      SpreadsheetApp.getActiveSpreadsheet().toast("Select a region to insert information; Add or delete columns according to your needs.",
                                                    "Template successfully deployed!", -1);

      var cell_line_Template = ["source name","characteristics[organism]","characteristics[organism part]","characteristics[cell type]","characteristics[disease]","characteristics[cell line]","characteristics[biological replicate]","technology type","assay name","comment[technical replicate]","comment[data file]","comment[fraction identifier]","comment[label]","comment[cleavage agent details]","comment[instrument]","comment[modification parameters]","comment[modification parameters]","factor value[]"];
      var default_Template = ["source name","characteristics[organism]","characteristics[organism part]","characteristics[disease]","characteristics[biological replicate]","technology type","assay name","comment[technical replicate]","comment[data file]","comment[fraction identifier]","comment[label]","comment[cleavage agent details]","comment[instrument]","comment[modification parameters]","comment[modification parameters]","factor value[]"];
      var human_Template = ["source name","characteristics[organism]","characteristics[organism part]","characteristics[cell type]","characteristics[ancestry category]","characteristics[age]","characteristics[sex]","characteristics[disease]","characteristics[individual]","characteristics[biological replicate]","technology type","assay name","comment[technical replicate]","comment[data file]","comment[fraction identifier]","comment[label]","comment[instrument]","comment[cleavage agent details]","comment[modification parameters]","comment[modification parameters]","factor value[]"];
      var nonvertebrates_Template = ["source name","characteristics[organism]","characteristics[organism part]","characteristics[disease]","characteristics[cell type]","characteristics[biological replicate]","technology type","assay name","comment[technical replicate]","comment[data file]","comment[fraction identifier]","comment[label]","comment[instrument]","comment[cleavage agent details]","comment[modification parameters]","comment[modification parameters]","factor value[]"];
      var plants_Template = ["source name","characteristics[organism]","characteristics[organism part]","characteristics[cell type]","characteristics[disease]","characteristics[biological replicate]","technology type","assay name","comment[technical replicate]","comment[data file]","comment[fraction identifier]","comment[label]","comment[instrument]","comment[cleavage agent details]","comment[modification parameters]","comment[modification parameters]","factor value[]"];
      var vertebrates_Template = ["source name","characteristics[organism]","characteristics[organism part]","characteristics[cell type]","characteristics[developmental stage]","characteristics[disease]","characteristics[biological replicate]","technology type","assay name","comment[technical replicate]","comment[data file]","comment[fraction identifier]","comment[label]","comment[cleavage agent details]","comment[instrument]","comment[modification parameters]","comment[modification parameters]","factor value[]"];

      if (template == 'cell-line'){
        var application = cell_line_Template;
      }
      else if (template == 'default'){
        var application = default_Template;
      }
      else if (template == 'human'){
        var application = human_Template;
      }
      else if (template == 'nonvertebrates'){
        var application = nonvertebrates_Template;
      }
      else if (template == 'plants'){
        var application = plants_Template;
      }
      else if (template == 'vertebrates'){
        var application = vertebrates_Template;
      }
      for (var i = 0; i < application.length; i++){
        Sheet.getRange(1, i+1).setValue(application[i]);
      }
}
