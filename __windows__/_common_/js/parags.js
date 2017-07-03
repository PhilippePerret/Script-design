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

  /** ---------------------------------------------------------------------
    *
    *   ITEMS
    *
  *** --------------------------------------------------------------------- */
  static get items () {
    if(undefined===this._items){this._items = {}}
    return this._items
  }
  static addItem (iparag)
  {
    if(undefined===this._items){
      this._items         = {}
      this._nombre_items  = 0
    }
    this._items[iparag.id] = iparag
    this._nombre_items ++
  }
  static get length () { return this._nombre_items }
  static get zeroParags () { return this.length === 0 }

  static get firstParag () {
    if(this.zeroParags){return null}
    let firstK = Object.keys(this.items)[0]
    console.log(`firstK = `, firstK)
    return this.items[firstK]
  }
  static get lastParag () {
    if(this.zeroParags){return null}
    let lastK = Object.keys(this.items)[this.length-1]
    console.log(`lastK = `, lastK)
    return this.items[lastK]
  }

  // Selectionne le paragraphe précédent ou suivant
  static selectPrevious ()
  {
    let prev
    if(this.zeroParags){ return }
    if(!Parag.current){ // On doit sélectionner le dernier
      prev = this.lastParag
    } else {
      console.log('current.id=', Number(Parag.current.mainDiv.getAttribute('data-id')))
      let other = Parag.current.mainDiv.previousSibling
      console.log('other.id = ', Number(other.getAttribute('data-id')))
      if (other){
        prev = this.items[Number(other.getAttribute('data-id'))]
      } else {
        prev = this.lastParag
      }
    }
    console.log("Prev.id = ", prev.id)
    Parag.setCurrent(prev)
  }
  static selectNext ()
  {
    let next
    if(this.zeroParags){ return }
    if(!Parag.current){ // On doit sélectionner le premier
      next = this.firstParag
    } else {
      console.log('current.id=', Number(Parag.current.mainDiv.getAttribute('data-id')))
      let other = Parag.current.mainDiv.nextSibling
      console.log('other.id = ', Number(other.getAttribute('data-id')))
      if (other){
        next = this.items[Number(other.getAttribute('data-id'))]
      } else {
        next = this.firstParag
      }
    }
    console.log("Next.id = ", next.id)
    Parag.setCurrent(next)
  }

}

module.exports = Parags
