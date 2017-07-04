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

  /**
  * @return {Parag} Le parag d'identifiant +parag_id+ ou null s'il n'existe pas
  * @param {Number} parag_id Identifiant du parag à retourner
  **/
  static get ( parag_id )
  {
    return this.items[parag_id]
  }
  
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

  /**
  * Selectionne le paragraphe précédent ou suivant
  *
  * @param {KeyUpEvent} evt Suivant la touche du clavier, le comporterment
  * peut être différent :
  *       MAJ     On se déplace de 10 parags en 10 parags
  *       ALT     On doit déplacer le paragraphe au-dessus ou en dessous
  **/
  static selectPrevious (evt)
  {
    let
        to    = evt.shiftKey ? 5 : 1
      , prev  = this.getPrevious(to)

    if ( ! prev ) { return }
    Parag.setCurrent(prev)
  }
  /**
  * Remonte le parag courant
  **/
  static moveCurrentUp (evt)
  {
    let
        to    = evt.shiftKey ? 5 : 1
      , prev  = this.getPrevious(to)

    if ( ! prev ) { return }
    Parag.current.moveBefore(prev)
  }

  /**
  * Sélectionne le paragraphe suivant (ou 5 paragraphes plus bas)
  **/
  static selectNext (evt)
  {
    let
        to    = evt.shiftKey ? 5 : 1
      , next  = this.getNext(to)

    if ( ! next ) { return }
    Parag.setCurrent(next)
  }
  /**
  * Descend le parag courant
  **/
  static moveCurrentDown (evt)
  {
    let
        to    = evt.shiftKey ? 5 : 1
      , next  = this.getNext(to)

    if ( ! next ) { return }
    Parag.current.moveAfter(next)
  }


  /**
  * @return {Parag} Le paragraphe qui précède le paragraphe courant.
  * @param {Number} to Définit à combien on doit prendre le précédent (1 par
  *                    défaut)
  **/
  static getPrevious (to)
  {
    // Quand il n'y a pas de paragraphe dans ce pan du projet, on ne
    // peut que retourner null
    if ( this.zeroParags )
    {
      return null
    }

    // S'il n'y a pas de paragraphe courant, on renvoie le dernier
    // paragraphe.
    if( ! Parag.current)
    {
      return this.lastParag
    }

    // Sinon (s'il y a un paragraphe courant et que ce n'est pas le
    // premier, on le renvoie. Si c'est le premier, on renvoie le même
    if(undefined === to) { to = 1 }
    let
          i = 0
        , other
        , o = Parag.current.mainDiv
    for(; i < to ; ++i )
    {
      o = o.previousSibling
      if ( o ) { other = o }
      else { break }
    }
    if ( other )
    {
      return this.items[Number(other.getAttribute('data-id'))]
    }
    else
    {
      return Parag.current
    }
  }

  /**
  * @return {Parag} Le paragraphe qui précède de +to+ le paragraphe
  * courant. Retourne NULL s'il n'y a aucun paragraphe ou le premier paragraphe
  * s'il n'y a aucun paragraphe courant.
  **/
  static getNext (to)
  {
    if ( this.zeroParags )
    {
      return null
    }
    // S'il n'y a pas de paragraphe courant, on doit sélectionner le premier
    if( ! Parag.current)
    {
      return this.firstParag
    }

    if ( undefined === to ) { to = 1 }
    let
          i = 0
        , other
        , o = Parag.current.mainDiv

    for (; i < to ; ++i )
    {
      o = o.nextSibling
      if ( o ) { other = o }
      else { break }
    }

    if ( other )
    {
      return this.items[Number(other.getAttribute('data-id'))]
    }
    else
    {
      return this.lastParag
    }

  }

}

module.exports = Parags
