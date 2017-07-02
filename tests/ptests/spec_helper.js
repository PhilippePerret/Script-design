/** ---------------------------------------------------------------------
  *   Fichier appelé au lancement des tests
  *
*** --------------------------------------------------------------------- */
let path = require('path')

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
PTests.options.test_file = path.join('autotests','have_tag_spec.js')

// PTests.options.test_file = path.join('unit','store_spec.js')
// PTests.options.test_file = path.join('page_projet','essai_spec.js')

// Le dossier de tests à faire
// Ce doit être le chemin relatif (sans './') depuis le dossier ./tests/ptests/
// PTests.options.test_folder = 'autotests'
PTests.options.test_folder = 'unit/Parags'

// beforeSuite(function(){
//   // À faire avant tous les tests
// })
// afterSuite(function(){
//   // À faire après tous les tests
// })
