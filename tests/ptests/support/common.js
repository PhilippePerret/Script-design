/** ---------------------------------------------------------------------
  *   Fichier support commun
  *
  * Partagé par le mode unitaire et le mode intégré (intégration)
  * Contrairement au fichier spec_helper.js, qui n'est utilisé que par
  * les tests unitaires, ce module est utilisé dans tous les modes.
  * Rappel : le mode "intégré" est un mode d'intégration qui est vraiment
  * intégré dans l'application et fonctionne lorsqu'on la lance avec
  * le paramètre adéquat (pour le moment, il faut régler la constante à
  * l'intérieur des fichiers main.js.
*** --------------------------------------------------------------------- */

let EV = require_module('./lib/utils/events_class.js')
global.EV = EV
global.KB = EV.Keyboard
