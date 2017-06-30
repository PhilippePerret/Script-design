/*
  Class Store
  -----------
  API permet d'enregistrer toutes les données d'une application dans des
  fichier JSON dans le dossier des données de l'utilisateur.

*/

define(
  [
    // C.LOG_MODULE_PATH
  ],
  function(
    // log
  ){
    return require(path.join(C.LIB_UTILS_FOLDER,'store_class'))
  }
)
