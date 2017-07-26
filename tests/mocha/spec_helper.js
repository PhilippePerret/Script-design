/*

  Support pour les tests MOCHA unitaires
  --------------------------------------

  Cette ligne doit être ajoutée à chaque test mocha :

    require('../../spec_helper.js')
    // Régler la profondeur si nécessaire

  Noter qu'il est inutile d'appeller resetTests() au début du fichier puisque
  c'est fait automatiquement au chargement de cette librairie.

*/
global.path   = require('path')
global.moment = require('moment')
global.fs     = require('fs')
global.assert = require('assert')
const chai    = require('chai')
global.expect = chai.expect

const myChaiExtension = require('./support/chai-extension')
chai.use(myChaiExtension)

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

global.UILog = function(message, type)
{
  this._messages_UILog || ( this._messages_UILog = [] )
  this._messages_UILog.push({message: message, type: type})
}

// ---------------------------------------------------------------------


Object.defineProperties(PanProjet.prototype, {
  'section': {
    get: function(){
      this._section || (this._section = DOM.create('div', {id: `panneau-${this.id}`}))
      return this._section
    }
  },
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
  params.duration   = 60 // durée/longueur
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
  // On commence par détruire tous les paragraphes qui ont pu être créés
  // avant
  let pid = 0
  while(undefined !== global[`parag${pid++}`]){delete global[`parag${pid++}`]}
  if ( nombre === 0 ) { return }

  let listeParags = []
  if ( undefined === nombre /* car nombre peut === 0 */) { nombre = 20 }
  for(pid = 0 ; pid < nombre ; ++ pid){
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
  projet  = new Projet(params.projet_id || PROJET_ID)
  // console.log("Nouveau projet __ID : %d", projet.__ID)
  // On met toujours le projet en projet courant
  Projet.current = projet
  projet._modified = false

  params.options || (params.options = {})
  params.options.autosync || (params.options['autosync'] = 0)
  params.options.autosave || (params.options['autosave'] = 0)
  for(var p in params.options){
    if (params.options.hasOwnProperty(p)){projet.option(p, params.options[p])}
  }
  Parag._lastID = -1

}
global.resetAllPanneaux = function( params)
{
  let now = moment().format()

  // On va créer 40 paragraphes
  if (undefined === params.nombre_parags) { params.nombre_parags = 40 }

  projet.definePanneauxAsInstances()
  Projet.PANNEAU_LIST.forEach( (pan_id) => {
    let pan = projet.panneau(pan_id)
    // On détruit le fichier de données s'il existe
    if ( fs.existsSync(pan.store.path) ) { fs.unlink(pan.store.path)}
    pan._modified = false
    pan.container.innerHTML = ''
    pan.parags.reset()
    pan.parags._projet = projet
    // On crée des propriétés globales pour faire `panneauNotes`
    eval(`global.panneau${pan_id.titleize()} = projet.panneau('${pan_id}');`)
  })

  // On définit les données général du projet, dans le panneau Data
  let h = {
      'title'         : "Exemple pour tests"
    , 'summary'       : "Le résumé du projet donné en exemple."
    , 'author'        : ["Phil", "Marion", "Ernest"]
    , 'created_at'    : now
    , 'updated_at'    : now
    , 'last_parag_id' : 0
  }
  projet.data_generales = h
  panneauData.store._data = h
  panneauData.store.save(true)

}

function resetAllParags (params) {
  let pth
  // On détruit le fichier des parags s'il existe
  pth = projet.parags_file_path
  if ( fs.existsSync(pth) ) { fs.unlinkSync(pth) }
  // Il faut détruire le fichier des relatives
  pth = projet.relatives.store.path
  if (fs.existsSync(pth)) {fs.unlinkSync(pth)}
  projet.relatives.reset()
  // On crée autant de paragraphes que voulu (20 par défaut)
  let lastid = initXParags( params.nombre_parags )
  return lastid
}
/**
* @param  {Object} params
*   params.nombre_parags      Nombre de paragraphes à construire
*                             Défaut : 40, de parag0 à parag39
**/
global.initTests = function ( params )
{
  params || ( params = {} )
  resetCurrentProjet( params )
  resetAllPanneaux( params )
  let lastid = resetAllParags( params )
  projet.data_generales = { last_parag_id: lastid }
  Parag._lastID = lastid
  // console.log("=== RÉINITIALISATION DES TESTS ===")
}
global.initTest   = initTests
global.resetTests = initTests
global.resetTest  = initTests

/**
* Pour écrire des messages en vert ou en rouge dans la console
*
* @usage
*
*   myLog("Le message en vert", 'ok' / * ou 'green' ou 'vert' * /)
*   myLog("Le message en rouge", 'red' / * ou 'rouge' ou 'error' * /)
*
* Note : ce message n'a aucune incidence sur les tests.
**/
global.myLog = function(message, type)
{
  let temp
  switch(type)
  {
    case 'green':
    case 'vert':
    case 'ok':
      temp = '[32m%s[0m'
      break
    case 'red':
    case 'rouge':
    case 'error':
      temp = '[31m%s[0m'
      break
    default:
      temp = '%s'
  }
  console.log(temp, message)
}

before(function () {
  this.jsdom = require('jsdom-global')()
})

after(function () {
  this.jsdom()
})


resetTests()
