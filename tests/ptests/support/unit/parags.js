/*

  @usage
  ------
  À mettre en haut du fichier test :

  let path      = require('path')
  require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))


  Ensuite, on peut utiliser des choses comme :

    @ Pour construire un faux panneau avec plusieurs paragraphes

        resetAll()
        panneau.parags.add([parag1, parag2, ... parag12])

    @ Pour initialiser tous les panneaux et créer 40 paragraphes de
      parag0 à parag39

      resetAllPanneau()

    @ Pour sélectionner des paragraphes

        // (après avoir ajouté les paragraphes)
        panneau.parags.select(parag2)
        panneau.parags.select([parag10, parag2])


    Tous les panneaux, si resetAllPanneaux() est utilisé, sont mis dans des
    propriétés globales panneauNotes, panneauScenier, panneauManuscrit, etc.
    en reprenant en suffixe l'ID du panneau titleisé.

*/
try{
let path    = require('path')
  , moment  = require('moment')

global.Parag      = require_module(path.join('.','__windows__','_common_','js','Parag.js'))
global.Projet     = require_module(path.join('.','__windows__','projet','js','projet_class.js'))
global.PanProjet  = require_module(path.join('.','__windows__','projet','js','panprojet_class.js'))
global.ProjetOptions  = require_module(path.join('.','__windows__','projet','js','options_class.js'))
global.Parags     = require_module(path.join('.','__windows__','_common_','js','Parags.js'))
global.Relatives  = require_module(path.join('.','__windows__','projet','js','relatives_class.js'))
global.ProjetUI   = require_module(path.join('.','__windows__','projet','js','projet_ui.js'))
global.Store      = require_module(path.join('.','lib','utils','store_class.js'))

global.path       = path

// Pour que les Parag(s) soient bien associés au panneau
// Projet.current.panneaux = {}


/** ---------------------------------------------------------------------
  *
  *   STUBS
  *
*** --------------------------------------------------------------------- */

Object.defineProperties(PanProjet.prototype, {
  'container': {
    get: function(){
      if ( undefined === this._container ) {
        this._container = DOM.create('div', {id:`panneau-contents-${this.id}`})
      }
      return this._container
    }
  }
})

global.projet
global.panneau

global.PANNEAU_ID  = 'synopsis'
global.PROJET_ID   = 'exemple'

/**
*  Pour définir le projet :
*     params.panneau_id
*
**/
function createParag( params )
{
  let now = moment().format('YYMMDD')

  if (undefined === params.id) {
    throw new Error("Il faut absolument définir l'identifiant du paragraphe, dans createParag (tests)")
  }

  params || ( params = {} )
  params.c || (params.c = `Contenu du paragraphe #${params.id}`)
  params.ca = now
  params.ua = now
  params.d  = 60 // durée/longueur
  let parag = new Parag(params)
  // NOTER qu'on ne peut pas ajouter le paragraphe aux relatives ici, car
  // on ne connait pas encore le panneau du paragraphe. C'est au moment
  // d'ajouter le parag au panneau qu'on peut l'ajouter aux relatives
  // projet.relatives.addParag( parag )

  return parag
}

/**
* Instancie +nombre+ de paragraphe (20 par défaut)
*
* @return le dernier ID utilisé, pour enregistrer dans la donnée du projet
*         qui consigne le dernier ID utilisé.
*
* @produit de façon globale des parags de parag0 à parag<nombre> qui peuvent
* être insérés dans les panneaux pour les tests.
**/
function init20Parags ( nombre )
{
  let listeParags = []
  nombre || (nombre = 20)
  for(var pid = 0 ; pid < nombre ; ++ pid){
    listeParags.push(createParag({id: pid}))
    eval(`global.parag${pid} = listeParags[${pid}];`)
  }
  return pid
}


/**
* @return {Array} La liste des IDentifiants des parag dans le
* document.
**/
global.getListeOfIds = function () {
  let   l = panneau.container.getElementsByClassName('p')
      , len = l.length
      , arr = []
  for(let i=0;i<len;++i){
    arr.push( Number(l[i].getAttribute('data-id')) )
  }
  return arr
}

/** ---------------------------------------------------------------------
  *
  * Grande méthode qui initialise tout.
  *
*** --------------------------------------------------------------------- */
global.resetAllPanneaux = function( params)
{
  params || ( params = {} )

  // On va créer 40 paragraphes
  params.nombre_parags || ( params.nombre_parags = 40 )

  projet || ( projet  = new Projet(PROJET_ID) )
  projet._modified = false
  projet.option('autosync', 0)
  projet.option('autosave', 0)
  Projet.current = projet
  delete projet._relatives
  Parag._lastID = -1
  projet.definePanneauxAsInstances()
  Projet.PANNEAU_LIST.forEach( (pan_id) => {
    let pan = projet.panneau(pan_id)
    pan._modified = false
    pan.container.innerHTML = ''
    pan.parags.reset()
    pan.parags._projet = projet
    // On crée des propriétés globales pour faire `panneauNotes`
    eval(`global.panneau${pan_id.titleize()} = projet.panneau('${pan_id}');`)
  })
  let lastid = init20Parags(params.nombre_parags)
  projet.data_generales = { last_parag_id: lastid }
  Parag._lastID = lastid
}

global.resetAll = function ()
{
  // console.log('-> resetAll')
  projet || ( projet  = new Projet(PROJET_ID) )
  Projet.current = projet
  Parag._lastID = -1
  projet.definePanneauxAsInstances()
  panneau = projet.panneau(PANNEAU_ID)
  projet._current_panneau = panneau

  projet._modified  = false
  projet.option('autosync', 0)
  projet.option('autosave', 0)
  panneau._modified = false

  panneau.container.innerHTML = ''
  panneau.parags.reset()
  panneau.parags.selection.reset()
  panneau.parags._projet = projet
  let lastid = init20Parags()
  projet.data_generales = {
    last_parag_id: lastid
  }
  // console.log('<- resetAll')
}

projet = new Projet(PROJET_ID)
resetAll()

}catch(err){
  console.log(err)
  puts("Une erreur s'est produite dans le support `ptests/support/parags.js` (voir en console)", 'warning')
}
