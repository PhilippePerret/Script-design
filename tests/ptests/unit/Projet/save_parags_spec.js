/*

  Avec ce test unitaire, on essaie de tester la sauvegarde du projet

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}

let testRunning = false

function testMethodeSaveParagsRepond ()
{
  expect(typeof projet.saveParags,'projet.saveParags').to.equal('function')
}
function testZeroParagsToSave ()
{
  testRunning = true // si les tests précédents ne sont pas lancés
  resetAllPanneaux()
  projet.current_panneau = panneauNotes
  projet.saveParags( () => {
    expect(projet.saved_parags_count).to.equal(0)
    testRunning = false
  })
}
function testSixParagsToSave ()
{
  this.timer && ( clearTimeout(this.timer) )
  if ( testRunning )
  {
    console.log("Je dois attendre")
    this.timer = setTimeout(testSixParagsToSave, 1000)
  }
  else
  {
    testRunning = true
    resetAllPanneaux()
    panneauNotes.parags.add([parag1, parag2, parag3, parag4, parag5])
    parag0._modified = true
    parag1._modified = true
    parag2._modified = true
    parag3._modified = true
    parag4._modified = true
    parag5._modified = true
    // ======> TEST <==========
    projet.saveParags( () => {
      // ======== VÉRIFICATION =========
      expect(projet.saved_parags_count).to.equal(6)
      testRunning = false
    })
  }
}
describe("Sauvegarde des paragraphes",[
  , describe("#saveParags",[
    , it("répond", ()=>{
      testMethodeSaveParagsRepond()
    })
    // , it("sauve les paragraphes modifiés", ()=>{
    //   pending()
    // })
    // , it("appelle la méthode callback après la sauvegarde", ()=>{
    //   pending()
    // })
    , context("avec aucun paragraphe à sauvegarder",[
      , it("met saved_parags_count à zéro", ()=>{
        testZeroParagsToSave()
      })
    ])
    , context("avec un certain nombre de paragraphes à sauvegarder",[
      , it("met dans saved_parags_count le nombre de parags sauvés", ()=>{
        testSixParagsToSave()
      })
    ])
  ])
])
