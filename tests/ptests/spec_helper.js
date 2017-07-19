/** ---------------------------------------------------------------------
  *   Fichier appelé au lancement des tests
  *
*** --------------------------------------------------------------------- */

// Pour repérer les retours console dans des feuilles de tests volumineuses,
// on peut encadrer le test par :
//
//    console.log(DELIMITER_START)
//    ... ici le test ...
//    console.log(DELIMITER_END)
//
// … pour le repérer
global.DELIMITER_START = "\n\n\n------------ MARK IN --------------\n\n\n"
global.DELIMITER_END   = "\n\n\n------------ /MARK OUT --------------\n\n\n"


let path    = require('path')
// global.C    = require('../../lib/constants')
// global.DOM  = require('../../lib/utils/dom_class')


// Pour écrire la description des tests sur une seule ligne.
PTests.options.one_line_describe = true

// Mettre à null pour que tous les tests soient joués ou définir le seul
// test à faire
// PTests.options.test_file = path.join('autotests','template_message_spec.js')
// PTests.options.test_file = path.join('autotests','equality_spec.js')
// PTests.options.test_file = path.join('autotests','any_spec.js')
// PTests.options.test_file = path.join('autotests','contain_spec.js')
// PTests.options.test_file = path.join('autotests','inst_method_class_method_spec.js')
// PTests.options.test_file = path.join('autotests','class_spec.js')
// PTests.options.test_file = path.join('autotests','between_spec.js')
// PTests.options.test_file = path.join('autotests','module_require_spec.js')
// PTests.options.test_file = path.join('autotests','option_no_values_spec.js')
// PTests.options.test_file = path.join('autotests','file_spec.js')
// PTests.options.test_file = path.join('autotests','dom_spec.js')
// PTests.options.test_file = path.join('autotests','dom_children_spec.js')
// PTests.options.test_file = path.join('autotests','have_tag_spec.js')

// --- APP ---
//
// Note : il suffit de choisir un test pour désactiver le 'test_folder' plus
// bas.
// PTests.options.test_file = path.join('page_projet','essai_spec.js')
// PTests.options.test_file = path.join('unit','store_spec.js')
// PTests.options.test_file = path.join('unit','Projet','options_spec.js')
PTests.options.test_file = path.join('unit','Projet','save_spec.js')
// PTests.options.test_file = path.join('unit','Parags','relatives_spec.js')
// PTests.options.test_file = path.join('unit','Parags','pan_parags_spec.js')
// PTests.options.test_file = path.join('unit','Parags','creation_parag_spec.js')
// PTests.options.test_file = path.join('unit','Parags','remove_parag_spec.js')
// PTests.options.test_file = path.join('unit','Parags','move_parag_spec.js')
// PTests.options.test_file = path.join('unit','Parags','parag_spec.js')

// Le dossier de tests à faire
// Ce doit être le chemin relatif (sans './') depuis le dossier ./tests/ptests/
// PTests.options.test_folder = 'autotests'
PTests.options.test_folder = 'unit'
// PTests.options.test_folder = 'unit/Parags'

// beforeSuite(function(){
//   // À faire avant tous les tests
// })
// afterSuite(function(){
//   // À faire après tous les tests
// })
