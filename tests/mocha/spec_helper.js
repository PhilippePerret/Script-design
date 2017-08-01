/*

  Support pour les tests MOCHA unitaires
  --------------------------------------

  Cette ligne doit être ajoutée à chaque test mocha :

    require('../../spec_helper.js')
    // Régler la profondeur si nécessaire

  Noter qu'il est inutile d'appeller resetTests() au début du fichier puisque
  c'est fait automatiquement au chargement de cette librairie.

  MÉTHODES UTILES
  ---------------

    resetTests([{options}])

        Ré-initialiser les tests.
        Options peuvent contenir par exemple {nombre_parags: x} où "x" est le
        nombre de parags à initialiser. Noter que tous les autres seront
        détruits en profondeur.


    unloadParag( < ID parag > )

        Pour "décharger" un parag.

*/
global.path               = require('path')
global.PROJET_JS_FOLDER   = path.resolve('./__windows__/projet/js')


global.assert = require('assert')
const chai    = require('chai')
global.expect = chai.expect
const myChaiExtension = require('./support/chai-extension')
chai.use(myChaiExtension)
// global.jsdom  = require('mocha-jsdom')
// global.document = jsdom().
const jsdom = require('jsdom')
const {JSDOM} = jsdom
global.JSDOM = JSDOM
const dom = new JSDOM()
const window = dom.window
// const window = (new JSDOM(`<!DOCTYPE html>`)).window
global.document = window.document


// Toutes les définitions globales
require(path.join(PROJET_JS_FOLDER,'_includes.js'))


global.projet = undefined // utiliser initTess() pour l'instancier

global.PANNEAU_ID  = 'synopsis' // panneau par défaut dans projet
global.PROJET_ID   = 'exemple'  // projet identifiant
global.USER_DATA_PATH = path.join(require('os').homedir(),'Library','Application\ Support','Script-design-TEST')
// console.log('USER_DATA_PATH',USER_DATA_PATH)


/** ---------------------------------------------------------------------
  *
  *   MÉTHODES UTILES
  *
*** --------------------------------------------------------------------- */

/**
* Méthode pour "décharger" un parag existant. Par exemple pour tester
* son chargement.
**/
global.unloadParag = function( pid )
{
  Parags.get(pid).reset()
  const pan = Parags.get(pid).panneau

  if ( undefined !== global[`parag${pid}`] ){
    delete global[`parag${pid}`]
    expect(eval(`'undefined' == typeof(parag${pid})`)).to.be.true
  }
  delete Parags._items[pid]
  expect(Parags.get(pid)).to.be.undefined
  // Dans son panneau
  if ( pan )
  {
    pan.parags._dict.delete(pid)
    let off = pan.parags._ids.indexOf(pid)
    pan.parags._ids.splice(off, 1)
    pan.parags._items.splice(off, 1)
    expect(pan.parags._dict[pid]).to.be.undefined
  }
}

/** ---------------------------------------------------------------------
  *
  *   SURCLASSEMENT DE FONCTIONS
  *
*** --------------------------------------------------------------------- */

/**
* La méthode log simple qui met les messages dans la console
**/
global.log = function()
{
  console.log(...arguments)
}

// Il faut surclasser la méthode qui écrit des messages dans
// la fenêtre (pied de page)
global.UILog = function(message, type)
{
  this._messages_UILog || ( this._messages_UILog = [] )
  this._messages_UILog.push({message: message, type: type})
}


// ---------------------------------------------------------------------

let container_index = 0

PanProjet.keepContainer = function(panid, container)
{
  this._containers || this.resetContainers()
  this._containers.set(panid, container)
}
PanProjet.getContainer = function(panid)
{
  this._containers || this.resetContainers()
  return this._containers.get(panid)
}
PanProjet.resetContainers = function()
{
  this._containers = new Map()
}

Object.defineProperties(PanProjet.prototype, {
  'section': {
    get: function(){
      if ( ! this._section )
      {

        this._section = DOM.create('div', {id: `panneau-${this.id}`, class:'panneau'})

        /*- Ajout du verso du parag ici, si pas encore fait -*/

        if ( ! PanProjet.formVersoParagAlreadyAdded )
        {
          html = fs.readFileSync('./__windows__/projet/html/verso_parag_form.ejs', 'utf8')
          this._section.innerHTML = html
          PanProjet.formVersoParagAlreadyAdded = true
        }


      }
      return this._section
    }
  },
  'container': {
    get: function(){
      if ( ! this._container ) {
        this._container = PanProjet.getContainer(this.id)
        if ( ! this._container )
        {
          this._container = DOM.create('div', {id:`panneau-contents-${this.id}`, 'index': (++container_index)})
          // l'attribut 'index' ci-dessus a été ajouté pour vérifier qu'on avait bien le même
          // container.

          PanProjet.keepContainer(this.id, this._container)
        }
      }
      return this._container
    }
  }
})

Object.defineProperties(PanData.prototype, {
  'section': {
    get: function(){
      this._section || (this._section = DOM.create('div', {id: `panneau-data`, class:'panneau'}))
      return this._section
    }
  },
  'container': {
    get: function(){
      if ( ! this._container ) {
        this._container = PanProjet.getContainer(this.id)
        if ( ! this._container )
        {
          this._container = DOM.create('div', {id:`panneau-contents-data`, 'index': (++container_index)})

          // l'attribut 'index' ci-dessus a été ajouté pour vérifier qu'on avait bien le même
          // container.
          PanProjet.keepContainer(this.id, this._container)
        }
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
  for(;pid < 2000;++pid){delete global[`parag${pid}`]}
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
* Réinitialisation de l'application. Appelé chaque fois qu'on fait
* resetTest(…)
**/
resetApp = function( params )
{
  Projet.resetPanneauxSync()
}

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
    if (params.options.hasOwnProperty(p)){
      projet.option(p, params.options[p])
    }
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
    if ( fs.existsSync(pan.store.path) ) { fs.unlinkSync(pan.store.path)}
    pan._modified = false
    pan.container.innerHTML = ''
    if ( pan_id != 'data')
    {
      pan.parags.reset()
      pan.parags._projet = projet
    }
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
  panneauData.data = h
  panneauData.store.saveSync()

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
  resetApp( params )
  resetCurrentProjet( params )
  resetAllPanneaux( params )
  let lastid = resetAllParags( params )
  projet.data.last_parag_id = lastid
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
  // Utile pour tout ce qui concerne le DOM "virtuel"

  PanProjet.resetContainers()
  // Par commodité, les containers des panneaux (qui sont mockés pour les
  // tests) sont conservés dans PanProjet._containers. À chaque nouvelle
  // feuille de test, il faut néanmoins resetter cette propriété pour repartir
  // à zéro.

})

after(function () {

  this.jsdom()
  // Certainement pour remettre en fonction le window/window.document normal.


})


resetTests()
