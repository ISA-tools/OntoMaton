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


function showAbout() {
    var mydoc = SpreadsheetApp.getActiveSpreadsheet();

    var app = UiApp.createApplication().setHeight(500);

    var absolutePanel = app.createAbsolutePanel();
    absolutePanel.setSize(480, 450);

    absolutePanel.add(app.createImage("http://isatab.sf.net/assets/img/tools/ontomaton.png"),35,0);
    absolutePanel.add(createLabel(app,"version 2.0 beta", "sans-serif", "normal", "12px", "#81A32B"), 345, 90);

    absolutePanel.add(createLabel(app, "OntoMaton makes use of the NCBO BioPortal Web Services and Linked Open Vocabularies services to facilitate ontology lookup and tagging within Google Spreadsheets.",
        "sans-serif", "lighter", "14px", "#939598"), 15, 170);

    absolutePanel.add(app.createImage("http://isatab.sf.net/assets/img/tools/part_of_isatools.png"), 200, 230);

    absolutePanel.add(createLabel(app, "OntoMaton was developed by the ISA team (http://www.isa-tools.org) at the University of Oxford to aid users in the use of ontologies in their day to day work.",
        "sans-serif", "lighter", "14px", "#939598"), 15, 345);

    absolutePanel.add(createLabel(app, "For more information see the publication in Bioinformatics: http://bioinformatics.oxfordjournals.org/content/29/4/525",
        "sans-serif", "lighter", "14px", "#939598"), 15, 390);
    app.add(absolutePanel);
    mydoc.show(app);
}
