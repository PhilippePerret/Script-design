/*

  Tests unitaire de l'instance `parags` des panneaux, qui permet de
  gérer ses pararaphes propres (en distinction des tous les paragraphes du
  projet).

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}

function mafonction(){
  expect(panneau.container).to.have_tag('div',{id:'p-1', 'contenteditable':'true'})
}
describe("Parag",[
  , describe("#doEdit et #undoEdit()",[
    , it("permet de modifier le contenu", ()=>{
      resetAll()
      panneau.parags.add(parag1)
      expect(panneau.container, 'le panneau').not.to.have_tag('div',{id:'p-1-contents', 'contenteditable':'true'})
      parag1.edit()
      waitForVisible('div#p-1-contents[contenteditable="true"]', {in:panneau.container})
      .then( () => {
        expect(panneau.container, 'le panneau').to.have_tag('div',{id:'p-1-contents', 'contenteditable':'true'})
        let o = panneau.container.querySelector('div#p-1-contents')
        // =========> TEST <===========
        let t = "Le contenu du paragraphe modifié pour voir."
        o.innerHTML = t
        parag1.undoEdit()
        // ======== VÉRIFICATION =======
        expect(parag1.contents).to.strictly.equal(t)
      })
    })
  ])
])
