/*

  Pour lancer ce test, jouer en console :

  $ ./node_modules/.bin/mocha ./tests/mocha/unit/** / *_spec.js (supprimer espaces)

*/
require('../../spec_helper.js')

describe("Projet#saveParags", () => {
  it("répond", function(){
    expect(projet).to.respondsTo('saveParags')
  })
  it("retourne une promesse", function(){
    expect(projet.saveParags()).to.be.instanceOf(Promise)
  })
  describe('Enregistrement des parags', function () {
    before(function () {
      resetTests()
      panneauNotes.parags.add([parag0, parag1, parag2, parag3])
      parag0._modified = true
      parag1._modified = true
      parag2._modified = true
      parag3._modified = true
      // ======== PRÉVÉRIFICATION ===========
      expect(fs.existsSync(projet.parags_file_path), 'Le fichier des parags (PARAGS.txt) ne devrait pas exister…').not.to.equal(true)
      expect(parag0._modified, 'la marque _modified du parag#0 devrait être true').to.be.true
      expect(parag3._modified, 'la marque _modified du parag#3 devrait être true').to.be.true

      // =========> TESTS <=========
      return projet.saveParags()
    });

    it("enregistre le bon nombre de parags", function(){
      expect(projet.saved_parags_count, "Le nombre de parags enregistrés devrait être 4").to.equal(4)  })
    it("enregistre tous les parags dans un fichier PARAGS.txt", function(){
      expect(fs.existsSync(projet.parags_file_path), 'Le fichier des parags (PARAGS.txt) devrait exister…').to.equal(true)
    })
    it("tous les paragraphes sont enregistrés dans un fichier de données", function(){
      expect(fs.existsSync(projet.parags_file_path)).to.equal(true)
    })
    it("le fichier de données fait la bonne taille", function(){
      c = fs.readFileSync(projet.parags_file_path, {encoding:'utf8'})
      expect(c.length).to.equal(4 * Parag.dataLengthInFile)
    })
    it("dans le fichier, une donnée est composée correctement", function(){
      c = fs.readFileSync(projet.parags_file_path, {encoding:'utf8'})
      // On va étudier la deuxième donnée
      c = c.substr(Parag.dataLengthInFile, Parag.dataLengthInFile)
      // console.log(`Data '${c}'`)
      s = c.substring(0,1) ; c = c.substr(1, c.length)
      expect(s).to.equal('n') // type Number
      // = ID =
      s = c.substr(0, Parag.DATA['id'].length) ; c = c.substr(Parag.DATA['id'].length, c.length)
      s = Number(s.trim())
      expect(s).to.equal(1)
      // = PANNEAU =
      s = c.substr(0,1) ; c = c.substr(1, c.length)
      expect(s).to.equal('s') // type String
      s = c.substr(0,1) ; c = c.substr(1, c.length)
      expect(s).to.equal('n') // panneau Note
      // = CONTENTS =
      s = c.substr(0,1) ; c = c.substr(1, c.length)
      expect(s).to.equal('s') // type String
      s = c.substr(0, Parag.DATA['ucontents'].length) ; c = c.substr(Parag.DATA['ucontents'].length, c.length)
      expect(s.trim()).to.equal('Contenu du paragraphe #1')
      // = DURÉE =
      s = c.substr(0,1) ; c = c.substr(1, c.length)
      expect(s).to.equal('n') // type Number
      s = c.substr(0, Parag.DATA['duration'].length) ; c = c.substr(Parag.DATA['duration'].length, c.length)
      expect(Number(s.trim())).to.equal(60)
      // = DATE =
      let now = moment().format('YYMMDD')
      s = c.substr(0,1) ; c = c.substr(1, c.length)
      expect(s).to.equal('e') // type Number

    })
    it('les paragraphes sont marqués non modifiés', function(){
      expect(parag0._modified).to.be.false
      expect(parag1._modified).to.be.false
    });
    it('tous les panneaux sont marqués non modifiés', function(){
      Projet.PANNEAUX_SYNC.forEach( panid => {
        expect(projet.panneau(panid)._modified, `Le panneau '${panid}' devrait être marqué non modifié.`).to.be.false
      })
    });

  })

})
