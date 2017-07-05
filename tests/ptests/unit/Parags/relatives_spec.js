/** ---------------------------------------------------------------------
  *   Test des relatives
  *
  C'est un problème complexe qui demande d'être traité en profondeur
*** --------------------------------------------------------------------- */

const oldoptionsOneLinevalue = PTests.options.one_line_describe
PTests.options.one_line_describe = false

afterAll( () => {
  PTests.options.one_line_describe = oldoptionsOneLinevalue
})

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
  static get PANNEAUX_DATA ()
  {
    if (undefined === this._panneauData )
    {
      this._panneauData = {
          'data'        : {oneLetter: 'd'/* pour relatives*/ }
        , 'd' : 'data'
        , 'manuscrit'   : {oneLetter: 'm'}
        , 'm' : 'manuscrit'
        , 'notes'       : {oneLetter: 'n'}
        , 'n' : 'notes'
        , 'personnages' : {oneLetter: 'p'}
        , 'p' : 'personnages'
        , 'scenier'     : {oneLetter: 's'}
        , 's' : 'scenier'
        , 'synopsis'    : {oneLetter: 'y'}
        , 'y' : 'synopsis'
        , 'treatment'   : {oneLetter: 't'}
        , 't' : 'treatment'
      }
    }
    return this._panneauData
  }
}
global.Projet = Projet

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

// À appeler par les tests pour obtenir une instance relative qui permettra
// d'invoquer la méthode `associate` pour procéder à l'association des
// paragraphes.
function newRelatives(withData) {
  projet = new Projet('test')
  relatives = projet.relatives
  relatives.setDataTest(withData)
  return relatives
}

let par1, par2, par3, par4, par5
let ir, relatives_exp // pour instance Relatives (fournie et attendue)

// On stub la méthode alert pour qu'elle mette le message d'alerte
// dans la propriété 'alertMessage' de PTests
global.alert = function(mess){
  PTests.alertMessage = mess
  // puts(`Message Alert: ${mess}`)
}


/**
* Méthode principale créant l'association entre les parags fournis et
* checkant que le résultat correspond aux attentes
*
* @param {Array} parag_list
*     Liste des paragraphes {Parag} qu'il faut associer.
* @param {Relatives} irelatives
*     L'objet relatives du projet.
* @param {Object} hexpected
*     La table attendue. ATTENTION : si cette table est fausse, le test produira
*     une erreur. Il faut donc la vérifier trois fois.
* @param {Boolean} show_with_json
*     Pour l'implémentation du test, on peut mettre cet argument à true pour
*     afficher les deux tables des relatives, celle attendue et celle obtenue.
**/
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
  expect(irelatives.data.relatives,{template:{success:"La données des relatives correspond à celle attendue."}, no_values:true}).to.equal(hexpected, {diff: true})
}
/**
* Méthode qui doit produire un échec
**/
const TempAssoInv = {
  success: "L'association n'a pas pu se faire.",
  failure: "L'association a pu se faire."
}
function associateAndFailure(parag_list, irelatives, alertMessage)
{
  // On conserve la valeur initiale
  let initialData = function(){return irelatives.data}()
  // puts(`initialData: ${JSON.stringify(initialData)}`)
  let result = irelatives.associate(parag_list)
  expect(result,{template:TempAssoInv}).to.be.false
  // irelatives ne doit pas avoir été modifié
  let opts = {
    template:{
      failure:"La donnée Relatives ne devrait pas avoir été modifiée…"
      , success: "La données des relatives n'a pas été affectée."
    },
    no_values: true
  }
  expect(irelatives.data).to.equal(initialData, opts)
  // Le message d'alerte doit avoir été fourni
  if (alertMessage){
    expect(PTests.alertMessage,'le message d’alerte donné',{no_values:true}).to.contains(alertMessage)
  }
}

