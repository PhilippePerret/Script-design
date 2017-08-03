/*

  Test des instances {Brin}

*/
require('../../spec_helper.js')


global.brin1 = new Brin({id: 1, projet: projet})

describe.only('Brin', function () {
  it("est une classe", function(){
    expect(typeof Brin).not.to.be.undefined
    expect(typeof Brin).to.equal('function')
  })

  /** ---------------------------------------------------------------------
    *
    *   TESTS CLASSE
    *
  *** --------------------------------------------------------------------- */

  describe('Brin.MAX_TITRE_LENGTH', function () {
    it("existe et retourne un nombre", function(){
      expect(Brin.MAX_TITRE_LENGTH).not.to.be.undefined
      expect(typeof Brin.MAX_TITRE_LENGTH).to.equal('number')
    })
  });
  describe('Brin.MAX_DESCRIPTION_LENGTH', function () {
    it("existe et retourne un nombre", function(){
      expect(Brin.MAX_DESCRIPTION_LENGTH).not.to.be.undefined
      expect(typeof Brin.MAX_DESCRIPTION_LENGTH).to.equal('number')
    })
  });
  /** ---------------------------------------------------------------------
    *
    *   TESTS INSTANCE
    *
  *** --------------------------------------------------------------------- */
  describe('id', function () {
    it("existe", function(){
      expect(brin1).to.not.be.undefined
    })
    it("retourne l'ID du brin", function(){
      expect(brin1.id).to.equal(1)
    })
  });


  describe('id32', function () {
    it("existe", function(){
      expect(brin1.id32).not.to.be.undefined
    })
    it("retourne l'ID en base 32", function(){
      let brin = new Brin({id:12})
      let arr = [
          {dix: 0, tr2: '0'}
        , {dix: 31, tr2: 'v'}
      ]
      arr.forEach( (paire) => {
        expect(paire.dix.toBase32()).to.equal(paire.tr2)
        expect(paire.tr2.fromBase32()).to.equal(paire.dix)
        brin.id = paire.dix
        expect(brin.id).to.equal(paire.dix)
        brin.reset()
        expect(brin.id32).to.equal(paire.tr2)
      })
    })
  });

  describe('Brin@titre', function () {
    it("existe", function(){
      expect(brin1.titre).not.to.be.undefined
    })
    it("retourne le titre dans en data", function(){
      let titre = "Mon titre du "+moment().format()
      brin1.data.titre = titre
      expect(brin1.titre).to.equal(titre)
    })
    it("produit une erreur si un argument undefined est passé", function(){
      expect(()=>{brin1.titre = undefined}).to.throw("Il faut définir le titre !")
    })
    it("produit une erreur si le titre est vide", function(){
      expect(()=>{brin1.titre = ''}).to.throw('Il faut définir le titre !')
    })
    it("produit une erreur si le titre est trop long", function(){
      let t = "Un titre trop long "
      while(t.length < Brin.MAX_TITRE_LENGTH){ t += t }
      expect(()=>{brin1.titre = t}).to.throw(`Le titre du brin ne doit pas excéder les ${Brin.MAX_TITRE_LENGTH} caractères !`)
    })
    it("modifie la valeur dans data si ok", function(){
      brin1.projet = projet
      let newTitre = "Mon nouveau titre ici"
      brin1.data.titre = "Ancien titre"
      expect(brin1.titre).to.equal("Ancien titre")
      brin1.titre = newTitre
      expect(brin1.data.titre).to.equal(newTitre)
      expect(brin1.titre).to.equal(newTitre)
    })
    it("marque le brin et le projet modifiés si le titre est modifié", function(){
      brin1.projet = projet
      projet.modified = false
      brin1.modified = false
      expect(brin1.modified).to.be.false
      brin1.titre = "Un nouveau titre pour le brin du " + moment().format()
      expect(brin1.modified).to.be.true
      expect(brin1.projet.modified).to.be.true
    })
  });

  describe('Brin@description', function () {
    it("existe", function(){
      expect(brin1.description).not.to.be.undefined
    })
    it("retourne la description en data", function(){
      let mades = "Ma description du "+moment().format()
      brin1.data.description = mades
      expect(brin1.description).to.equal(mades)
    })
    it("produit une erreur si la description est trop longue", function(){
      let d = "ma nouvelle description pour "
      while(d.length < Brin.MAX_DESCRIPTION_LENGTH){ d += d }
      expect(()=>{brin1.description = d}).to.throw(`La description ne doit pas excéder les ${Brin.MAX_DESCRIPTION_LENGTH} caractères !`)
    })
    it("ne produit pas d'erreur si undefined ou '' sont fournis", function(){
      expect(()=>{brin1.description = undefined}).not.to.throw()
    })
    it("modifie la valeur des data du brin", function(){
      brin1.data.description = null
      expect(brin1.description).to.equal('Description brin par défaut')
      let d = "Ma description du "+moment().format()
      brin1.description = d
      expect(brin1.data.description).to.equal(d)
      expect(brin1.description).to.equal(d)
    })
    it("marque le brin modifié si la description est modifiée", function(){
      brin1.modified = false
      expect(brin1.modified).to.be.false
      brin1.description = "Une nouvelle description."
      expect(brin1.modified).to.be.true
    })
  });
});
