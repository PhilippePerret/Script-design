/*

  Pour lancer ce test, jouer en console :

  $ ./node_modules/.bin/mocha ./tests/mocha/unit/** / *_spec.js (supprimer espaces)

*/
let path      = require('path')
let assert    = require('assert')

require(path.resolve(path.join('.','tests','mocha','support','all_tests.js')))

initTests()

describe("Projet#saveParags", () => {
  it('should do something', () => {
    assert.equal(2+2, 4, "L'addition est bonne")
  })
  , it("répond", ()=>{
    assert.equal(typeof projet.saveParags, 'function')
  })
  , it("permet d'enregistrer tous les paragraphes", ()=>{
    panneauNotes.parags.add([parag0, parag1, parag2, parag3])
    parag0._modified = true
    parag1._modified = true
    parag2._modified = true
    parag3._modified = true
    // =========> TESTS <=========
    projet.saveParags( () => {
      console.log("J'AI FINI DE TESTER LA SAUVEGARDE")
      assert.equal(projet.saved_parags_count, 4)
    })
  })
})
