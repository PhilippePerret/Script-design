/*

  Avec ce test unitaire, on essaie de tester la sauvegarde du projet

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}


describe("Méthodes servant pour la sauvegarde",[
  , describe("#saveAll",[
    , it("#repond", ()=>{
      expect(typeof projet.saveAll).to.equal('function')
    })
  ])
  , describe("#checkModifiedState",[
    , it("répond", ()=>{
      expect(typeof projet.checkModifiedState).to.equal('function')
    })
    , it("met modified à true si au moins un panneau est modifié", ()=>{
      projet._modified = false
      expect(projet.modified).to.equal(false, oof)
      projet.panneau('data')._modified = true
      projet.panneau('scenier')._modified = true
      // =======> TEST <=======
      projet.checkModifiedState()
      // ======= VÉRIFICATION =======
      expect(projet.modified).to.strictly.equal(true)
    })
    , it("retourne false si aucun panneau n'est modifié", ()=>{
      Projet.PANNEAU_LIST.forEach( pan_id => projet.panneau(pan_id)._modified = false )
      projet._modified = true
      expect(projet.modified).to.equal(true, oof)
      // =======> TEST <=======
      projet.checkModifiedState()
      // ======= VÉRIFICATION =======
      expect(projet.modified).to.strictly.equal(false)
    })
  ])
  , , describe("#doAutosave",[
    , it("répond", ()=>{
      expect(typeof projet.doAutosave).to.equal('function')
    })
  ])
])
