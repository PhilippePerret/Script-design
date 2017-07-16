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

    @ Pour sélectionner des paragraphes

        // (après avoir ajouté les paragraphes)
        panneau.parags.select(parag2)
        panneau.parags.select([parag10, parag2])

*/
let path    = require('path')
  , moment  = require('moment')

global.Parag      = require_module(path.join('.','__windows__','_common_','js','Parag.js'))
global.Projet     = require_module(path.join('.','__windows__','projet','js','projet_class.js'))
global.PanProjet  = require_module(path.join('.','__windows__','projet','js','panprojet_class.js'))
global.Parags     = require_module(path.join('.','__windows__','_common_','js','Parags.js'))
global.Relatives  = require_module(path.join('.','__windows__','projet','js','relatives_class.js'))
global.Store      = require_module(path.join('.','lib','utils','store_class.js'))

global.path       = path

// Pour que les Parag(s) soient bien associés au panneau
Projet.panneaux = {}


/** ---------------------------------------------------------------------
  *
  *   STUBS
  *
*** --------------------------------------------------------------------- */

Object.defineProperties(PanProjet.prototype, {
  'container': {
    get: function(){
      if ( undefined === this._container ) {
        this._container = DOM.create('div', {id:`panneau-contents-${PANNEAU_ID}`})
      }
      return this._container
    }
  }
})

global.projet
global.panneau
global.parag0
global.parag1
global.parag2
global.parag3
global.parag4
global.parag5
global.parag6
global.parag7
global.parag8
global.parag9
global.parag10
global.parag11
global.parag12

global.PANNEAU_ID  = 'synopsis'
global.PROJET_ID   = 'exemple'

/**
*  Pour définir le projet :
*     params.panneau_id
*
**/
function createParag( params )
{
  let now = moment().format()
  let lastID
  lastID = lastID ? lastID + 1 : 0

  params || (params = {})
  params.id || (params.id = lastID)
  params.panneau_id = PANNEAU_ID
  params.contents || (params.contents = `Contenu du paragraphe #${params.id}`)
  params.data = {
    id: params.id,
    contents: params.contents,
    created_at: now, updated_at: now
  }
  return new Parag(params)
}

function init20Parags ()
{
  let listeParags = []
  for(var pid = 0 ; pid < 20 ; ++ pid){
    listeParags.push(createParag({id: pid}))
  }
  parag0  = listeParags[0]
  parag1  = listeParags[1]
  parag2  = listeParags[2]
  parag3  = listeParags[3]
  parag4  = listeParags[4]
  parag5  = listeParags[5]
  parag6  = listeParags[6]
  parag7  = listeParags[7]
  parag10 = listeParags[10]
  parag11 = listeParags[11]
  parag12 = listeParags[12]
  // ...
  parag19 = listeParags[19]
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

global.resetAll = function ()
{
  // console.log('-> resetAll')
  projet || ( projet  = new Projet(PROJET_ID) )
  Projet.current = projet
  Parag._lastID = -1
  panneau = new PanProjet(PANNEAU_ID)
  Projet.panneaux || ( Projet.panneaux = {} )
  Projet.panneaux[PANNEAU_ID] = panneau
  Projet._current_panneau = panneau

  projet._modified  = false
  panneau._modified = false

  panneau.container.innerHTML = ''
  panneau.parags.reset()
  panneau.parags.selection.reset()
  panneau.parags._projet = projet
  init20Parags()
  projet.data_generales = {
    last_parag_id: 12
  }
  // console.log('<- resetAll')
}

projet  = new Projet(PROJET_ID)
Projet.current = projet
panneau = new PanProjet(PANNEAU_ID)
Projet.panneaux[PANNEAU_ID] = panneau
Projet._current_panneau = panneau
