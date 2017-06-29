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
PTests.options.test_file = path.join('autotests','between_spec.js')

// Le dossier de tests à faire
// Ce doit être le chemin relatif (sans './') depuis le dossier ./tests/ptests/
PTests.options.test_folder = 'autotests';
