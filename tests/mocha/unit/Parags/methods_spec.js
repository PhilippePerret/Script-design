
describe('Parags', function () {
  describe('#map', function () {
    it("répond", function(){
      expect(panneauNotes.parags).to.respondsTo('map')
    })
    it("retourne la liste des résultats", function(){
      resetTests({nombre_parags: 30})
      panneauNotes.parags.add([parag12, parag2, parag22])
      res = panneauNotes.parags.map( p => { return p.id } )
      expect(res).to.deep.equal( [12, 2, 22] )
    })
  })

  describe('#forEach', function () {
    it("répond", function(){
      expect(panneauNotes.parags).to.respondsTo('forEach')
    })

    it("exécute une opération sur chaque parag", function(){
      resetTests({nombre_parags: 30})

      panneauScenier.parags.add([parag3, parag13, parag23])
      panneauScenier.parags.forEach( p => { p.indice_francais = p.id })

      expect(parag3.indice_francais).to.equal(3)
      expect(parag13.indice_francais).to.equal(13)
      expect(parag23.indice_francais).to.equal(23)

    })
  })
});
