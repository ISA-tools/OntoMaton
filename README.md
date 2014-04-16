<div align="center">
<img src="http://isatab.sf.net/assets/img/tools/ontomaton.png" align="center"/>
</div>

<br/><br/><br/>

OntoMaton facilitates ontology search and tagging functionalities within Google Spreadsheets. It has been developed by the [ISA Team](http://isa-tools.org) at the University of [Oxford's e-Research Centre](http://www.oerc.ox.ac.uk).

<br/>

### Read the Publication...
Access the Open Access Bioinformatics article on OntoMaton [here](http://bioinformatics.oxfordjournals.org/content/29/4/525.full)

Eamonn Maguire, Alejandra González-Beltrán, Patricia L. Whetzel, Susanna-Assunta Sansone, and Philippe Rocca-Serra  
OntoMaton: a Bioportal powered ontology widget for Google Spreadsheets  
Bioinformatics 2013 29: 525-527.  


###Installation

With the new add on infrastructure, installation is very easy. Just click on the 'Add on' menu item in your Google Spreadsheet > 'Get add ons' and search for OntoMaton. Then click on 'Install'.

You'll then have the OntoMaton app installed. You can access it through the 'Add On' menu option.

<div align="center">
<img src="https://isatools.files.wordpress.com/2014/04/screen-shot-2014-04-16-at-20-02-57.png?w=500">
</div>


###Ontology Search

From OntoMaton, you can search both the NCBO Bioportal and Linked Open Vocabulary resources within one tool and insert the terms in your Google Spreadsheet directly. Full term provenance is recorded for you and later downstream analysis.

<div align="center">
<img src="https://isatools.files.wordpress.com/2014/04/screen-shot-2014-04-16-at-18-51-20.png?h=500" align="center"/>
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


