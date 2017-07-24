/*

  Tests unitaire de l'instance `parags` des panneaux, qui permet de
  gérer ses pararaphes propres (en distinction des tous les paragraphes du
  projet).

*/
let path      = require('path')
let fs        = require('fs')
require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
const oof = {only_on_fail: true}
resetAllPanneaux()

// NOTE Il s'agit ici de la nouvelle façon d'enregistrer les paragraphes,
// avec une longueur fixe.
describe("Enregistrement du panneau",[
  // On peut tester toutes les méthodes sauf la méthode de sauvegarde des
  // paragraphes, qui relève maintenant du projet, pas du panneau
])
