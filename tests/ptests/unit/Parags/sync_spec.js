/*

  Tests pseudo-unitaire ou pseudo-intégration pour tester la synchronisation
  d'un paragraphe.
  Noter que ce test vaut aussi pour l'autosync qui ne fait qu'appeler
  automatiquement la méthode Parag#sync

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}

class RelativesTest {
  constructor (projet) {
    this.projet = projet
  }
  get data (){
    this._data || ( this._data = { 'relatives': {} } )
    return this._data
  }
  defineRelativesForTests (v){ this.data.relatives = v}
  addParag (args) {
    // On en a besoin quand on fait panneau.parags.add(…)
  }
}

Object.defineProperties(Projet.prototype, {
  'relatives':{
    get: function(){
      (undefined === this._relatives) && ( this._relatives = new RelativesTest(projet))
      return this._relatives
    }
    , set: function(v){ this._relatives = v }
  }
})

function setDataRelatives (data)
{
  projet.relatives.defineRelativesForTests(data)
}

function setItemsOfPanneaux(data)
{
  for(let p in data){
    let pan_name  = Projet.PANNEAUX_DATA[p] // p => personnages
    let panneau   = projet.panneau(pan_name)
    panneau.parags.reset()
    panneau.parags.add( data[p] )
  }
}

// Il nous faut plusieurs panneaux
let h, letter

let parag_per_panneau = {
    'p': [12]
  , 'n': [11]
  , 'y': [10]
  , 's': [9]
  , 't': [8]
  , 'm': [7]
}

// ['personnages','notes','synopsis','scenier','treatment','manuscrit']
describe("Parag",[
  , describe("Fonctionnement de la méthode setDataRelatives (définition des relatives pour les tests)",[
    , it("définit à la volée les relatives des paragraphes", ()=>{
      setDataRelatives({'1':{'pour':'voir'}})
      expect(parag1.data_relatives,'parag1.data_relatives après première définition').to.equal({'pour':'voir'})
      setDataRelatives({'1':{'autre':'valeur'}})
      expect(parag1.data_relatives,'parag1.data_relatives après seconde définition').to.equal({'autre':'valeur'})
    })
  ])
  , describe("Méthode #sync",[
    , it("répond", ()=>{
      expect(parag1).asInstanceOf(Parag).to.respond_to('sync')
    })
    , context("avec un paragraphe déjà synchronisé dans tous les panneaux",[
      , it("ne produit aucun changement", () => {
        h = {}
        Projet.PANNEAUX_SYNC.forEach( p => {
          letter    = Projet.PANNEAUX_DATA[p].oneLetter
          h[letter] = parag_per_panneau[letter]
        })
        let initLastID = Parag._lastID
        setDataRelatives({'1':h})
        // =======> TEST <==========
        parag1.sync()
        // ========= VÉRIFICATIONS =========
        expect(parag1.data_relatives).to.equal(h)
        expect(Parag._lastID,'Parags._lastID').to.equal(initLastID)
      })
    ])
    , context("avec un premier paragraphe de panneau",[
      , it("ajoute un paragraphe à la fin de chaque panneau", ()=>{
        let initLastID = Parag._lastID
        setItemsOfPanneaux({
          'p': [parag1]
        })
        expect(Parag._lastID).to.equal(initLastID + Projet.PANNEAUX_SYNC.length - 1)
      })
    ])
  ])
])
