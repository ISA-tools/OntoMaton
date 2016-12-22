<div align="center">
<img src="http://isatab.sf.net/assets/img/tools/ontomaton.png" align="center"/>
</div>

<br/>
<a href="https://doi.org/10.5281/zenodo.11085"><img src="https://zenodo.org/badge/DOI/10.5281/zenodo.11085.svg" alt="DOI"></a>
<br/>
OntoMaton facilitates ontology search and tagging functionalities within Google Spreadsheets. It has been developed by the [ISA Team](http://isa-tools.org) at the University of [Oxford's e-Research Centre](http://www.oerc.ox.ac.uk).

<br/>

### Read the Publication...
Access the Open Access <a href="http://bioinformatics.oxfordjournals.org">Bioinformatics</a> article on OntoMaton [here](dx.doi.org/10.1093/bioinformatics/bts718).

<i>Eamonn Maguire, Alejandra González-Beltrán, Patricia L. Whetzel, Susanna-Assunta Sansone, and Philippe Rocca-Serra  
OntoMaton: a Bioportal powered ontology widget for Google Spreadsheets  
Bioinformatics 2013 29: 525-527. doi: [10.1093/bioinformatics/bts718](dx.doi.org/10.1093/bioinformatics/bts718) </i>

Please, note that at the time of the publication, OntoMaton was powered by the <a href="http://bioportal.bioontology.org/">NCBO BioPortal</a> web services. Since then, we have made the following extensions:

- we upgraded the code to [Google Add-ons for Docs and Sheets](http://googledrive.blogspot.it/2014/03/add-ons.html), which [deprecated the Apps Script applications and the Script Gallery](http://googleappsdeveloper.blogspot.co.uk/2014/06/deprecating-script-gallery-in-old.html), used in the original OntoMaton version
- we upgraded to the new BioPortal API for searching ontology terms and annotator services (see BioPortal 4.0 release notes), as the old API was deprecated in 2014
- we extended the ontology search functionality to support REST services from the <a href="http://lov.okfn.org/">Linked Open Vocabularies</a> and the <a href="http://ebi.ac.uk/ols/">EBI Ontology Lookup Service</a>, thus now allowing ontology term searches over three separate services.

For more information, see [our blog posts on OntoMaton](https://isatools.wordpress.com/?s=ontomaton). 


###Installation

With the new add on infrastructure, installation is very easy. 

1. Click on the 'Add-ons' menu item in your Google Spreadsheet:

<div align="center">
<img src="https://github.com/ISA-tools/OntoMaton/blob/master/figures/ontomaton-fig1.png" width="500">
</div>

2.  Click on 'Get add-ons...' and then search for 'OntoMaton': 

<div align="center">
<img src="https://github.com/ISA-tools/OntoMaton/blob/master/figures/ontomaton-fig2.png?" height="200">
</div>

You should get the following result:

<div align="center">
<img src="https://github.com/ISA-tools/OntoMaton/blob/master/figures/ontomaton-fig3.png" width="500">
</div>

Here you can click on the image and read more about OntoMaton:

<div align="center">
<img src="https://github.com/ISA-tools/OntoMaton/blob/master/figures/ontomaton-fig4.png" width="500">
</div>

3. To install, click on '+FREE'. You will need to authorise OntoMaton Add-on to access your spreadsheets and to connect to external services (the ontology search services we support):

<div align="center">
<img src="https://github.com/ISA-tools/OntoMaton/blob/master/figures/ontomaton-fig5.png" width="500">
</div>


4. You'll then have the OntoMaton app installed. 

<div align="center">
<img src="https://github.com/ISA-tools/OntoMaton/blob/master/figures/ontomaton-fig6.png" width="500">
</div>

You can access it through the 'Add On' menu option.

<div align="center">
<img src="https://github.com/ISA-tools/OntoMaton/blob/master/figures/ontomaton-fig7.png" width="500">
</div>

###Ontology Search

From OntoMaton, you can search three different services within one tool: the [NCBO Bioportal](http://bioportal.bioontology.org/), [Linked Open Vocabularies](http://lov.okfn.org) and [EBI Ontology Lookup Service](https://www.ebi.ac.uk/ols/), and insert the terms in your Google Spreadsheet directly. Full term provenance is recorded for you and later downstream analysis.

<div align="center">
<img src="https://github.com/ISA-tools/OntoMaton/blob/master/figures/ontomaton-fig8.png" width="500">
</div>

###Ontology Tagging

With OntoMaton, you can select a number of spreadsheet cells and then 'tag' them. This means that OntoMaton will take the terms in the cells and send them to BioPortal's Annotator service. The results will come back as a list of the free text terms, showing for each all matches in BioPortal. 

<div align="center">
<img src="https://isatools.files.wordpress.com/2014/04/screen-shot-2014-04-16-at-18-55-27.png?h=500"/>
</div>

### Configuring OntoMaton - Settings


<div align="center">
<img src="https://isatools.files.wordpress.com/2014/04/screen-shot-2014-04-16-at-19-44-14.png?h=400"/>
</div>



From the settings screen, you can configure:

* How terms should be inserted in to the spreadsheet when not in 'ISA mode' (where the next columns aren't named Term Source Ref or Term Source Accession). The two options are as either as a hyperlink to the term in Bioportal/LOV or as a term name with the hyperlink in parentheses.  
* Restrictions, which specify for zero or more columns (with a name in the first cell), restrictions that should be placed on the search space. E.g. Label is restriction to the chemical entities ontology (ChEBI).


###Restricting OntoMaton's search space

<div align="center">
<img src="https://isatools.files.wordpress.com/2014/04/screen-shot-2014-04-16-at-19-44-53.png?h=500"/>
</div>

When you add a restriction using the 'Settings' panel for the first time, a 'Restrictions' sheet will be added automatically. This sheet will have the following column headers:
```Column Name | Ontology |	 Branch | Version```. Then you may define for a particular column header in your spreadsheet what ontology should be searched (or list of ontologies, e.g. 1007, 1023).

Additionally, within one ontology restriction, for BioPortal searches, you can restrict to a particular branch of an ontology, providing a way to further restrict the search space.

An example of a google spreadsheet with such functionality can be viewed here: https://docs.google.com/spreadsheet/ccc?key=0Al5WvYyk0zzmdDNLeEcxWHZJX042dS0taXJPNXpJMHc

 
### Video Tutorial

Access the video tutorial showing how to install and use OntoMaton [here](http://www.youtube.com/watch?v=Qs0nxGBfQac&feature=player_embedded).
 
### Templates

Templates can be found through accessing them on the google templates site. OntoMaton templates are [here](https://drive.google.com/templates?type=spreadsheets&q=ontomaton).

###Questions

If you have any queries, please email us at [link](mailto:isatools@googlegroups.com). For bug reports, please use the issue page here.

###License

This work is licensed through a [CPAL license](http://isatab.sf.net/licenses/OntoMaton-license.html), meaning that any derivitives should carry a powered by OntoMaton logo, shown here.

![image](http://isatab.sf.net/assets/img/tools/ontomaton-part-of-isatools.png)

### Merchandise

![image](http://i1.cpcache.com/product/741842417/tshirt.jpg?color=Black&amp;height=250&amp;width=250) ![image](http://i1.cpcache.com/product/741842417/tshirt.jpg?side=Back&color=Black&height=250&width=250) 

Fancy an OntoMaton t-shirt? We haven't got any to give away...yet! But...you can buy one of these rather snazzy t-shirts from [Spreadshirts](http://antarctic-design.spreadshirt.co.uk/men-s-classic-t-shirt-A22910590/customize/color/2) for just £15!


