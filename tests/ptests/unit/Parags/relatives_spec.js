/** ---------------------------------------------------------------------
  *   Test des relatives
  *
  C'est un problème complexe qui demande d'être traité en profondeur
*** --------------------------------------------------------------------- */

// Pour utiliser `exec`
var util = require('util')
var exec = require('child_process').exec
function wexec(error, stdout, stderr) {
  if(error){puts(error,'warning')}
  puts(stdout)
  if(stderr){puts(stderr,'warning')}
}
// exec("ls -la", puts);



// On charge le module `relatives.js`
const Relatives = require_module('./__windows__/projet/js/relatives_class.js')

// Méthode dont on se sert pour définir les données relatives actuelles
Relatives.prototype.setDataTest = function(d)
{
  this._data = d
}

Object.defineProperties(Relatives,{
  'data':{
    get: function(){return this._data}
  }
})

// On stub les méthodes qui doivent l'être
Relatives.prototype.save = function(){
  puts("Normalement, enregistrement de la donnée data")
}

// ON moke la classe Projet
class Projet {
  constructor (name) { this.name = name }
  get relatives ()
  {
    if ( undefined === this._relatives )
    { this._relatives = new Relatives(this) }
    return this._relatives
  }
}

//  On mocke la classe Parag pour qu'elle donne le minium
class Parag {
  constructor (id, panneau_id, next, prev) {
    this.id           = id
    this.panneau_id   = panneau_id
    this._next_parag  = next
    this._prev_parag  = prev
  }
  get nextParag () {
    return this._next_parag
  }
  get prevParag () {
    return this._prev_parag
  }
}


// On crée un faux objet relatives
let projet, relatives

// À appeler par les tests pour obtenir une instance relative

function newRelatives(withData) {
  projet = new Projet('test')
  relatives = projet.relatives
  relatives.setDataTest(withData)
  return relatives
}

let par1, par2, par3, par4, par5
let pan_scenier = "scenier", pan_notes = "notes"
let ir, hir_exp // pour instance Relatives (fournie et attendue)


global.alert = function(mess){puts(`Message Alert: ${mess}`)}

function associateAndCheck(parag_list, irelatives, hexpected, show_with_json)
{
  if ( show_with_json )
  {
    let data_str_before = JSON.stringify(irelatives.data)
    puts(`DATA AVANT : ${data_str_before}`)
  }
  irelatives.associate(parag_list)
  if ( show_with_json )
  {
    let data_str_after = JSON.stringify(irelatives.data)
    puts(`DATA APRÈS : ${data_str_after}`)
  }
  expect(ir.data).to.equal(hexpected, {diff: true})
}

describe("Relatives d'un parag",[


  // --------------- SUCCÈS -----------------
  , context("avec des données valides",[
    , context("Un paragraphe choisi dans deux panneaux différents, sans association",[
      , it("produit un succès avec un parag choisi", ()=>{
        par1 = new Parag(0, "scenier")
        par2 = new Parag(1, "notes")
        ir = newRelatives({
          "relatives":{
              "1":{"scenier":[0]}
            , "2":{"notes":[1]}
          }
          , "lastRelID":2
          , "id2relative":{
              "0":1
            , "1":2
          }
        })

        // Le tableau qu'on attend
        hir_exp = {
          "relatives":{
            "1":{"scenier":[0], "notes":[1]}
          }
          , "lastRelID":2
          , "id2relative":{
            "0":1,
            "1":1
          }
        }

        // ===> TEST <===
        associateAndCheck([par1, par2], ir, hir_exp)

      })
    ])
  //   , context("avec 1 parag dans un panneau et 2 dans un autre",[
  //     , it("produit un succès", ()=>{
  //       pending("Succès avec 1 contre 2")
  //     })
  //   ])
  //   , context("avec 2 parags dont le référent est déjà associé à un autre,dans un autre panneau",[
  //     , it("produit un succès", ()=>{
  //       pending("Succès avec 2 parags dont 1 associé")
  //       // L'other doit hériter de l'association
  //     })
  //   ])
  //   , context("avec 2 parags dont l'other est déjà associé à un autre, dans un autre panneau",[
  //     , it("produit un succès", ()=>{
  //       pending("2 parags avec other associé à un autre panneau")
  //       // Le référent doit hériter de l'association
  //     })
  //   ])
  //   , context("avec 2 parags dont l'other est associé au paragraphe précédent du référent",[
  //     , it("produit un succès", ()=>{
  //       pending("2 parags, other lié à précédent du référent")
  //       // TODO Mais là, il doit y avoir un truc spécial, non ? C'est l'other qui doit
  //       // devenir le référent, ou est-ce que ça ne change rien ?
  //     })
  //   ])
  //   , context("avec 4 parags (1 réf et 3 others) dont aucn n'est associé",[
  //     , it("produit un succès", ()=>{
  //       pending("4 parags donc aucune association")
  //     })
  //   ])
  //   , context("avec 4 parags et un référent déjà associé à un autre paragraphe",[
  //     , it("produit un succès", ()=>{
  //       pending("4 parags et référent déjà associé")
  //     })
  //   ])
  //   , context("avec 4 parags, un réf non associé et 2 others associés",[
  //     , it("produit un succès", ()=>{
  //       pending("4 parags, réf non associé, 2 others associés")
  //     })
  //   ])
  //   , context("avec 4 parags tous correctement associés dans d'autres panneaux",[
  //     , it("produit un succès", ()=>{
  //       pending("4 parags tous associés")
  //     })
  //   ])
  //   , , context("avec 10 parags correctement associés dans tous les sens",[
  //     , it("produit un succès", ()=>{
  //       pending("10 parags associés dans tous les sens (4 panneaux)")
  //     })
  //   ])
  ])


  // ---------------- ÉCHECS ----------------
  , context("Cas simples qui échouent",[
    , context("avec deux paragraphes choisis dans le même panneau",[
      , it("doit produire un échec d'impossibilité", ()=>{
        pending("Échec à implémenter")
        // TODO Se servir du stub de alert (en haut de feuille de test)
        // pour contrôler le message d'erreur transmis.
      })
    ])
  //   , context("deux paragraphes déjà associés",[
  //     , it("produit un échec", ()=>{
  //       pending("Échec à cause de deux paragraphes déjà associés")
  //     })
  //   ])
  //   , context("deux paragraphes dont l'un est associé à un autre paragraphe distant",[
  //     , it("produit un échec de distance", ()=>{
  //       pending("Échec pour association avec deux paragraphes trop distants")
  //     })
  //   ])
  //   , context("deux paragraphes dont l'un est déjà associé avec deux autres",[
  //     , it("produit un échec", ()=>{
  //       // Ce cas est plus difficile à expliquer :
  //       // Soit trois panneaux, P1 et P2
  //       // Soit un parag T1 de P1 associé à T2 de P2 et T3 de P3
  //       // Non… je ne trouve plus…
  //
  //
  //     })
  //   ])
  //   , context("2 parags choisi dans un panneau, 2 dans l'autre) ",[
  //     , it("doit produire un échec, il faut un seul référent", ()=>{
  //       pending("Échec un seul référent attendu, pas 2")
  //     })
  //   ])
  ])
])
