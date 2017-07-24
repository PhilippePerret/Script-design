global.path   = require('path')
let moment    = require('moment')
let fs        = require('fs')

// Ne semble pas fonctionner…
// global.jsdom  = require('mocha-jsdom')
// global.document = jsdom().
const jsdom = require('jsdom')
const {JSDOM} = jsdom
global.JSDOM = JSDOM
const dom = new JSDOM()
const window = dom.window
// const window = (new JSDOM(`<!DOCTYPE html>`)).window
global.document = window.document


const LIB_UTILS_JS      = path.resolve('./lib/utils')
const FOLDER_COMMON_JS  = path.resolve('./__windows__/_common_/js')
const FOLDER_PROJET_JS  = path.resolve('./__windows__/projet/js')

global.DOM      = require(path.join(LIB_UTILS_JS, 'dom_class.js'))
global.Store    = require(path.join(LIB_UTILS_JS, 'store_class.js'))

global.Parags   = require(path.join(FOLDER_COMMON_JS,'parags.js'))
global.Parag    = require(path.join(FOLDER_COMMON_JS,'parag.js'))

global.Projet = require(path.join(FOLDER_PROJET_JS,'projet_class.js'))
global.projet = undefined // utiliser initTess() pour l'instancier
global.PanProjet      = require(path.join(FOLDER_PROJET_JS,'panprojet_class.js'))
global.ProjetOptions  = require(path.join(FOLDER_PROJET_JS,'options_class.js'))
global.Relatives      = require(path.join(FOLDER_PROJET_JS,'relatives_class.js'))
global.ProjetUI       = require(path.join(FOLDER_PROJET_JS,'projet_ui.js'))

global.PANNEAU_ID  = 'synopsis' // panneau par défaut dans projet
global.PROJET_ID   = 'exemple'  // projet identifiant

global.USER_DATA_PATH = path.join(require('os').homedir(),'Library','Application\ Support','Script-design-TEST')
// console.log('USER_DATA_PATH',USER_DATA_PATH)


// ---------------------------------------------------------------------


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



// ---------------------------------------------------------------------

function createParag( params )
{
  let now = moment().format('YYMMDD')

  if (undefined === params.id) {
    throw new Error("Il faut absolument définir l'identifiant du paragraphe, dans createParag (tests)")
  }

  params || ( params = {} )
  params.contents || (params.contents = `Contenu du paragraphe #${params.id}`)
  params.created_at = now
  params.updated_at = now
  params.duration  = 60 // durée/longueur
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
function initXParags ( nombre )
{
  let listeParags = []
  nombre || (nombre = 20)
  for(var pid = 0 ; pid < nombre ; ++ pid){
    listeParags.push(createParag({id: pid}))
    eval(`global.parag${pid} = listeParags[${pid}];`)
  }
  return pid
}


/** ---------------------------------------------------------------------
  *
  * Grande méthode qui initialise tout.
  *
*** --------------------------------------------------------------------- */

/**
* @param  {Object} params
*   params.projet_id    {String} Identifiant du projet
**/
resetCurrentProjet = function( params )
{
  params || (params = {})
  projet || ( projet  = new Projet(params.projet_id || PROJET_ID) )
  if (fs.existsSync(projet.parags_file_path)){
    fs.unlinkSync(projet.parags_file_path)
  }
  projet._modified = false
  params.options || (params.options = {})
  params.options['autosync'] = 0
  // TODO POURSUIVRE ICI LES OPTIONS EN PARAMÈTRE (LES DISTRIBUER)
  projet.option('autosync', 0)
  projet.option('autosave', 0)
  Projet.current = projet
  delete projet._relatives
  Parag._lastID = -1

}
global.resetAllPanneaux = function( params)
{
  params || ( params = {} )

  // On va créer 40 paragraphes
  params.nombre_parags || ( params.nombre_parags = 40 )

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
}


global.initTests = function ()
{
  resetCurrentProjet()
  resetAllPanneaux()
  let lastid = initXParags( 20 )
  projet.data_generales = { last_parag_id: lastid }
  Parag._lastID = lastid
}
