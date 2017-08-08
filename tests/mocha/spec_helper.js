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

global.resetTabulator = function ()
{
  Tabulator.SectionMaps   = new Map()
  Tabulator.curSectionMap = undefined
}

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
  Parags._items.delete(pid)
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

/** ---------------------------------------------------------------------
  *
  * Méthodes utiles pour les BRINS
  *
*** --------------------------------------------------------------------- */

global.resetBrins = function ()
{
  // console.log("-> resetBrins()")
  Brins._items    = new Map()
  projet._brins   = undefined
  global.brins = projet.brins

  brins._panneau    = undefined // forcer la reconstruction
  brins._ULlisting  = undefined
  brins._form       = undefined

  global.brin  = new Brin({id: 0, projet: projet, titre: "Brin sans titre"})
  global.brin1 = new Brin({id: 1, projet: projet, titre: "Brin #1", type: 20})
  global.brin2 = new Brin({id: 2, projet: projet, titre: "Brin #2"})
  global.brin3 = new Brin({id: 3, projet: projet, titre: "Brin #3", type: 20})
  global.brin4 = new Brin({id: 4, projet: projet, titre: "Brin #4", type: 31})
  global.brin5 = new Brin({id: 5, projet: projet, titre: "Brin #5", type: 20})
  global.brin6 = new Brin({id: 6, projet: projet, titre: "Brin #6", type: 0})
  global.brin7 = new Brin({id: 7, projet: projet, titre: "Brin #7", type: 12})
  global.brin8 = new Brin({id: 8, projet: projet, titre: "Brin #8", type: 12})
  global.brin9 = new Brin({id: 9, projet: projet, titre: "Brin #9", type: 12})

  projet.panneau('data').setDefaultData()
  Brin._lastID = projet.panneau('data')._data.last_brin_id = 9

}

global.createProjetNoSave = function ()
{
  // console.log("-> createProjetNoSave")

  return new Promise( (ok, ko) => {
    resetTests({nombre_parags:20})

    resetBrins()

    // ========= DONNÉES ============

    panneauNotes.add([parag1, parag3, parag5])
    panneauScenier.add([parag0])
    panneauSynopsis.add([parag2, parag4])
    panneauTreatment.add([parag6, parag7, parag8, parag9])

    /*= le brin #0 dans les parags #1 et #0 et #4 =*/

    brin.addParag(parag1)
    brin.addParag(parag0)
    brin.addParag(parag4)

    /*= le brin #2 dans les parags #1 et #5 =*/

    brin2.addParag(parag1)
    brin2.addParag(parag5)

    // Dans le brin #5 on met les 10 premiers parags (0 à 9)
    for(var i = 0 ; i < 10 ; ++i ){
      brin5.addParag(Parags.get(Number(i)))
    }
    ok()
  })
}
/**
* Crée un projet avec des brins, des brins associés à des
* parag puis initialize tout.
*
* @return {Promise}
* Donc il faut utiliser dans le test :
*   resetProjetWithBrins()
*   .then( () => {
*       // ... le test ici ...
*   })
**/
global.resetProjetWithBrins = function ()
{

  // console.log("-> resetProjetWithBrins")

  return createProjetNoSave()
  .then( () => {
    // ========= FIN DONNÉES ============

    parag0.modified       = true
    parag1.modified       = true
    parag4.modified       = true
    parag5.modified       = true
    brin.modified         = true
    brin1.modified        = true
    brin2.modified        = true
    brin3.modified        = true
    panneauNotes.modified     = true
    panneauScenier.modified   = true
    panneauSynopsis.modified  = true
    projet.brins.modified = true

    return Promise.resolve()
  })
  .then( projet.saveAll.bind(projet ))
  .then( () => {
    expect(fs.existsSync(projet.parags_file_path)).to.be.true
    return Promise.resolve()
  })
  // .then(ok)
  .then( () => {
    console.log("= Fin de la préparation de resetProjetWithBrins")
    return Promise.resolve()
  })
}

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
  forEach(params.options, (v, p) => { projet.option(p, v) })
  Parag._lastID = -1

  /*- Destruction du fichier brins s'il existe -*/

  let pth = projet.brins.store.path
  if (fs.existsSync(pth)) {fs.unlinkSync(pth)}


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
  panneauData.setDefaultData()
  panneauData.store.saveSync()
  projet._data = panneauData

}


function resetAllParags (params) {
  let pth ;

  Parags.reset()

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
  // console.log("-> initTests")
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
