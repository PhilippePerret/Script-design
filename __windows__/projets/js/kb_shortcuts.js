/*

  Définition des raccourcis clavier pour la page des PROJETS

  Cette page permet de choisir un projet ou d'en définir un
  nouveau. Elle est appelée tout de suite avec le screensplash de
  démarrage, ou lorsqu'on joue la touche 'p' dans un contexte général.

*/


define(
  [
    path.join(APP_PATH,'lib','required.js'),
    path.join(APP_PATH,'lib','utils','dom.js'),
    path.join(__dirname,'projets','js','api.js')
  ]
, function(
      Rq
    , DOM
    , Projet
  ){


  const KBShortcuts = class {

    static onkeyup (evt)
    {
      switch ( evt.key )
      {
        // La touche escape doit toujours sortir du champ courant (pour
        // activer les touches hors édition)
        case 'Escape':
          break
        case 'Enter':
          return Projet.defaultEnter()
        case '@':
          Rq.log('Aide demandée sur la page courante')
          break
        case 'p':
          Rq.log('Préférences demandée')
          break
        case 'l':
          // Rq.log('Liste des projets demandée')
          return Projet.activeSectionList()
        case 'n':
          // Rq.log('-> Nouveau projet demandé')
          return Projet.activeSectionForm()
        default:
          Rq.log(`Touche pressée (non captée) : '${evt.key}'`)
      }
    }
  }

  return KBShortcuts
})
