/*

  L'idée un peu folle de ce module est de fonctionner avec des fonctions simples
  et plus parlantes. Un exemple :
      setOptionProjet(option, value)
    employé à la place de
      projet.option(option,value)
*/


/** ---------------------------------------------------------------------
  *
  *   PROPRIÉTÉS GLOBALES
  *
*** --------------------------------------------------------------------- */
Object.defineProperties(global,{
  /**
  * @return {PanProjet|PanData} Le panneau courant
  **/
  'currentPanneau':{
    get:function(){return projet().current_panneau}
  }

  /** @return le parag courant ou undefined */
  , 'currentParag':{
    get:function(){ return currentPanneau.parags.selection.current || undefined }
  }
})

/** ---------------------------------------------------------------------
  *
  *     MÉTHODES GLOBALES
  *
*** --------------------------------------------------------------------- */

/*  - PROJET -  */

/**
* @return {Projet} L'instance du projet courant
**/
function projet () { return Projet.current }

global.setOptionProjet    = function( option, value) {projet().option(option, value)}

/*  - PANNEAUX -  */



global.activatePanneau    = function (panid) {
  const pan = projet().panneau(panid)
  return pan.PRactivate.bind(pan).call()
}
global.setCurrentPanneau  = function(pan){ projet().current_panneau = pan }

/*  - PARAGS -  */

global.selectParag = function(p) { projet().current_panneau.parags.select(p) }

global.createAndEditParag = function() { return projet().current_panneau.parags.createAndEdit() }

/* - PARAG - */

global.displayParag = function (p, callback) { return p.display(callback)}
