/** ---------------------------------------------------------------------
  *   class Parag
  *   ------------
  *   Classe des textes en tant qu'entité {Parag}
  *   Dans l'application, tous les textes des projets sont des Parag(s),
  *   que ce soit un paragraphe de synopsis ou un évènement du scénier.
  *
  *   Despite its name, a <Parag> can own several real paragraphs.
  *
*** --------------------------------------------------------------------- */

class Parag
{
  constructor (data)
  {
    this.data = data
    this.dispatch(data)
  }

  /** ---------------------------------------------------------------------
  *   DATA Methods
  *
  **/
  dispatch (data)
  {
    for(let prop in data){
      if(!data.hasOwnProperty(prop)){continue}
      this[prop]=data[prop]
    }
  }

  /** ---------------------------------------------------------------------
    * DOM Methods
  **/

  /**
  * Build Dom element for parag
  *
  * @return {HTMLDivElement} L'élément construit.
  **/
  build ()
  {
    let div = DOM.create('div', {class:'p', id: `p-${this.id}`, inner: this.contents})
    return div
  }

  parseXML ()
  {
    let text = "<div id='mon-id' class='sa-classe-css'>Mon contenu</div>"
    let parser = new DOMParser()
    let parsed = parser.parseFromString(text,"text/xml")
    console.log('--- xml parsed ---')
    log('--- xml parsed ---')
    console.log(parsed)
    log(parsed)
    console.log('--- /xml parse ---')
    log('--- /xml parse ---')
    // let firstDiv = parsed.getElementById('mon-id')
    let firstDiv = parsed.getElementsByTagName('div')[0]
    log('--- mon-id ---')
    console.log('--- mon-id ---')
    log(firstDiv)
    console.log(firstDiv)
    log('Son ID : ', firstDiv.id)
    log('Sa classe :', firstDiv.className)
    log('Sa class par attribute', firstDiv.getAttribute('class'))
    log('--- /mon-id ---')
    console.log('--- /mon-id ---')

  }
}

module.exports = Parag
