/*
  Feuille de test pour tester tout ce qui concerne le contenu du parag
*/
require('../../spec_helper.js')

describe.only('Contenu de Parag', function () {
  describe('méthode', function () {


    describe('formateContents', function () {
      it("répond", function(){
        expect(parag0).to.respondsTo('formateContents')
      })
      it("transforme les liens markdown en liens HTML", function(){
        parag1.contents = "Un [lien vers l'atelier](http://www.atelier-icare.net) qui fonctionne."
        // ====> TEST <=======
        parag1.formateContents()
        // ========= VÉRIFICATION =========
        expect(parag1._contents_formated).to.equal("<p>Un <a href=\"http://www.atelier-icare.net\">lien vers l&#39;atelier</a> qui fonctionne.</p>")
        // expect(parag1.contents).
      })
      it("transforme les marques de formatage markdown", function(){
        parag1.contents = "Un texte *en italique* et **en gras**."
        parag1.formateContents()
        expect(parag1._contents_formated).to.equal('<p>Un texte <em>en italique</em> et <strong>en gras</strong>.</p>')
      })

      it("transforme les balises PARAG#xxx", function(done){
        let t = "Un lien vers PARAG#3 pour voir !"
        parag2.contents = t
        // ==========> TEST <==========
        parag2.formateContents()
        // ========== VÉRIFICATION ===========
        let val = parag2._contents_formated
        let texp = '<p>Un lien vers <a href="#" onclick="return showParag(3)" class=\"p-al\" title=\"Contenu du paragraphe #3\">#3</a> pour voir !</p>'
        // Pour détailler et voir le vrai caractère qui merde
        // for(var i = 0, len = texp.length ; i < len ; ++ i ){
        //   expect(val.substr(i,1), `Le caractère ${i}: '${val.substr(i,1)}'`).to.equal(texp.substr(i,1))
        // }
        expect(parag2._contents_formated).to.equal(texp)
        done()
      })

    }) // #formatContents

  }) // /MÉTHODES


  /** ---------------------------------------------------------------------
    *
    *   PROPERTIES
    *
  *** --------------------------------------------------------------------- */

  describe('Property', function () {

    describe('@contents', function () {
      it("exist", function(){
        expect(parag0.contents).to.not.be.undefined
      })
      it("retourne le contenu du parag s'il est défini", function(){
        let t = "Le contenu du Parag#2 pour voir."
        parag2._contents = t
        expect(parag2.contents).to.equal(t)
      })
      it("retourne undefined si le contenu du parag n'est pas défini", function(){
        delete parag2._contents
        expect(parag2.contents).to.be.undefined
      })
    })// @contents


    describe('@ucontents', function () {
      it("existe", function(){
        expect(parag0.ucontents).to.not.be.undefined
      })
      it("appeler le setter de cette méthode avec de l'unicode définit le @contents humain", function(){
        parag7._contents = ''
        expect(parag7.contents).to.equal('')
        let t = "ça c’est « l’été »".toUnicode()
        parag7.ucontents = `              ${t}`
        expect(parag7.contents).to.equal('ça c’est « l’été »')
      })
      it("appeler le getter de cette méthode transforme le @contents en @ucontents", function(){
        let t = 'Ça c’est vraiment l’été !'
        parag8._contents = t
        let ut = parag8._contents.toUnicode()
        expect(parag8.ucontents).to.equal(ut)
        expect(t.toUnicode()).to.equal(ut)
      })
    }) // @ucontents


    describe('@contentsFormated', function () {
      it("existe", function(){
        expect(parag0.contentsFormated).to.not.be.undefined
      })
    }) // @contentsFormated


    describe('@contentsFormatedSansTags', function () {
      it("existe", function(){
        expect(parag0.contentsFormatedSansTags).not.to.be.undefined
      })
      it("retourne le contenu sans les balises", function(){
        parag1._contents_formated = '<i>Bonjour tout le monde !</i>'
        delete parag1._formcontsanstags
        expect(parag1.contentsFormatedSansTags).to.equal('Bonjour tout le monde !')
        parag2._contents_formated = '<b>Bonjour <a href="#pour-voir">tout</a> le <strong>monde</strong><br> !'
        delete parag2._formcontsanstags
        expect(parag2.contentsFormatedSansTags).to.equal('Bonjour tout le monde !')
        parag3._contents_formated = "<a\n\thref=\"http://monadresse.net\"\n\n\tclass='lien'>Un lien sur plusieurs lignes\n\n</a>"
        delete parag3._formcontsanstags
        expect(parag3.contentsFormatedSansTags).to.equal('Un lien sur plusieurs lignes')
      })
    }) // @contentsFormatedSansTags

  })// /PROPERTIES
});
