/** ---------------------------------------------------------------------
  *   class Events
  *   ------------
  *   Gestion des évènements en tant qu'ensemble d'{Event}s.
  *
*** --------------------------------------------------------------------- */
class Parags
{


  /**
  * Appelée par la touche 'n' en dehors du mode édition, cette méthode
  * permet d'initier la création d'un paragraphe {Parag}.
  **/
  static new ()
  {
    let newP = new Parag({id:Parag.newID(),contents:''})
    Projet.current_panneau.addParag(newP, {current: true, edited: true})
  }
}

module.exports = Parags
