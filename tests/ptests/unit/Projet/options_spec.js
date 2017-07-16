/*

Test de la création d'un paragraphe

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}

function setOptions(values)
{
  for(let prop in values){
    projet.options._data[prop] = values[prop]
  }
}

describe("Les options des projets",[
  , it("le projet répond à #options", ()=>{
    expect(projet.options,'projet.options').to.be.classOf('projetoptions')
  })
  , describe("les options répondent aux méthodes",[
    , it("#save", ()=>{
      expect(projet.options.save,'options.save').to.be.classOf('function')
    })
    , it("#set", ()=>{
      expect(projet.options.set,'options.set').to.be.classOf('function')
    })
    , it("#get", ()=>{
      expect(projet.options.get,'options.get').to.be.classOf('function')
    })
  ])
  , describe("définit les propriétés",[
    , it("@store_options", ()=>{
      expect(projet.options.store_options,'store_options').to.be.classOf('store')
    })
    , it("@data", () => {
      expect(projet.options.data,'options.data').to.be.classOf('object')
    })
  ])

])

describe("Méthode projet#option",[
  , it("répond", ()=>{
    expect(typeof projet.option).to.equal('function')
  })
  , context("avec un seul argument string",[
    , it("retourne la valeur de option", ()=>{
      setOptions({autosave: true})
      expect(projet.option('autosave'),"option('autosave')").to.strictly.equal(true)
    })
  ])
  , context("avec un deux arguments",[
    , it("permet de définir la valeur de l'option", ()=>{
      setOptions({'autosave': true})
      expect(projet.option('autosave'),"option('autosave')").to.strictly.equal(true)
      // ======> TEST <=======
      projet.option('autosave', false)
      // ====== VÉRIFICATION =======
      expect(projet.option('autosave'),"option('autosave')").to.strictly.equal(false)
    })
  ])
  , context("avec un seul argument object",[
    , it("permet de définir plusieurs options", ()=>{
      setOptions({'autosave':true, 'autosync':true})
      expect(projet.option('autosave'),"option('autosave')").to.equal(true, oof)
      expect(projet.option('autosync'),"option('autosync')").to.equal(true, oof)
      // ========> TEST <==========
      projet.option({autosave:false, autosync: false})
      // ======== VÉRIFICATION =======
      expect(projet.option('autosave'),"option('autosave')").to.strictly.equal(false)
      expect(projet.option('autosync'),"option('autosync')").to.strictly.equal(false)
      // Le fichier a dû être créé
      expect(projet.options.store_options.fpath,'le fichier des options').asFile.to.exist
    })
  ])
])

describe("La méthode qui répond au menu des options, projet.options#define",[
  , it("répond", ()=>{
    expect(projet.options.define,'options.define').to.be.classOf('function')
  })
])
