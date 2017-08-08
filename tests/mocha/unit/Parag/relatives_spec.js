/*
  TEST DES RELATIVES
*/
require('../../spec_helper.js')

let parag = parag0
let newParag

/** ---------------------------------------------------------------------
  *
  * M É T H O D E S   P R A T I Q U E S
  *
*** --------------------------------------------------------------------- */
function getRelatives () {
  return currentProjet.relatives.data.relatives
}

function idsInRelatives       ()      { return Object.keys(getRelatives()) }
function nombreRelatives      ()      { return idsInRelatives().length     }
function getRelativesByIndex  (index) { return getRelativesById( idsInRelatives()[index] ) }
function getRelativesById     (rid)   { return getRelatives()[String(rid)] }

/** ---------------------------------------------------------------------
  *
  *   T E S T S
  *
*** --------------------------------------------------------------------- */
describe.only('Relatives/Synchronisation', function () {
  describe('Projet#relatives', function () {
    it("existe", function(){
      expect(currentProjet.relatives).not.to.be.undefined
    })
    it("est un objet Relatives", function(){
      expect(currentProjet.relatives).to.be.instanceOf(Relatives)
    })
  });
  // TODO Un nouveau parag crée automatiquement une donnée relative vierge
  describe('la création d’un nouveau parag', function () {
    before(function () {
      resetTests({nombre_parags:0})
      return panneauNotes.PRactivate()
    });
    it("crée donnée relative pour ce nouveau parag", function(){
      let drels = currentProjet.relatives.data.relatives
      // ========== PRÉ-VÉRIFICATION ===========
      expect(nombreRelatives()).to.equal(0)

      // ==========> TEST <============
      let newP = currentPanneau.parags.createNewParag({contents: "Un tout nouveau paragraphe."})

      // ============ CONTROLES ===============
      expect(nombreRelatives()).to.equal(1)
      let rel = getRelativesByIndex(0)
      expect(rel).not.to.be.undefined
      expect(rel.i).to.equal(0)
      expect(rel.t).to.equal('n')
      expect(rel.r).to.be.deep.equal({})
    })
    it("indique que le projet est modifié", function(){
      expect(currentProjet.modified).to.be.true
    })
  });


  /** ---------------------------------------------------------------------
    *
    *   Les méthodes de Parag
    *
  *** --------------------------------------------------------------------- */
  describe('Méthodes parag', function () {
    describe('hasRelatif, hasRelative isRelativeOf', function () {
      before(function () {
        resetTests({nombre_parags: 3})
        panneauNotes.add(parag0)
        panneauScenier.add(parag1)
        panneauTreatment.add(parag2)
        projet.relatives.associate([parag0, parag2])
      });
      it("répond", function(){
        expect(parag0).to.respondsTo('hasRelatif')
        expect(parag0).to.respondsTo('hasRelative')
        expect(parag0).to.respondsTo('isRelativeOf')
      })
      it("retourne false si le parag n'est pas en relation avec l'argument", function(){
        expect(parag0.hasRelatif(parag1)).to.be.false
        expect(parag0.hasRelative(parag1)).to.be.false
        expect(parag0.isRelativeOf(parag1)).to.be.false
      })
      it("retourne true si le parag est en relation avec l'argument", function(){
        expect(parag0.hasRelatif(parag2)).to.be.true
        expect(parag0.hasRelative(parag2)).to.be.true
        expect(parag0.isRelativeOf(parag2)).to.be.true
      })
      it("fonctionne avec l'identifiant au lieu de l'instance", function(){
        expect(()=>{parag0.hasRelatif(1)}).not.to.throw()
        expect(parag0.hasRelatif(1)).to.be.false
        expect(parag0.hasRelatif(2)).to.be.true
        expect(()=>{parag0.hasRelative(1)}).not.to.throw()
        expect(parag0.hasRelative(1)).to.be.false
        expect(parag0.hasRelative(2)).to.be.true
        expect(()=>{parag0.isRelativeOf(1)}).not.to.throw()
        expect(parag0.isRelativeOf(1)).to.be.false
        expect(parag0.isRelativeOf(2)).to.be.true
      })
    });

    describe('relatives', function () {
      before(function () {
        resetTests({nombre_parags: 20})
        panneauNotes.add(parag0)
        panneauScenier.add([parag1, parag2, parag3])
        panneauTreatment.add([parag4, parag5])
        panneauManuscrit.add(parag6)

        projet.relatives.data.relatives['0'] = {'i': 0, 't':'n', 'r': {'s':[1,2,3], 't':[4,5], 'm':[6]}}

        // console.log("projet.relatives = ", projet.relatives)
      });
      it("existe", function(){
        expect(parag0.relatives).not.to.be.undefined
      })
      it("est une map", function(){
        expect(parag0.relatives).to.be.instanceOf(Map)
      })
      it("contient tous les parags en relation", function(){
        expect(parag0.relatives.size).to.equal(6)
        for(let i = 1; i < 7; ++i){
          expect(parag0.relatives.get(Number(i))).to.be.instanceOf(Parag)
        }
      })
    });

    describe('relatifs', function () {
      before(function () {
        resetTests({nombre_parags: 20})
        panneauNotes.add(parag0)
        panneauScenier.add([parag1, parag2, parag3])
        panneauTreatment.add([parag4, parag5])
        panneauManuscrit.add(parag6)

        projet.relatives.data.relatives['0'] = {'i': 0, 't':'n', 'r': {'s':[1,2,3], 't':[4,5], 'm':[6]}}

        // console.log("projet.relatives = ", projet.relatives)
      });
      it("existe", function(){
        expect(parag0.relatifs).not.to.be.undefined
      })
      it("contient les clés 'as_referent' et 'as_relatif'", function(){
        parag0._relatifs = undefined
        res = parag0.relatifs
        expect(res.as_referent).not.to.be.undefined
        expect(res.as_relatifs).not.to.be.undefined
      })
      it("définit bien les cas où le parag est référent", function(){
        let arr = parag0.relatifs.as_relatifs.map(p => {return p.id})
        expect(arr).to.include(1)
        expect(arr).to.include(2)
        expect(arr).to.include(4)
        expect(arr).to.deep.equal([1,2,3,4,5])
      })
      it("définit bien les cas où le parag est relatif", function(){
        let arr = parag0.relatifs.as_referent.map(p => {return p.id})
        expect(arr).to.include(6)
        expect(arr).to.deep.equal([6])
      })
    });

    describe('data_relatives', function () {
      it("existe", function(){
        expect(parag0.data_relatives).not.to.be.undefined
      })
    });

  });




  // TODO La synchronisation de deux parags les… synchronise
  describe('La synchronisation de deux parags existants', function () {
    before(function () {
      resetTests({nombre_parags: 2})
      panneauNotes.add(parag0)
      panneauScenier.add(parag1)
      return panneauNotes.PRactivate()
      .then( () => {
        // =========> TESTS <===========
        currentProjet.relatives.associate([parag0, parag1])
      })

    });
    it("crée une donnée relative dans leur deux relatifs", function(){
      const rel0 = getRelativesById(0)['r']['s']
      const rel1 = getRelativesById(1)['r']['n']
      expect(rel0).to.include(1)
      expect(rel1).to.include(0)
    })
    it("les deux parags sont marqués associés", function(){
      expect(currentProjet.relatives.areRelatifs(parag0, parag1)).to.be.true
    })
  });

  describe('Synchronisation automatique', function () {
    before(function () {
      resetTests({nombre_parags: 0})
      return panneauNotes.PRactivate()
      .then( () => {
        // =========> TESTS <===========
        panneauScenier.parags.createNewParag(
            {contents: "contenu du premier"}
          , {synchronize: true}
        )
      })
    });
    describe('ne crée rien à la création du parag (le texte doit être enregistré)', function () {
      it("ne crée rien de plus que le premier parag", function(){
        expect(Parags.count()).to.equal(1)
      })
    });
    describe('lorsqu’elle est enclenchée', function () {
      before(function () {

        // ======= PRÉPARATION ==========
        resetTests({nombre_parags: 0})
        projet.option('autosave', false)
        projet.option('autosync', true)
        // Noter qu'on met ça pour être en cohérence complète avec l'état
        // du projet, mais qu'en réalité c'est l'option `synchronize` envoyée
        // à la création du parag qui détermine qu'il faut le synchroniser.

        // ======== PRÉ-VÉRIFICATIONS ===========
        expect(projet.option('autosync')).to.be.true
        expect(Parags.count()).to.equal(0)
        Projet.PANNEAUX_SYNC.forEach(p => {
          expect(projet.panneau(p).parags.count).to.equal(0)
        })

        return panneauScenier.PRactivate()
        .then( () => {
          let dataParag = {
              contents: "Un paragraphe synchronisé pour le panneau scénier"
            , duration : 180
          }
          // ============ TEST ==============
          newParag = panneauScenier.parags.createNewParag(dataParag, {synchronize: true})
          newParag.newContents = "Un paragraphe synchronisé pour le panneau scénier"
          return newParag.onChangeContents()
        })
      });
      it("le parag créé a l'identifiant #0", function(){
        expect(newParag.id).to.equal(0)
      })
      it("le parag créé a le bon contenu", function(){
        // Ce test est inutile, mais j'ai eu des problèmes ici
        expect(newParag.contents).to.equal("Un paragraphe synchronisé pour le panneau scénier")
      })
      it("elle crée autant de parags que de panneaux", function(){
        expect(Parags.count()).to.equal(Projet.PANNEAUX_SYNC.length)
      })
      it("crée un parag dans chaque panneau synchronisable", function(){
        Projet.PANNEAUX_SYNC.forEach(panid => {
          // console.log("IDs des parags dans le panneau '%s' : %s", panid, projet.panneau(panid).parags._ids)
          expect(projet.panneau(panid).parags.count, `Aurait dû créer un parag dans le panneau '${panid}'`).to.equal(1)
        })
      })
      it("elle relie tous les parags par les relatives", function(){
        let par, prels, arr_relatifs
        par = Parags.get(0)
        // Pour être sûr que c'est le bon :
        expect(par.contents).to.equal("Un paragraphe synchronisé pour le panneau scénier")
        prels = getRelativesById(0)
        // Il doit être relié à tous les autres
        // On fait d'abord la liste de tous les identifiants du brin
        arr_relatifs = []
        forEach(prels.r, (v, k) => {
          v && v.forEach(pid => {arr_relatifs.push(pid)})
        })
        let ipar = 0, dpan
        Projet.PANNEAUX_SYNC.forEach( panid => {
          if ( panid == 'scenier' ) return ;
          ++ ipar
          dpan = prels.r[PanProjet.oneLetterOf(panid)]
          expect(dpan).not.to.be.undefined
          expect(dpan).to.include(ipar)
        })
      })
      it("elle met les données correctes dans les parags synchronisés", function(){
        let parag
        Projet.PANNEAUX_SYNC.forEach(panid => {
          if (panid == 'scenier') return ; // le premier
          parag = projet.panneau(panid).parags.items[0]
          expect(parag.id).to.be.at.least(0)
          expect(parag.contents).to.equal("[Relatif du paragraphe PARAG#0]")
          expect(parag.duration).to.equal(180)
        })
      })
      it("elle marque tous les parags modifiés", function(){
        Parags.items.forEach((p, pid) => {expect(p.modified).to.be.true})
      })
      it("elle marque le projet modifié", function(){
        expect(projet.modified).to.be.true
      })
      it("tous les parags sont relatifs entre eux", function(){
        let p1 = Parags.get(0)
          , p3
        for(let i = 1, len = Projet.PANNEAUX_SYNC.length; i<len; ++i) {
          let p2 = Parags.get(i)
          expect(projet.relatives.areRelatifs(p1,p2)).to.be.true
          for(let ii=1 ; ii < len ; ++ii){
            if ( ii == i ) continue ;
            p3 = Parags.get(ii)
            expect(projet.relatives.areRelatifs(p2, p3)).to.be.true
          }
        }
      })
    });

    describe('lorsqu’elle n’est pas enclenchée', function () {
      before(function () {
        resetTests({nombre_parags: 0})
        projet.option('autosync', false)

        // ======== PRÉ-VÉRIFICATIONS ===========
        expect(projet.option('autosync')).to.be.false
        expect(Parags.items.size).to.equal(0)
        Projet.PANNEAUX_SYNC.forEach(p => {
          expect(projet.panneau(p).parags.count).to.equal(0)
        })

        // ==========> TEST <===============
        return panneauManuscrit.PRactivate()
        .then( () => {
          let newParag = panneauManuscrit.parags.createNewParag(
              {contents:'Parag sans synchro'}
            , {synchronize: false}
          )
          return newParag.onChangeContents()
        })
      });
      it("elle ne crée que le parag voulu", function(){
        expect(Parags.count()).to.equal(1)
        expect(projet.panneau('manuscrit').parags.count).to.equal(1)
      })
      it("elle marque le projet modifié", function(){
        expect(projet.modified).to.be.true
      })
    });
  });

  describe('La méthode Relatives#associate', function () {
    before(function () {
      resetTests({nombre_parags:4})
      panneauNotes.add(parag0)
      panneauManuscrit.add([parag1, parag2, parag3])
    });
    it("répond", function(){
      expect(projet.relatives).to.respondsTo('associate')
    })
    it("produit une erreur si aucun argument", function(){
      expect(()=>{projet.relatives.associate()}).to.throw("Il faut fournir les parags à associer !")
    })
    it("produit une erreur si l'argument n'est pas une liste", function(){
      expect(()=>{projet.relatives.associate(parag0)}).to.throw("Il faut fournir une liste des parags à associer !")
    })
    it("produit une erreur si l'argument est une liste avec les deux mêmes parags", function(){
      expect(()=>{projet.relatives.associate([parag0,parag0])}).to.throw("Un parag ne peut être associé à lui-même.")
    })
    it("produit une erreur si l'argument est une liste contenant des mêmes parags", function(){
      liste = [parag0, parag1, parag2, parag0]
      expect(()=>{projet.relatives.associate(liste)}).to.throw("Un parag ne peut être associé à lui-même.")
    })
    it("ne produit pas d'erreur avec une liste valide", function(){
      liste = [parag0, parag1, parag2]
      expect(()=>{ projet.relatives.associate(liste)}).not.to.throw()
    })
    it("ne produit pas d'erreur avec une bonne liste et associe les parags spécifiés", function(){
      resetTests({nombre_parags:4})
      panneauNotes.add(parag0)
      panneauScenier.add([parag1, parag3])
      panneauTreatment.add(parag2)
      expect(parag0.hasRelatif(parag1)).to.be.false
      expect(parag0.hasRelatif(parag2)).to.be.false
      expect(parag1.hasRelatif(parag0)).to.be.false
      expect(parag1.hasRelatif(parag2)).to.be.false
      expect(parag2.hasRelatif(parag0)).to.be.false
      expect(parag2.hasRelatif(parag1)).to.be.false
      expect(parag0.hasRelatif(parag3)).to.be.false
      expect(parag1.hasRelatif(parag3)).to.be.false
      expect(parag2.hasRelatif(parag3)).to.be.false
      // ==========> TEST <==========
      liste = [parag0, parag1, parag2]
      expect(()=>{ projet.relatives.associate(liste)}).not.to.throw()
      // =========== VÉRIFICATIONS ============
      expect(parag0.hasRelatif(parag1)).to.be.true
      expect(parag0.hasRelatif(parag2)).to.be.true
      expect(parag1.hasRelatif(parag0)).to.be.true
      expect(parag1.hasRelatif(parag2), "Le parag1 et le parag2 devraient être relatifs").to.be.true
      expect(parag2.hasRelatif(parag0)).to.be.true
      expect(parag2.hasRelatif(parag1)).to.be.true
      // Et toujours pas en relation avec le parag3
      expect(parag0.hasRelatif(parag3)).to.be.false
      expect(parag1.hasRelatif(parag3)).to.be.false
      expect(parag2.hasRelatif(parag3)).to.be.false
    })
  });
  describe('Détail de l’association produite', function () {
    /** ---------------------------------------------------------------------
      *
      *     TROIS TESTS DE SYNCHRO
      *
      *  Les trois tests de synchro suivant vont vérifier le bon fonctionnement
      * de la synchro (donc de l'association), qui a un comportement
      * particulier (et logique).
      * Pour voir les principes de l'association :
      * N0006
      * https://github.com/PhilippePerret/Script-design/wiki/NoI#n0006
      *
    *** --------------------------------------------------------------------- */
    before(function () {
      resetTests({nombre_parags: 10})
      panneauNotes.add(parag0)
      panneauSynopsis.add(parag4)
      panneauScenier.add([parag1, parag2, parag3, parag7])
      panneauManuscrit.add([parag5, parag6])
      // Tous ces panneaux vont être donnés à l'association, dans le
      // désordre, et on devrait obtenir :
      //    - parag0 associé avec tous les parags
      //    - parag4 associé avec tous les parags
      //    - Tous les autres parags associés seulement avec parag0 et parag4


      // ==========> TEST <==========
      liste = [parag4, parag1, parag2, parag7, parag0, parag5, parag3, parag6]
      projet.relatives.associate(liste)

    });
    it("n'associe pas entre eux les parags d'un même panneau", function(){
      let arr = [1,2,3,7]
      arr.forEach( refid => {
        arr.forEach( relid => {
          if ( refid == relid ) return ;
          let ref = Parags.get(refid)
          let pns = Parags.get(relid)
          expect(ref.hasRelatif(pns)).to.be.false
          expect(pns.hasRelatif(ref)).to.be.false
        })
      })
    })
    it("associe les parags seuls (dans panneau) avec tous les autres", function(){
      let arr_seuls = [0,4]
      let arr_autres = [1,2,3,5,6,7]
      arr_seuls.forEach( refId => {
        arr_autres.forEach( pnsId => {
          let ref = Parags.get(refId)
          let pns = Parags.get(pnsId)
          expect(ref.hasRelatif(pns)).to.be.true
          expect(pns.hasRelatif(ref)).to.be.true
        })
      })
    })
    it("associe les parags seuls entre eux", function(){
      expect(parag4.hasRelatif(parag0)).to.be.true
      expect(parag0.hasRelatif(parag4)).to.be.true

    })
    it("n'associe pas les parags d'un panneau avec les parags d'un autre panneau", function(){
      // En d'autres termes, si les parags 1,2,3 du panneau Notes sont associés
      // aux panneaux 4,5,6 du panneau Manuscrit, ils ne sont pas associés. Il faut
      // forcément que ça passe par un autre.
      let arr_pan1 = [1,2,3,7]
      let arr_pan2 = [5,6]
      arr_pan1.forEach( refId => {
        arr_pan2.forEach( pnsId => {
          let ref = Parags.get(refId)
          let pns = Parags.get(pnsId)
          expect(ref.hasRelatif(pns)).to.be.false
          expect(pns.hasRelatif(ref)).to.be.false
        })
      })
    })
  });

  // TODO En mode double panneau, on peut voir les parags synchronisés

  describe.only('Synchronisation des parags en mode double panneau', function () {
    describe('Visualisation des parags synchronisés', function () {
      describe('en sélectionnant un parag synchronisé', function () {
        describe('avec un seul relatif dans l’autre panneau', function () {
          before(function () {
            // =========== PRÉPARATION ================
            resetTests({nombre_parags: 10})
            panneauNotes.add([parag0, parag1])
            panneauScenier.add([parag2, parag3])
            projet.relatives.associate([parag0, parag2])

            // =========== PRÉ-VÉRIFICATION ============
            expect(parag0.hasRelatif(parag2)).to.be.true

            // =========> TEST <============
            // On pass en mode double panneau
            return Projet.activatePanneauByTabulator(['notes', 'scenier'])
            .then( () => {
              expect(projet.panneau('notes').actif).to.be.true
              expect(projet.panneau('scenier').actif).to.be.true
              expect(projet.mode_double_panneaux).to.be.true
            })
          });
          it("si un seul relatif, on met le relatif en exergue", function(){
            this.skip()
          })
        });
        describe('avec plusieurs relatifs dans l’autre panneau', function () {
          it("met tous les relatifs en exergue", function(){
            this.skip()
          })
        });
      });
    });
    describe('avec deux parags sélectionnés', function () {
      it("synchronise les deux parags", function(){
        this.skip()
      })
    });

  });
});
