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
    path.join('.','projets','js','api')
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
        case 'Enter':
          Rq.log('Touche entrée pressée')
          Projet.create()
          break
        default:
          Rq.log(`Touche pressée : '${evt.key}'`)
      }

    }

  }

  return KBShortcuts
})
