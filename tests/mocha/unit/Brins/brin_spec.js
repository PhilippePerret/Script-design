/*

  Test des instances {Brin}

*/
require('../../spec_helper.js')

let brin, brin1, brin2
let brins = projet.brins

function resetBrins ()
{
  Brins._items = new Map()
  brins._panneau = undefined // forcer la reconstruction

  brin  = new Brin({id: 0, projet: projet, titre: "Brin sans titre"})
  brin1 = new Brin({id: 1, projet: projet, titre: "Brin #1"})
  brin2 = new Brin({id: 2, projet: projet, titre: "Brin #2"})
}

resetBrins()

describe('Brin', function () {
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

  describe('Brin.TYPES', function () {
    it("existe et retourne une Map", function(){
      expect(Brin.TYPES).not.to.be.undefined
      expect(Brin.TYPES).to.be.instanceOf(Map)
    })
  });

  describe('Brin@menu_types', function () {
    it("existe", function(){
      expect(Brin.menu_types).not.to.be.undefined
    })
    it("est de type HTMLElement", function(){
      expect(Brin.menu_types).to.be.instanceOf(HTMLElement)
    })
    it("contient tous les types définis", function(){
      expect(Brin.menu_types.querySelectorAll('option').length).to.equal(Brin.TYPES.size)
      Brin.TYPES.forEach( (dType, typeId) => {
        expect(Brin.menu_types).to.haveTag('option', {value: String(typeId)})
      })
    })
  });
  describe('Brin::buildMenuTypes', function () {
    // Ça, ça génère bizarrement une erreur… Alors que la méthode est
    // employée avec succès juste en dessous…
    // it("répond", function(){
    //   expect(Brin).to.respondsTo('buildMenuTypes')
    // })
    it("construit le menu des types", function(){
      Brin._menu_types = undefined
      Brin.buildMenuTypes()
      expect(Brin._menu_types).not.to.be.undefined
      expect(Brin._menu_types).to.be.instanceOf(HTMLElement)
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

  describe('@titre', function () {
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


  describe('@description', function () {
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


  describe('@parag_ids', function () {
    it("existe", function(){
      expect(brin1.parag_ids).not.to.be.undefined
    })
    it("est de classe Array", function(){
      expect(brin1.parag_ids).to.be.instanceOf(Array)
    })
    it("contient la liste des IDs de parag", function(){
      resetBrins()
      expect(brin1.parag_ids).to.be.empty
      brin1.addParag(0); brin1.addParag(4)
      expect(brin1.parag_ids).to.deep.equal([0,4])
    })
  });

  describe('@parent_id', function () {
    before(function () {
      brin1.data.parent_id = 2
    });
    after(function () {
      brin1.data.parent_id = undefined
    });
    it("existe", function(){
      expect(brin1.parent_id).not.to.be.undefined
    })
    it("retourne l'ID du brin parent s'il est défini", function(){
      expect(brin1.parent_id).to.equal(2)
    })
    it("retourne undefined s'il n'y a pas de brin parent", function(){
      brin = new Brin({id: 14})
      expect(brin.parent_id).to.be.undefined
    })
  });

  describe('#parent= ', function () {
    it("permet de définir le parent si l'argument est un brin", function(){
      brin1.parent = undefined
      expect(brin1.parent_id).to.be.undefined
      brin1.parent = brin2
      expect(brin1.parent_id).to.equal(2)
    })
    it("permet de définir le parent si l'argument est un ID", function(){
      brin1.parent = undefined
      expect(brin1.parent_id).to.be.undefined
      brin1.parent = 2
      expect(brin1.parent_id).to.equal(2)
      expect(brin1.parent).to.be.instanceOf(Brin)
    })
    it("permet de retirer le parent si l'argument est null ou undefined", function(){
      brin1.parent = brin2
      expect(brin1.parent_id).to.equal(2)
      brin1.parent = null
      expect(brin1.parent_id).to.be.undefined
      brin1.parent = brin2
      expect(brin1.parent_id).to.equal(2)
      brin1.parent = undefined
      expect(brin1.parent_id).to.be.undefined
    })
    it("définit le brin comme modifié", function(){
      brin1.modified = false
      expect(brin1.modified).to.be.false
      brin1.parent = brin2
      expect(brin1.parent_id).to.equal(2)
      expect(brin1.modified).to.be.true

      brin1.modified = false
      expect(brin1.modified).to.be.false
      brin1.parent = null
      expect(brin1.parent_id).to.be.undefined
      expect(brin1.modified).to.be.true

    })
  });

  describe('@parent', function () {
    before(function () {
      brin2 = new Brin({id:2, titre:"Brin 2"})
      brin1.data.parent_id = 2
    });
    after(function () {
      brin1.data.parent_id = undefined
    });
    it("existe", function(){
      expect(brin1.parent).not.to.be.undefined
    })
    it("retourne undefined si le brin n'a pas de parent", function(){
      brin = new Brin({id: 12})
      expect(brin.parent).to.be.undefined
    })
    it("retourne l'instance du parent si le brin a un parent", function(){
      let p = brin1.parent
      expect(p).to.not.be.undefined
      expect(p).to.be.instanceOf(Brin)
      expect(p.id).to.equal(2)
    })
  });

  describe('@type', function () {
    it("existe", function(){
      expect(brin.type).not.to.be.undefined
    })
    it("retourne le type_id s'il est défini", function(){
      brin.data.type = 12
      expect(brin.type).to.equal(12)
    })
    it("retourne 0 s'il n'est pas défini", function(){
      brin.data.type = undefined
      expect(brin.type).to.equal(0)
    })
  });

  describe('@type=', function () {
    it("permet de définir le type", function(){
      brin.data.type = undefined
      brin.type = 4
      expect(brin.data.type).to.equal(4)
    })
    it("marque le brin modifié", function(){
      brin.modified = false
      brin.type = 2
      expect(brin.modified).to.be.true
    })
  });

  /** ---------------------------------------------------------------------
    *
    *   MÉTHODES DE DATA
    *
  *** --------------------------------------------------------------------- */
  describe.only('#update', function () {
    it("répond", function(){
      expect(brin).to.respondsTo('update')
    })
  });
  /** ---------------------------------------------------------------------
    *
    *   PROPRIÉTÉS DE DOM
    *
  *** --------------------------------------------------------------------- */

  describe('div', function () {
    it("existe", function(){
      expect(brin.div).not.to.be.undefined
    })
    it("retourne un HTMLElement", function(){
      expect(brin.div).to.be.instanceOf(HTMLDivElement)
    })
    it("contient tous les éléments", function(){
      brin.data.id = 0
      brin._div = undefined
      expect(brin.div).to.haveTag('div', {class:'titre', id:'brin-0-titre'})
      expect(brin.div).to.haveTag('div', {class:'children', id:'brin-0-children'})
    })
  });

  describe('divChildren', function () {
    it("existe", function(){
      expect(brin.divChildren).not.to.be.undefined
    })
    it("retourne un HTMLElement", function(){
      expect(brin.divChildren).to.be.instanceOf(HTMLDivElement)
    })
  });
  /** ---------------------------------------------------------------------
    *
    *     TEST DES MÉTHODES D'HELPER
    *
  *** --------------------------------------------------------------------- */

  describe('Méthode d’helper', function () {

    describe('build', function () {
      it("répond", function(){
        expect(brin).to.respondsTo('build')
      })
      it("définit _div", function(){
        brin._div = undefined
        brin.build()
        expect(brin._div).not.to.be.undefined
      })
    });
  });


  /** ---------------------------------------------------------------------
    *
    *     MÉTHODES D'INSTANCE
    *
  *** --------------------------------------------------------------------- */

  describe('Brin#addParag', function () {
    it("répond", function(){
      expect(brin1).to.respondsTo('addParag')
    })
    it("produit une erreur sans argument", function(){
      expect(()=>{brin1.addParag()}).to.throw("Il faut fournir le parag (ou son ID) à ajouter au brin.")
    })
    it("produit une erreur sir l'argument n'est pas un parag ou un nombre", function(){
      let arr = [null, undefined, ['une','liste'], {un:'object'}, true]
      arr.forEach( (bad) => {
        expect(()=>{brin1.addParag(bad)}).to.throw("Il faut fournir le parag (ou son ID) à ajouter au brin.")
      })
    })
    it("ajoute le parag au brin si un parag est fourni", function(){
      expect(()=>{brin1.addParag(parag4)}).not.to.throw()
      expect(brin1.parag_ids.indexOf(4)).to.be.at.least(0)
    })
    it("ajoute le parag au brin si un ID valide est fourni", function(){
      expect(()=>{brin1.addParag(12)}).not.to.throw()
      expect(brin1.parag_ids.indexOf(12)).to.be.at.least(0)
    })
    it("n'ajoute pas le parag au brin s'il le possède déjà", function(){
      resetBrins()
      brin1.data.parag_ids = [1,2,3]
      parag2._brin_ids = [5,3,2, 1] // c'est ça qui empêche l'ajout
      expect(brin1.data.parag_ids).to.deep.equal([1,2,3])
      expect(brin1.parag_ids).to.deep.equal([1,2,3])
      brin1.addParag(2)
      expect(brin1.data.parag_ids).to.deep.equal([1,2,3])
      expect(brin1.parag_ids).to.deep.equal([1,2,3])
    })
    it("ajoute le brin au parag", function(){
      resetBrins()
      parag5._brin_ids      = undefined
      brin1.data.parag_ids  = undefined

      // ======> TEST <=========

      brin1.addParag(parag5)

      // ======== VÉRIFICATION ==========

      expect(brin1.parag_ids).to.include(5)
      expect(parag5.brin_ids).to.include(1)

    })
    it("n'ajoute pas le brin au parag s'il est déjà connu", function(){
      resetBrins()
      parag4.brin_ids = [3,2,1]
      expect(parag4.brin_ids).to.deep.equal([3,2,1])
      brin1.addParag(parag4)
      expect(parag4.brin_ids).not.to.deep.equal([3,2,1,1])
      expect(parag4.brin_ids).to.deep.equal([3,2,1])
    })
    it("indique que le brin est modifié", function(){
      brin._modified = false
      expect(brin.modified).to.be.false
      brin.addParag(1)
      expect(brin.modified).to.be.true
    })
    it("indique que les brins sont modifiés", function(){
      projet.brins._modified = false
      expect(projet.brins.modified).to.be.false
      brin.addParag(2)
      expect(projet.brins.modified).to.be.true
    })
    it("indique que le parag est modifié", function(){
      parag3._modified = false
      expect(parag3.modified).to.be.false
      brin1.addParag(3)
      expect(parag3.modified).to.be.true
    })
    it("indique que le projet est modifié", function(){
      resetBrins()
      parag0._brin_ids = undefined
      projet._modified = false
      expect(projet.modified).to.be.false
      brin1.addParag(0)
      expect(projet.modified).to.be.true
    })
  });


  describe('Brin#removeParag', function () {
    before(function () {
      resetTests()
    });
    beforeEach(function () {
      // ======= PRÉPARATION =======
      resetBrins()
      parag0._brin_ids = undefined
      brin1.addParag(parag0)
      brin1.modified = false
      parag0.modified = false
      projet.brins.modified = false
      projet.modified = false
      // ======== PRÉ-VÉRIFICATION ===========
      expect(brin1.parag_ids).to.include(0)
      expect(parag0.brin_ids).to.include(1)
    });
    it("répond", function(){
      expect(brin).to.respondsTo('removeParag')
    })
    it("retire le parag de la liste des parags du brin", function(){
      // =======> TEST <==========
      brin1.removeParag(0)
      // ======== CONTROLE =======
      expect(brin1.parag_ids).not.to.include(0)
      expect(parag0.brin_ids).not.to.include(1)

    })
    it("indique que le brin est modifié", function(){
      expect(brin1.modified).to.be.false
      brin1.removeParag(0)
      expect(brin1.modified).to.be.true
    })
    it("indique que les brins sont modifiés", function(){
      expect(projet.brins.modified).to.be.false
      brin1.removeParag(0)
      expect(projet.brins.modified).to.be.true
    })
    it("indique que le parag est modifié", function(){
      expect(parag0.modified).to.be.false
      brin1.removeParag(0)
      expect(parag0.modified).to.be.true
    })
    it("indique que le projet est modifié", function(){
      expect(projet.modified).to.be.false
      brin1.removeParag(0)
      expect(projet.modified).to.be.true
    })
    it("ne retire rien si le parag n'appartient pas au brin et ne marque rien modifié", function(){
      expect(brin1.parag_ids).to.deep.equal([0])
      expect(brin1.modified).to.be.false
      brin1.removeParag(1)
      expect(brin1.parag_ids).to.deep.equal([0])
      expect(brin1.modified).to.be.false
    })
  });


  describe('Brin@modified', function () {
    it("existe", function(){
      expect(brin.modified).not.to.be.undefined
    })
    it("indique que les brins sont modifiés quand on modifie le brin", function(){
      projet.brins._modified = false
      expect(projet.brins.modified).to.be.false
      brin.modified = true
      expect(projet.brins.modified).to.be.true
    })
    it("indique le projet est modifié quand on modifie le brin (par brins)", function(){
      projet._modified = false
      expect(projet.modified).to.be.false
      brin.modified = true
      expect(projet.modified).to.be.true
    })
    it("n'indique pas que le projet est modifié quand on marque le brin non modifié", function(){
      projet._modified = true
      expect(projet.modified).to.be.true
      brin.modified = false
      expect(projet.modified).to.be.true
    })
    it("n'indique pas que les brins ne sont pas modifiés quand on marque le brin non modifié", function(){
      projet.brins._modified = true
      expect(projet.brins.modified).to.be.true
      brin.modified = false
      expect(projet.brins.modified).to.be.true
    })
  });
});
