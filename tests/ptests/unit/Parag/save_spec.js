/*

  Tests unitaire de l'instance `parags` des panneaux, qui permet de
  gérer ses pararaphes propres (en distinction des tous les paragraphes du
  projet).

*/
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}

// NOTE Il s'agit ici de la nouvelle façon d'enregistrer les paragraphes,
// avec une longueur fixe.
describe("Enregistrement du paragraphe",[
  , describe("#xBytesData",[
    , it("répond", ()=>{
      expect(typeof parag1.xBytesData).to.equal('function')
    })
    , it("retourne une valeur d'identifiant valide", ()=>{
      res = parag1.xBytesData('id')
      expect(res.length,'longueur de la donnée').to.equal(Parag.DATA['id'].length + 1)
      expect(res).to.strictly.equal('n       1')
    })
    , it("retourne une valeur de contenu valide", ()=>{
      let str = "Le premier paragraphe\nPour le voir sur deux lignes."
      parag1.contents = str
      res = parag1.xBytesData('contents')
      let len = Parag.DATA['contents'].length
      expect(res.length,'la longueur de la données').to.equal(len + 1)
      while(str.length < len){ str = ` ${str}`}
      expect(res,'la donnée contenu').to.equal(`s${str}`)

    })
    , it("retourne une valeur de durée valide", ()=>{
      parag1.duration = 3600
      res = parag1.xBytesData('duration')
      expect(res.length,'longueur de la donnée').to.equal(Parag.DATA['duration'].length + 1)
      expect(res).to.strictly.equal('n        3600')
    })
    , it("retourne une valeur de création valide", ()=>{
      parag1.created_at = '170721'
      res = parag1.xBytesData('created_at')
      let len = Parag.DATA['created_at'].length
      expect(res.length,'longueur de la donnée').to.equal(len + 1)
      expect(res).to.strictly.equal('e170721')
    })
  ])
  , describe("#dataline_infile",[
    , it("répond", ()=>{
      expect(parag1.dataline_infile).not.to.strictly.equal(undefined)
    })
    , it("retourne une donnée de longueur valide", ()=>{
      res = parag1.dataline_infile
      let longueur = 0
      for(let p in Parag.DATA){ longueur += Parag.DATA[p].length + 1 }
      longueur += 2 // les 2 retours chariot séparant les données
      expect(res.length, 'la longueur de la ligne de donnée').to.equal(longueur)
    })
  ])
])
