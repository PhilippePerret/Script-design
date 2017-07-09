/*
  Test de l'affichage des panneaux à l'aide du tabulator "boutons-panneaux"
*/
let fs = require('fs')
PTests.expose_dom_methods()

let otabulator, tabulator


let panneaux = [
    {key: 's', id: 'personnages', titre: "Personnages"}
  , {key: 'f', id: 'scenier',     titre: "Scénier"}
  , {key: 'd', id: 'synopsis',    titre: "Synopsis"}
  , {key: 'g', id: 'notes',       titre: "Notes"}
  , {key: 'h', id: 'treatment',   titre: "Traitement"}
  , {key: 'j', id: 'manuscrit',   titre: "Manuscrit"}
  , {key: 'q', id: 'data',        titre: null /* dépend du projet */}
]

function checkPanneau()
{
  let pan_data = panneaux.shift()
  if ( ! pan_data ) { return /* the end */ }
  let {key, id, titre} = pan_data

  // On passe par ici lorsque le tabulator est ouvert. On va
  // activer les touches claviers pour sélectionner les éléments
  otabulator = DOM.get('tabulator#boutons-panneaux')
  EV.focusIn(otabulator)
  KB.press(key, {target: otabulator})
  KB.press('Enter', {target: otabulator})
  waitForVisible(`section#panneau-${id}`, {timeout: 5, wait: 0})
    .then( () => {
      expect(`section#panneau-${id}`).asNode.to.exist
      if (titre){
        expect(`section#panneau-${id}`).to.have_tag('div',{id:`panneau-${id}-title`, text: titre})
      }
      // === On vérifie que tous les paragraphes soient bien affichés ===

      // On prend l'instance PanProjet du panneau
      let ipanneau = Projet.panneaux[id]
      console.log("--- EXPECTATION PANNEAU loaded ---")
      expect(ipanneau.loaded,'ipanneau.loaded').to.be.true
      console.log("--- /EXPECTATION PANNEAU loaded ---")
      // Si le store du panneau existe, on teste le chargement correct de ses
      // données.
      let pstore = ipanneau.store._file_path

      if (fs.existsSync(pstore)){
        let data_panneau = require(pstore)
        // console.log("DATA DU PSTORE:", data_panneau)
        // On fait la liste des enfants
        if ( data_panneau.parags )
        {
          let children = []
          data_panneau.parags.forEach( (p) => {
            children.push(['div', {id: `p-${p.id}`, class:'p', 'data-id': String(p.id) } ])
            children.push(['div', {class: 'p-contents', id:`p-${p.id}-contents`, text: p.contents}])
          })
          expect(`section#panneau-${id}`).to
            .have_tag('div',{id:`panneau-${id}-contents`, children: children})
        }
      }

      // === ON PASSE AU PANNEAU SUIVANT ===
      checkPanneau()
    })
    .else( (err) => {
      console.log("else car erreur", err)
      expect(`section#panneau-${id}`).asNode.to.exist
    })

}

class PTestsPage
{
  constructor ()
  {
    this.window = remote.getCurrentWindow()
  }
  reload ()
  {
    alert("Recharger la page va conduire au rechargement du test, en boucle… Je ne le fais pas.")
    // this.window.reload()
  }
  js (code)
  {
    return this.window.webContents.executeJavaScript(code)
  }
}
let page = new PTestsPage()


describe("Données du tabulator #boutons-panneaux",[
  , context("à l'ouverture",[
    , it("les items sont définis", ()=>{
      waitForTrue(()=>{return Tabulator.ready})
        .else( () => {
          throw new PTestsError('Le tabulator n’a pas pu être préparé.')
        })
        .then(() => {
          otabulator  = DOM.get('tabulator#boutons-panneaux')
          tabulator   = Tabulator.instanceFrom(otabulator)
          page.js('Tabulator._items').
            then( (result) => {
              console.log('TABULATOR._ITEMS', result)
            })
        })
    })
  ])
])

describe("Affichage des panneaux",[
  , describe("le tabulator #boutons-panneaux", [
    , it("répond au focus", ()=>{
      expect('tabulator#boutons-panneaux').asNode.to.exist
      waitForTrue( ()=>{return Tabulator.ready}, {timeout:10, wait: 2} )
        .else( () => {
          console.log("Le tabulator N'est PAS ready, je dois renoncer")
        })
        .then( ()=>{
          // Le tabulateur est prêt, on peut tester la validité de tous les
          // panneau les uns après les autres.
          checkPanneau()
        })
    })
  ])
])
