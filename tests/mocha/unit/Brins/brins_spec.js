/*

  Test de la class Brins

*/
require('../../spec_helper.js')




function le_nombre_de_brins_doit_etre (nb)
{
  expect(Brins.items.size).to.equal(nb)
}



resetBrins()


describe('Brins', function () {
  it("existe", function(){
    expect('undefined' === typeof(Brins)).to.be.false
    expect(typeof Brins).to.equal('function')
  })

  describe('Projet#brins', function () {
    it("répond", function(){
      expect(projet.brins).not.to.be.undefined
    })
    it("est une instance 'Brins'", function(){
      expect(projet.brins.constructor.name).to.equal('Brins')
    })
    it("répond à la méthode `add`", function(){
      expect(projet.brins).to.respondsTo('add')
    })
  });

  describe('Brins#reset()', function () {
    it("répond", function(){
      expect(brins).to.respondsTo('reset')
    })
    it("initialise Brins.items", function(){
      Brins._items = undefined
      expect(Brins._items).to.be.undefined
      brins.reset()
      expect(Brins._items).to.be.instanceOf(Map)
    })
    it("initialize _panneau", function(){
      brins.panneau
      expect(brins._panneau).to.be.instanceOf(HTMLElement)
      brins.reset()
      expect(brins._panneau).to.be.undefined
    })
    it("initialize _form", function(){
      brins.form
      expect(brins._form).to.be.instanceOf(HTMLElement)
      brins.reset()
      expect(brins._form).to.be.undefined
    })
  });

  describe('Brins@modified', function () {
    it("existe", function(){
      expect(brins.modified).not.to.be.undefined
    })
    it("marque le projet modifié quand on marque les brins modifiés", function(){
      brins.projet._modified = false
      expect(brins.projet.modified).to.be.false
      brins.modified = true
      expect(brins.projet.modified).to.be.true
    })
    it("ne marque pas le projet non modifié quand on marque les brins non modifiés", function(){
      projet._modified = true
      expect(projet.modified).to.be.true
      brins.modified = false
      expect(projet.modified).to.be.true
    })
  });

  describe('<#projet>.brins.PRload (Brins#PRload)', function () {
    it("répond", function(){
      expect(projet.brins).to.respondsTo('PRload')
    })
    it("charge les brins s'ils existent", function(){

      resetProjetWithBrins()

      .then( () => {
        resetBrins()
        Brins._items = undefined
        le_nombre_de_brins_doit_etre( 0 )
        return Promise.resolve()
      })

      // =========> T E S T <========

      .then( projet.brins.PRload.bind(projet.brins) )

      .then( () => {
        expect(Brins.items.size).to.be.at.least(1)
        expect(Brins.get(1)).to.be.instanceOf(Brin)
      })

    })
    it("ne charge rien sans produire d'erreur s'il n'y a pas de fichier brins", function(){
      resetBrins()
      let pth = projet.brins.store.path
      if(fs.existsSync(pth)){fs.unlinkSync(pth)}
      return projet.brins.PRload()
      .then( () => {
        le_nombre_de_brins_doit_etre(0)
      })
    })
  });

  describe('au chargement complet du projet…', function () {
    it("la liste des brins est établie", function(){
      resetProjetWithBrins()
      .then( () => {
        Brins._items = undefined
        const projet_id = projet.id
        projet = new Projet(projet)
        Projet.current = projet
        return Promise.resolve()
      })
      .then(projet.PRload())
      .then( () => {
        expect(Brins.items.size).to.be.at.least(1)
      })
    })
  });

  describe('<#projet>.brins.add', function () {
    it("répond", function(){
      expect(projet.brins).to.respondsTo('add')
    })
    it("permet d'ajouter un brin au projet", function(){
      resetBrins()
      Brins._items = undefined // on doit le refaire après l'instanciation
      expect(Brins.get(1)).to.be.undefined
      projet.brins.add(brin1)
      expect(Brins.get(1)).to.be.instanceOf(Brin)
    })
    it("ajoute le brin au panneau brins (qu'il soit ouvert ou non)", function(){
      this.skip()
    })
  })


  describe('<#projet>.brins.remove', function () {
    it("répond", function(){
      expect(projet.brins).to.respondsTo('remove')
    })
    it("produit une erreur si aucun ID n'est fourni", function(){
      expect(()=>{projet.brins.remove()}).to.throw("Il faut fournir l'ID du brin ou le brin à détruire.")
    })
    it("ne produit pas d'erreur avec un ID valide", function(){
      resetBrins()
      expect(() => {projet.brins.remove(1)}).not.to.throw()
    })
    it("produit une erreur avec un ID invalide", function(){
      resetBrins()
      projet.brins.remove(1) // on le retire
      expect(() => {projet.brins.remove(1)}).to.throw("Le brin #1 est inconnu au projet.")
    })
    it("ne produit pas d'erreur avec un Brin", function(){
      resetBrins()
      expect(() => {projet.brins.remove(brin1)}).not.to.throw()
    })
    describe('La suppression…', function () {
      it("détruit le brin spécifié de Brins.items", function(){
        resetBrins()
        projet.brins.remove(1)
        expect(Brins.get(1)).to.be.undefined
      })
      it("retire le brin de tous ses parags", function(){
        resetProjetWithBrins()
        .then( () => {
          /*
            resetProjetWithBrins()
            ----------------------
            On vérifie que le parag #1 soit dans le brin #2 (dans les 2 sens)
            On vérifie que le parag #5 soit dans le brin #2 (dans les 2 sens)
            On supprime le brin #2
            => Il ne doit plus être dans parag #1
            => Il ne doit plus être dans parag #5
            Mais
            parag #1 doit encore avec le brin #0

           */
          // ======= PRÉ-VÉRIFICATIONS =======
          expect(parag1.brin_ids).to.include(2)
          expect(brin2.parag_ids).to.include(1)
          expect(parag5.brin_ids).to.include(2)
          expect(brin2.parag_ids).to.include(5)
          expect(parag1.brin_ids).to.include(0)
          expect(parag1.modified).to.be.false
          expect(parag5.modified).to.be.false

          // ========> TEST <=========
          projet.brins.remove(2)

          // ========= CONTROLE ==========
          expect(parag1.brin_ids).not.to.include(2)
          expect(parag5.brin_ids).not.to.include(2)
          expect(parag1.brin_ids).to.include(0)
          expect(parag1.modified).to.be.true
          expect(parag5.modified).to.be.true
        })
      })
      it("supprime le brin du panneau des brins (qu'il soit fermé ou non)", function(){
        this.skip()
      })
    });
  });


  /** ---------------------------------------------------------------------
    *
    *   TEST DES MÉTHODES D'HELPER
    *
  *** --------------------------------------------------------------------- */

  describe('Méthodes d’helper', function () {

    describe('panneau', function () {
      it("existe", function(){
        expect(brins.panneau).to.not.be.undefined
      })
      it("retourne un HTMLSectionElement", function(){
        expect(brins.panneau).to.be.instanceOf(HTMLElement)
      })
      it("avec les attributs voulus", function(){
        expect(brins.panneau).to.haveTag('section', {id:'panneau_brins'})
      })
      it("contient tous les brins du projet", function(){
        resetBrins()
        expect(Brins.items.size).to.be.at.least(3)
        Brins.items.forEach( (brin, bid) => {
          expect(brins.panneau).to.haveTag('div', {class:'brin', id:`brin-${bid}`})
        })
      })
      it("tous les brins sont bien formatés", function(){
        resetBrins()
        let o = brins.panneau
        expect(o).to.haveTag('div', {id:'brin-1'})
        o = o.querySelector('div#brin-1')
        expect(o).to.haveTag('div', {class:'titre', id:'brin-1-titre'})
        expect(o).to.haveTag('div', {class:'children', id:'brin-1-children'})
      })
      it("rassemble les brins parents et enfants", function(){
        resetBrins()
        brin.data.id  = 0
        brin1.data.id = 1
        brin2.data.id = 2
        brin.parent = brin1
        brin2.parent = brin1

        brins._panneau = undefined // forcer sa reconstruction

        expect(brins.panneau).to.haveTag('div',{id:'brin-1'})
        let o = brins.panneau.querySelector('div#brin-1')
        expect(o).to.haveTag('div', {class:'children', id:'brin-1-children'})
        o = o.querySelector('div.children')
        // Les deux brins enfants sont dans les enfants.
        expect(o).to.haveTag('div', {id:'brin-0'})
        expect(o).to.haveTag('div', {id:'brin-2'})

      })
    });

    describe('showPanneau', function () {
      it("répond", function(){
        expect(brins).to.respondsTo('showPanneau')
      })
      it("affiche le panneau brins dans le panneau", function(){
        resetBrins()
        resetTests()
        expect(panneauNotes.section).not.to.haveTag('section', {id:'panneau_brins'})
        return panneauNotes.PRactivate()
        .then( () => {
          brins.showPanneau()
          expect(panneauNotes.section).to.haveTag('section', {id:'panneau_brins'})
        })
      })
    });

    describe('hidePanneau', function () {
      it("répond", function(){
        expect(brins).to.respondsTo('hidePanneau')
      })
      it("masque le panneau", function(){
        brins.showPanneau()
        expect(panneauNotes.section).to.haveTag('section', {id:'panneau_brins'})
        brins.hidePanneau()
        expect(panneauNotes.section).to.haveTag('section', {id:'panneau_brins', 'style':'display:none'})
      })
    });



    describe('form', function () {
      it("existe", function(){
        expect(brins.form).to.not.be.undefined
      })
      it("retourne un HTMLSectionElement", function(){
        expect(brins.form).to.be.instanceOf(HTMLElement)
      })
      it("contient un formulaire avec les bons éléments", function(){
        let f = brins.form
        expect(f)
          .to.haveTag('span', {'data-tab':"titre", class:"editable"})
          .and.haveTag('span', {'data-tab':"description", class:"editable"})
          .and.haveTag('span', {'data-tab':"parent_id", class:"editable"})
      })
    });

    describe('showForm', function () {
      it("répond", function(){
        expect(brins).to.respondsTo('showForm')
      })
    });

    describe('hideForm', function () {
      it("répond", function(){
        expect(brins).to.respondsTo('hideForm')
      })
      it("masque le formulaire", function(){
        return panneauScenier.PRactivate()
        .then( () => {
          brins.showForm()
          expect(panneauScenier.section).not.to.haveTag('section', {id:'form_brins', style:'display:none'})
          brins.hideForm()
          expect(panneauScenier.section).to.haveTag('section', {id:'form_brins', style:'display:none'})
        })
      })
    });


  });
});
