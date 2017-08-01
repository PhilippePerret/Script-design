/*
  Feuille de test pour tester tout ce qui concerne le contenu du parag
*/
require('../../spec_helper.js')

describe('Contenu de Parag', function () {
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
      it("transforme les marques de formatage markdown (italique et graisse)", function(){
        parag1.contents = "Un texte *en italique* et **en gras**."
        parag1.formateContents()
        expect(parag1._contents_formated).to.equal('<p>Un texte <em>en italique</em> et <strong>en gras</strong>.</p>')
      })
      it("transforme les titres markdown dièse en mettant l'id", function(){
        parag1.contents = "# Ceci est un titre {#id-du-titre}"
        parag1.formateContents()
        expect(parag1._contents_formated).to.equal('<h1 id="id-du-titre">Ceci est un titre </h1>')
      })

      it("transforme les balises PARAG#xxx (avec un texte provisoire dans title)", function(){


        unloadParag(3)
        // Parag3 doit être "déchargé" pour être sûr que c'est le texte
        // provisoire qui sera mis à sa place. Noter que la méthode unloadParag
        // vérifie elle-même que le parag soit bien supprimé.

        panneauSynopsis.add(parag2)
        // Il faut que le parag ait un panneau pour qu'on sache où corriger
        // ensuite les liens qui ont été inscrits.

        let t = "Un lien vers PARAG#3 pour voir !"
        parag2.contents = t

        let texp = '<p>Un lien vers <a href="#" onclick="return showParag(3)" class=\"p-al p-3\" title=\"Chargement du parag #3 en cours…\">#3</a> pour voir !</p>'
        // Noter que ci-dessus le contenu "Chargement du contenu en cours" ne sera modifié que dans le
        // document et cela relève donc d'un test d'intégration ou de test unitaire plus profond.

        // ==========> TEST <==========
        parag2.formateContents()

        // ========== VÉRIFICATION ===========

        expect(parag2._contents_formated).to.equal(texp)

      })

      it("mais le texte est remplacé après un certain temps", function(){

        // ===== PRÉPARATION ========

        // On overclasse la méthode qui remplace les titles pour qu'elle
        // agisse plus tard, afin de voir les changements entre le texte
        // provisoire et le texte final. Dans le cas contraire, ça va trop
        // vite et on ne peut rien contrôler.
        Parag.prototype.realLoadAndReplaceFunction = Parag.prototype.loadAndReplaceTitleInLinks
        Parag.prototype.loadAndReplaceTitleInLinks = undefined
        Parag.prototype.loadAndReplaceTitleInLinks = function(pids)
        {
          const my = this
          setTimeout( () => {
            console.log("J'appelle loadAndReplaceTitleInLinks avec du RETARD")
            my.realLoadAndReplaceFunction.bind(my, pids).call()
          },500)
        }

        resetTests({nombre_parags:5})
        const contentsp4 = "Je suis le contenu du parag 4 pour voir."
        parag4.contents = contentsp4
        panneauNotes.add(parag4)
        panneauNotes.modified = true
        return projet.saveAll()
        .then( () => {


          parag2.contents = "Un lien vers le parag PARAG#4. Pour voir."

          return panneauScenier.PRactivate()
          .then( () => {

            panneauScenier.add(parag2)
            // Dans cette méthode, le div du parag2 va être construit, donc
            // il faut maintenant tout resetter pour pouvoir tester la
            // méthode de formatage.

            delete parag2.mainDiv
            parag2.reset()

            unloadParag(4)

            // ======== PRÉ-VÉRIFICATION ========

            expect(parag2._contents_formated).to.be.undefined
            expect('undefined' == typeof(parag4)).to.be.true

            // =======> TEST <========
            let textProv  = '<p>Un lien vers le parag <a href="#" onclick="return showParag(4)" class=\"p-al p-4\" title=\"Chargement du parag #4 en cours…\">#4</a>. Pour voir.</p>'
            let textFinal = '<p>Un lien vers le parag <a href="#" onclick="return showParag(4)" class=\"p-al p-4\" title=\"'+contentsp4+'\">#4</a>. Pour voir.</p>'

            parag2.formateContents()

            let codePanneauProv = parag2.panneau.container.outerHTML
            console.log("J'ai relevé le code du panneau provisoire")

            // Tout de suite, le contenu du title n'a pas pu être encore
            // calculé.
            expect(parag2._contents_formated).to.equal(textProv)

            // Tout de suite, dans le panneau, est marqué le texte normal
            // expect(codePanneauProv).to.include("Chargement du parag #4 en cours")
            // Note : ça ne fonctionne pas, c'est-à-dire que le texte est
            // tout de suite bon, comme si le panneau (donc le mainDiv du parag)
            // chargeait en se construisant le parag manquant.
            // Mais bon… on voit quand même le changement sur le
            // _contents_formated du parag.

            setTimeout( () => {

              console.log("Je teste _contents_formated")
              // Le texte final qu'on attend
              expect(parag2._contents_formated).to.equal(textFinal)

              console.log("Je teste le code du panneau final")
              // Le texte a été changé dans le panneau
              let codeFinal = parag2.panneau.container
              expect(parag2.panneau.container).to.haveTag('a', {'title': Parags.get(4).contentsSimple})
              expect(parag2.panneau.container.outerHTML).not.to.include("Chargement du parag #4 en cours")

            }, 1000)

          })

        }) // /fin du 'then' après le projet.saveAll

        console.log("J'arrive au bout du test")

      }) // fin du it

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
      before(function () {
        resetTest()
      });
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


    describe('@contentsSimple', function () {
      it("existe", function(){
        expect(parag0.contentsSimple).not.to.be.undefined
      })
      it("retourne le contenu sans les balises", function(){
        parag1._contents_formated = '<i>Bonjour tout le monde !</i>'
        delete parag1._contents_simple
        expect(parag1.contentsSimple).to.equal('Bonjour tout le monde !')
        parag2._contents_formated = '<b>Bonjour <a href="#pour-voir">tout</a> le <strong>monde</strong><br> !'
        delete parag2._contents_simple
        expect(parag2.contentsSimple).to.equal('Bonjour tout le monde !')
        parag3._contents_formated = "<a\n\thref=\"http://monadresse.net\"\n\n\tclass='lien'>Un lien sur plusieurs lignes\n\n</a>"
        delete parag3._contents_simple
        expect(parag3.contentsSimple).to.equal('Un lien sur plusieurs lignes')
      })
    }) // @contentsSimple

  })// /PROPERTIES
});
