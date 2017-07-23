/*

  Tests unitaire de l'instance `parags` des panneaux, qui permet de
  gérer ses pararaphes propres (en distinction des tous les paragraphes du
  projet).

*/
let path      = require('path')
let fs        = require('fs')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}
resetAllPanneaux()

// NOTE Il s'agit ici de la nouvelle façon d'enregistrer les paragraphes,
// avec une longueur fixe.
describe("Enregistrement du panneau",[
  , describe("PanProjet#save_parags",[
    // Rappel : toutes les méthodes `_infile` décrivent pour le moment
    // des méthodes qui sont utilisées pour l'enregistrement à longueur
    // fixe.
    , it("répond", ()=>{
      expect(typeof panneauNotes.save_parags).to.equal('function' )
    })
    , it("permet d'enregistrer les données du panneau", ()=>{
      if (fs.existsSync(panneauNotes.parags_file_path)){
        fs.unlinkSync(panneauNotes.parags_file_path)
        puts("Le fichier des paragraphes existait, je l'ai détruit")
      }
      panneauNotes.parags.add([parag1, parag2, parag3])
      panneauNotes.modified = true
      // ========> TEST <=========
      panneauNotes.save_parags()
      waitForTrue(()=>{return panneauNotes.saving === false})
      .then( () => {
        // ======== VÉRIFICATIONS ========
        expect(panneauNotes.parags_file_path).asFile.to.exist
      })
    })
    , it("permet de ré-enregistrer les paragraphes du panneau", ()=>{
      // On modifie la date de création du paragraphe en lui retirant
      // une année.
      let ca    = parag1.created_at
      let y     = Number(ca.substring(4,6)) - 1
      let newCa = ca.substring(0,4) + y
      parag1.created_at = newCa
      puts(`Nouvelle année de parag1 = '${parag1.created_at}'` )
      panneauNotes.modified = true
      // ========> TEST <==========
      panneauNotes.save_parags()
      waitForTrue(()=>{return panneauNotes.saving === false})
      .then( () => {
        // ======== VÉRIFICATIONS ========
        expect(panneauNotes.parags_file_path).asFile.to.exist
        let newp = parag1.read_infile()
        expect(newp).to.contain(newCa)
      })
    })
  ])
])