describe("Association des parags (Relatives)",[


  // --------------- SUCCÈS -----------------
  , context("avec des données valides",[
    , context("2 parags sans aucune association dans deux panneaux différents",[
      , it("produit un succès", ()=>{
        par1 = new Parag(0, "scenier")
        par2 = new Parag(1, "notes")
        ir = newRelatives({
          "relatives":{
              "0":{"t":"s", "r":{}}
            , "1":{"t":"n", "r":{}}
          }
        })
        relatives_exp = {
            "0":{"t":"s", "r":{"n":[1]}}
          , "1":{"t":"n", "r":{"s":[0]}}
        }
        // ===> TEST <===
        associateAndCheck([par1, par2], ir, relatives_exp)
      })
    ])
    , context("avec 1 parag dans un panneau et 2 dans un autre",[
      , it("produit un succès", ()=>{
        par1 = new Parag(0, "scenier")
        par2 = new Parag(1, "notes")
        par3 = new Parag(2, "notes")
        ir = newRelatives({
          "relatives":{
              "0":{"t":"s", "r":{}}
            , "1":{"t":"n", "r":{}}
            , "2":{"t":"n", "r":{}}
          }
        })
        relatives_exp = {
            "0":{"t":"s", "r":{"n":[1,2]}}
          , "1":{"t":"n", "r":{"s":[0]}}
          , "2":{"t":"n", "r":{"s":[0]}}
        }
        // ===> TEST <===
        associateAndCheck([par1, par2, par3], ir, relatives_exp)
      })
    ])
    , context("avec 2 parags dont le référent est déjà associé à un autre, dans un autre panneau",[
      , it("produit un succès", ()=>{
        par1 = new Parag(0, "scenier")
        par2 = new Parag(1, "notes")
        ir = newRelatives({
          "relatives":{
              "0":{"t":"s", "r":{"m":[5,6]}}
            , "1":{"t":"n", "r":{}}
            , "5":{"t":"m", "r":{"s":[0]}}
            , "6":{"t":"m", "r":{"s":[0]}}
          }
        })
        relatives_exp = {
            "0":{"t":"s", "r":{"m":[5,6],"n":[1]}}
          , "1":{"t":"n", "r":{"s":[0]}}
          , "5":{"t":"m", "r":{"s":[0]}}
          , "6":{"t":"m", "r":{"s":[0]}}
        }
        // ===> TEST <===
        associateAndCheck([par1, par2], ir, relatives_exp)
      })
    ])
    , context("avec 2 parags dont l'other est déjà associé à un autre, dans un autre panneau",[
      , it("produit un succès", ()=>{
        par1 = new Parag(0, "scenier")
        par2 = new Parag(1, "notes")
        ir = newRelatives({
          "relatives":{
              "0":{"t":"s", "r":{"m":[5,6]}}
            , "1":{"t":"n", "r":{"m":[12]}}
            , "5":{"t":"m", "r":{"s":[0]}}
            , "6":{"t":"m", "r":{"s":[0]}}
            , "12":{"t":"m", "r":{"n":[1]}}
          }
        })
        relatives_exp = {
            "0":{"t":"s", "r":{"m":[5,6], "n":[1]}}
          , "1":{"t":"n", "r":{"m":[12],"s":[0]}}
          , "5":{"t":"m", "r":{"s":[0]}}
          , "6":{"t":"m", "r":{"s":[0]}}
          , "12":{"t":"m", "r":{"n":[1]}}
        }
        // ===> TEST <===
        associateAndCheck([par1, par2], ir, relatives_exp)
      })
    ])
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
  , context("avec des données invalides",[
    , context("échoue quand le paragraphe est associé à lui-même",[
      , it("produit un échec", ()=>{
        par1 = new Parag(1, "scenier")
        par2 = new Parag(1, "notes") // <== ERREUR, MÊME #ID
        ir = newRelatives({
          "relatives":{
              "0":{"t":"s", "r":{}}
            , "1":{"t":"n", "r":{}}
          }
        })
        associateAndFailure([par1,par2],ir,"Le parag #1 ne peut être associé à lui-même")
      })
    ])
    , context("échoue quand deux paragraphes sont choisis dans le même panneau",[
      , it("produit un échec", ()=>{
        par1 = new Parag(1, "scenier")
        par2 = new Parag(2, "scenier") // <== ERREUR, MÊME PANNEAU
        ir = newRelatives({
          "relatives":{
              "1":{"t":"s", "r":{}}
            , "2":{"t":"s", "r":{}}
          }
        })
        associateAndFailure([par1,par2],ir,"Plusieurs parags ont été sélectionnés dans les deux panneaux. Je n'ai donc aucun référent.")
      })
    ])
    , context("échoue si deux paragraphes sont déjà relatifs",[
      , it("produit un échec", ()=>{
        par1 = new Parag(1, "scenier")
        par2 = new Parag(2, "manuscrit") // <== ERREUR, DÉJÀ ASSOCIÉ
        ir = newRelatives({
          "relatives":{
              "1":{"t":"s", "r":{"m":[2]}}
            , "2":{"t":"m", "r":{"s":[1]}}
          }
        })
        associateAndFailure([par1,par2],ir,"Les parags #1 et #2 sont déjà relatifs.")
      })
    ])
    , context("échoue en essayant d'associer 2 parags choisi dans un panneau, 2 dans l'autre (aucun référent) ",[
      , it("produit un échec avec le message un seul référent nécessaire", ()=>{
        par1 = new Parag(1, "scenier")
        par2 = new Parag(4, "scenier")
        par3 = new Parag(2, "manuscrit")
        par4 = new Parag(12, "manuscrit")
        ir = newRelatives({
          "relatives":{
              "1":{"t":"s", "r":{}}
            , "2":{"t":"m", "r":{}}
            , "4":{"t":"s", "r":{}}
            , "12":{"t":"m", "r":{}}
          }
        })
        associateAndFailure([par1,par2,par3,par4],ir,"Plusieurs parags ont été sélectionnés dans les deux panneaux. Je n'ai donc aucun référent.")
      })
    ])
    , context("échoue en associant un parag à un 1 parag associé avec un frère à un autre parag du même panneau",[
      /*
        Ici on tente d'associer 2 parags d'un panneau à 2 parags d'un autre, mais
        en deux temps (en un temps, l'erreur de manque de référent est signalé, cf. le
        cas précédent).
        Ici, on a déjà associé P1(scénier) à P2(notes) et P3(notes)
        Et on essaie d'associer P4(scénier) à P2(notes)
        Si on réussit, on aurait les deux paragraphes P1 et P4 (scénier) qui
        seraient associés aux parags P2 et P3 (notes). On ne peut pas, il faut
        toujours qu'un seul parag-référent s'adresse à un ou plusieur parag
        d'un autre panneau.
        Et surtout, 2 parags du même panneau ne peuvent avoir qu'un seul
        référent dans un autre panneau.
        Cf. "Principe de l'unicité du référent"
      */
      , it("produit un échec", ()=>{
        // par1 = new Parag(1, "scenier") // déjà associé à 2 et 12
        par2 = new Parag(4, "scenier")
        par3 = new Parag(2, "notes")
        // par4 = new Parag(12, "notes")
        ir = newRelatives({
          "relatives":{
              "1":{"t":"s", "r":{"n":[2,12]}}
            , "2":{"t":"n", "r":{"s":[1]}}
            , "4":{"t":"s", "r":{}}
            , "12":{"t":"n", "r":{"s":[1]}}
          }
        })
        associateAndFailure([par2,par3],ir,"impossible d'associer les parags #4 et #2, on obtiendrait 2 parags d'un même panneau avec 2 référents différents.")
      })

    ])
  ])
])
