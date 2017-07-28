/*

  L'idée un peu folle de ce module est de fonctionner avec des fonctions simples
  et plus parlantes. Un exemple :
      setOptionProjet(option, value)
    employé à la place de
      projet.option(option,value)
*/

/*  - PROJET -  */

global.setOptionProjet    = function( option, value) {projet.option(option, value)}

/*  - PANNEAUX -  */

global.setCurrentPanneau  = function(pan){projet.current_panneau = pan}

/*  - PARAGS -  */

global.selectParag = function(p) { projet.current_panneau.parags.select(p)  }

global.createAndEditNewParag = function() { return projet.current_panneau.parags.createAndEdit() }
