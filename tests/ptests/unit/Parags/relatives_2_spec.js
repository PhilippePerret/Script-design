/** ---------------------------------------------------------------------
  *   Test des relatives
  *
  *
*** --------------------------------------------------------------------- */
let path      = require('path')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}

/* On doit tester ici le formatage des balises PARAG#x dans les textes.

  Scénario : quand on synchronise les paragraphes (de façon synchrone ou
  asynchrone) on obtient des paragraphes créés au besoin dans tous les
  panneaux synchronisables (cf. la liste PANNEAUX_SYNC de Projet).
  Par exemple, le parag#12 du panneau Notes va générer le parag#13 du
  panneau Synopsis, le parag#14 du panneau Scénier, le parag#15 du panneau
  Treatment, etc.
  Dans les parags 13 et supérieur, on mettre la marque PARAG#12 pour indiquer
  leur relation avec le parag 12. Note : cette marque est mise dans le texte
  à la création du paragraphe 12 mais ensuite elle peut être retirée. Il
  restera juste la marque que le paragraphe est lié à un autre.

  Le problème est le suivant : quand on lit le parag#15 au prochain chargement
  du projet par exemple, sa marque PARAG#12 devrait être remplacée par un lien
  qui afficherait le contenu textuel du paragraphe, mais le parag#12 n'est pas
  encore chargé et donc n'existe pas. Donc il faut suivre cette méthode :

  [1] Formatage de PARAG#12 demandé
      PARAG#12 existe => On passe directement à [2]
      PARAG#12 n'existe pas
        [3] => On doit le charger, mais on ne connait pas son panneau.
            On obtient son panneau par les relatifs de #15
            On charge le panneau et donc le parag#15
            Et on peut poursuivre
  [2] On crée le lien qui va remplacer la marque.

  Note : donc cette méthode devient asynchrone lorsque le paragraphe n'est pas
  encore chargé.

*/
let res

describe("Formatage d'une balise PARAG#&ltid>",[
  , describe("Méthodes requises",[
    , describe("@as_link",[
      , it("est une propriété (pseudo-méthode)", ()=>{
        expect(typeof parag1.as_link, 'typeof parag1.as_link').to.equal('function')
      })
      , it("retourne le lien vers le paragraphe", ()=>{
        parag1.contents = "Je suis le premier paragraphe."
        expect(parag1.as_link(), 'parag1.as_link').to.contains('<a href="#"')
        expect(parag1.as_link(), 'parag1.as_link').to.contains('onclick="return showParag(1)"')
        expect(parag1.as_link(), 'parag1.as_link').to.contains('title="Je suis le premier paragraphe."')
        expect(parag1.as_link(), 'parag1.as_link').to.contains('class="p-al"')
        expect(parag1.as_link(), 'parag1.as_link').to.contains('>#1</a>')
      })
    ])
  ])
  , context("quand le paragraphe est déjà chargé",[
    , it("crée la balise tout de suite", ()=>{
      resetAllPanneaux()
      // On crée un nouveau paragraphe mais qui se trouvera seulement dans le
      // fichier d'un deuxième panneau

      // Le texte qu'on devrait afficher au survol de la souris
      parag2.contents = "Je suis le parag#2."

      // On met déjà le parag#1 dans le panneau Notes, on lui donnant un texte
      // avec un marque
      parag1.contents = "Ce paragraphe est lié à PARAG#2."
      panneauNotes.parags.add(parag1)

      res = parag1.contentsFormated
      expect(res,'parag1.contentsFormated').to.contain('<a href="#"')
      expect(res,'parag1.contentsFormated').to.contain('onclick="return showParag(2)"')
      expect(res,'parag1.contentsFormated').to.contain('title="Je suis le parag#2."')
      expect(res,'parag1.contentsFormated').to.contain('>#2</a>')

    })
  ])
  , context("quand le paragraphe n'est pas encore chargé",[
    , it("crée la balise en asynchrone", ()=>{
      // Pour réaliser cette opération, on met le paragraphe dans un panneau
      // qu'on marque
      resetAllPanneaux()
      parag3.contents = "Le paragraphe lié à PARAG#2."
      parag2.contents = "Ce paragraphe est \"lié\" à PARAG#3."
      panneauNotes.parags.add(parag2)
      panneauScenier.parags.add(parag3)
      panneauScenier.modified = true
      panneauScenier.save()
      waitForFalse(() => {return panneauScenier._modified})
      .then(() => {
        // On fait comme si parag3 n'existe plus
        delete Parags._items[3]
        expect(Parags.get(3)).to.strictly.equal(undefined, oof)
        // On réinitialise parag2 pour forcer le reformatage de son
        // texte
        parag2.reset()
        // On demande son texte, qui doit d'abord être nul
        res = parag2.contentsFormated
        expect(res).to.contain('__P3__', oof) // balise non remplacée
        expect(res).not.to.contain('onclick="return showParag(3)"',oof)

        // Je n'arrive pas à vérifier qu'il y a d'abord l'inscription avec
        // __P3__ dans le panneau, pour ensuite le modifier.
        // expect(cont).to.have_tag('div',{id:'p-2-contents', text: '__P3__'})
        // expect(cont.querySelector('div#p-2')).not.to.have_tag('a', {onclick:"return showParag(3)"})

        waitFor(0.2).then(() => {
          parag2.reset()
          res = parag2.contentsFormated
          expect(res,'parag2.contentsFormated').not.to.contain('__P3__') // balise non remplacée
          expect(res,'parag2.contentsFormated').to.contain('onclick="return showParag(3)"')
          expect(res,'parag2.contentsFormated').to.contain('title="Le paragraphe lié à #2."')

          // Dans l'affichage
          // Mais pour le moment, c'est presque un faux positif, puisque ça
          // a été tellement vite que c'était fait presque avant la première
          // inscription.
          expect(panneauNotes.container,'panneauNotes.container').not.to.have_tag('div',{id:'p-2-contents', text: /__P3__/})
          expect(panneauNotes.container.querySelector('div#p-2-contents'), 'div#p-2-contents').to.have_tag('a', {'onclick':"return showParag(3)"})

        })
      })
    })
  ])
])
