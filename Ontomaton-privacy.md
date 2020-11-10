<div align="center">
<img src="https://isa-tools.org/OntoMaton/figures/ontomaton.png" align="center"/>
</div>

<br/>

___

## Privacy Statement

### 1. Who is producing Ontomaton

**Ontomaton Appscript for Google Spreadsheet** is a add-on developed  by the [ISA tools](https://isa-tools.org), in the  [Data Readiness Group](), at Oxford e-Research Centre, Department of Engineering Science, University of Oxford, United Kingdom.  The lead developer for the app is Dr Eamonn Maguire, based on discussions with Dr Philippe Rocca-Serra.

### 2. Why was Ontomaton developped?

**Ontomaton** was initially developed to allow semantic markup and ontology based annotations of textual entities in a collaborative spreadsheet environmnent using [Investigation Study Assay](https://github.com/ISA-tools) Configurations Excel Templates to enable Experimental metadata tracking.

The solution which wass eventually developed is so generic that it can be used to provide ontology annotation in any [Google Spreadsheet](https://docs.google.com/spreadsheets/u/0/), irrespective of the spreadsheet layout.

With **Ontomaton**, users associate textual entities such as strings with a persistent, stable, resolvable identifier uniquely linked to a concept or term found in a semantic resources, thus disambiguating annotation. The intended audience for Ontomaton is Research Scientists, Data Curators, Annotators or anyone involved in improving and harmonizing document annotation.

### 3. What does Ontomaton require and do?

At the core of the function offered by Ontomaton is the reliance on third party ontology services, which are:
	- [NCBO Bioportal](http://data.bioontology.org/documentation)
	- [EMBL-EBI Ontology Lookup Service](https://www.ebi.ac.uk/ols/docs/api)
	- [Linked Open Vocabulary Database](https://lov.linkeddata.es/dataset/lov/api)

When using **Ontomaton**, `strings` located in a cell of a spreadsheet are used as `input to create a request to these third party ontology services`, which will return any hit/match on the resources hosted.
With the results returned by the service are then displayed in the dedicated panel in the Google spreadsheeet for users to choose and select the most suitable.

### 4. Which personal information does Ontomaton need and does Ontomaton store any of my data? 

**Ontomaton** uses 2 different types of user data:

#### 4.1. User Authentication Information

Since **Ontomaton** is an add-on to Google Spreadsheet, for it to work, Ontomaton requires **user consent** to be installed. It is only with this consent that the Ontomaton application can use user authentication credentials to access user's Google Spreadsheet documents (file names, permissions, and within a spreadsheet, the different worksheets witthin a workbook).

This is the only Add-ons can actually operate.

#### 4.2. Spreadsheet information

Once **Ontomaton** is installed, users can then invoke the functions (*ontology lookup* or *tagging*) of the tool. As described earlier on, these functions use `strings`, as found in the document cells, to form a request to the APIs of the 3 ontology services listed above. All of these APIs rely on API-keys. Each of these keys is associated with the Ontomaton App, not with the user who has granted access to the Ontomaton app.


:warning: IMPORTANT
 - Ontomaton app does not store or use any personal data
 - Ontomaton app does not send any information back to either the ISA Team or Ontomaton Developers or the University of Oxford
 - No information about Ontomaton usage is tracked, recorded or stored in any way or forms by the ISA Team or Ontomaton Developers or the University of Oxford

#### 5. Who is the Data Controller for Ontomaton and Whom should I contact for any inquiry about data use?

As indicated in *section 4*, Ontomaton does not store any personal information nor does it transmit information to Ontomaton developers or any third party for data mining and tracking, therefore Ontomaton does not require a Data Controller.
However, for any question about Ontomaton, feature requests, users can contact the [ISA Team and the developers](mailto:isatools@googlegroups.com).

#### 6. How long is user personal data stored ?

As indicated in *section 4*, Ontomaton does not store any personal information nor does it transmit information to Ontomaton developers or any third party, so the concern about duration of storage does not apply.

#### 7. Anything else users need to know about Data Privacy and associated concerns ?

Well yes there is. Since Ontomaton does not store or handles users data, it is the responsibility of the user (data owner) to take all the necessary measures to ensure that sensitive data is handled in compliance with privacy perserving regulation.
 

<li class="task-list-item">
	<code>As a reminder, the <strong>General Data Protection Regulation (GDPR)</strong> applies to the UK since 25 May 2018.</code>
	<p>It replaces the 1998 Data Protection Act and introduce new rules on privacy notices, as well as the processing and safeguarding personal data. By using the plugin you are agreeing to this as outlined in our Privacy Notice and Terms of Use.</p>
</li>

<li>
	<code>We require access to edit Spreadsheets in order to add restrictions, store settings, and to automatically create term provenance.</code>
</li>
<li>
	 <code>We also need to insert content in the sheet when the user selects a term.</code> 
</li>

<li>
	<code>No user data is ever transferred to the OntoMaton development team.</code>
</li>

___
 
### Video Tutorial

Access the video tutorial showing how to install and use OntoMaton (version 1) [here](http://www.youtube.com/watch?v=Qs0nxGBfQac&feature=player_embedded).
 
### Templates

Templates can be found through accessing them on the google templates site. OntoMaton templates are [here](https://drive.google.com/templates?type=spreadsheets&q=ontomaton).

### Questions

If you have any queries, please email us at [link](mailto:isatools@googlegroups.com). For bug reports, please [use the issue page here](https://github.com/ISA-tools/OntoMaton/issues).

### License

This work is licensed through a [CPAL license](http://isatab.sf.net/licenses/OntoMaton-license.html), meaning that any derivitives should carry a powered by OntoMaton logo, shown here.

<!-- ![image](http://isatab.sf.net/assets/img/tools/ontomaton-part-of-isatools.png) -->

<p><img src="https://camo.githubusercontent.com/1a972d4b6bfd5c19d3259c985aed6ff9fa3dfaa5/687474703a2f2f6973617461622e73662e6e65742f6173736574732f696d672f746f6f6c732f6f6e746f6d61746f6e2d706172742d6f662d697361746f6f6c732e706e67" alt="image" data-canonical-src="http://isatab.sf.net/assets/img/tools/ontomaton-part-of-isatools.png"></p>

### Merchandise

Fancy an OntoMaton t-shirt? We haven't got any to give away...yet! But...you can buy one of these rather snazzy t-shirts from [Spreadshirts](http://antarctic-design.spreadshirt.co.uk/men-s-classic-t-shirt-A22910590/customize/color/2) for just £15!


