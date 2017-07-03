let
    res
  , resO = {not_a_test:true}
  , divContainer

divContainer = `
<div id="div-container">
  <a href="http://mon.lien.org">Vers mon lien</a>
  <a href="http://www.atelier-icare.net" class="mon-site mon-atelier">Atelier Icare</a>
  <a href="http://www.laboiteaoutilsdelauteur.fr" class="mon-site">B.O.A.</a>
  <div id="div-inner">Ce div est contenu</div>
  <section id="ma-section" class="la-section">
    <span id="mon-span" data-user="12">Mon span de valeur 12</span>
  </section>
</div>
`

// Mettre à true au cours du test pour voir un code complet (pendant qu'on
// implémente les choses)
// Permet de se concentrer sur un retour en particulier (un case en particulier)
let whole_message = false

function checkMess(resultat, message, not)
{
  // expect(resultat.returnedMessage,'returnedMessage').to.contains(message)
  if ( not )
  {
    expect(resultat.returnedMessage,'returnedMessage', {no_values:!whole_message} )
        .not.to.contains(message)

  } else {
    expect(resultat.returnedMessage,'returnedMessage', {no_values:!whole_message} )
        .to.contains(message)
  }
}
describe("PTests#have_tag",[
  , context("avec un tag valide",[
    , it("produit un succès si la tag a été trouvé", ()=>{
      res = expect(divContainer).to.have_tag('div',null,resO)
      expect(res.isOK).to.be.true
    })
    , it("produit un échec si la tag n'a pas été trouvé", ()=>{
      res = expect(divContainer).to.have_tag('inconnu',null,resO)
      expect(res.isOK).to.be.false
      checkMess(res, 'aucune balise &lt; INCONNU &gt; n’a été trouvée')
    })
  ])
  , context("avec un pseudo-élément invalide",[
    , it("le pseudo-élément * est interdit", ()=>{
      res = expect(divContainer).to.have_tag('*', null, resO)
      expect(res.isOK).to.be.false
      checkMess(res,'Le pseudo-élément « * » est interdit en valeur de tag.')
    })
  ])


  , context("avec une recherche de simple balise",[
    , it("produit un succès si le div la contient", ()=>{
      res = expect(divContainer).to.have_tag('a', null, resO)
      expect(res.isOK).to.be.true
      checkMess(res,'contient la balise &lt; A &gt;')
      res = expect(divContainer).to.have_tag('section',null,resO)
      checkMess(res,'contient la balise &lt; SECTION &gt;')
    })
    , it("produit un échec si le div ne la contient pas", ()=>{
      res = expect(divContainer).to.have_tag('fieldset',null,resO)
      expect(res.isOK).to.be.false
      checkMess(res,'aucune balise &lt; FIELDSET &gt; n’a été trouvée')
      res = expect(divContainer).to.have_tag('blockquote',null,resO)
      expect(res.isOK).to.be.false
      checkMess(res,'aucune balise &lt; BLOCKQUOTE &gt; n’a été trouvée')
    })
  ])




  , context("en cherchant un nombre précis d'éléments",[
    , it("produit un échec avec le bon message si le nombre d'éléments n'a pas été trouvé", ()=>{
      res = expect(divContainer).to.have_tag('a',{count:4},resO)
      expect(res.isOK).to.be.false
      checkMess(res,'4 éléments (au lieu de 3) auraient dû être trouvés')
    })
  ])



  , context("en cherchant au moins un certain nombre d'éléments",[
    , it("produit un échec si on ne trouve pas au moins le nombre d'éléments", ()=>{
      res = expect(divContainer).to.have_tag('a',{min_count:4},resO)
      expect(res.isOK).to.be.false
      checkMess(res,'au moins 4 éléments (au lieu de 3) auraient dû être trouvés')
    })
    , it("produit un succès si on trouve au moins le nombre d'éléments", ()=>{
      res = expect(divContainer).to.have_tag('a',{min_count:2},resO)
      expect(res.isOK).to.be.true
    })
  ])


  , context("en cherchant au plus un certain nombre d'éléments",[
    , it("produit un échec si on trouve plus d'éléments que voulus", ()=>{
      res = expect(divContainer).to.have_tag('a',{max_count:2}, resO)
      expect(res.isOK).to.be.false
      checkMess(res,'pas plus de 2 éléments (au lieu de 3) auraient dû être trouvés')
    })
    , it("produit un succès si on ne trouve pas plus d'éléments que voulus", ()=>{
      res = expect(divContainer).to.have_tag('a',{max_count:4},resO)
      expect(res.isOK).to.be.true
    })
  ])



  , context("en cherchant un texte à l'intérieur des balises",[
    , it("produit un échec si le text fourni n'est pas de type String ou RegExp", ()=>{
      [true, {un:"objet"}, ['une','liste']].forEach( (badtype) => {
        res = expect(divContainer).to.have_tag('a',{text:badtype},resO)
        expect(res.isOK).to.be.false
        checkMess(res,"le texte cherché doit être exclusivement de type {String} ou {RegExp}")
        checkMess(res,`il est de type {${badtype.constructor.name}}`)
      })
    })
    , it("produit un succès si le text {String} fourni est trouvé", ()=>{
      res = expect(divContainer).to.have_tag('a',{text:'Icare'}, resO)
      expect(res.isOK).to.be.true
      checkMess(res, 'contient la balise &lt; A &gt;')
      checkMess(res, 'avec le texte « Icare »')
    })
    , it("produit un succès si le text {RegExp} fourni est trouvé", ()=>{
      res = expect(divContainer).to.have_tag('a',{text:/I.a.e/}, resO)
      expect(res.isOK).to.be.true
      checkMess(res, 'contient la balise &lt; A &gt;')
      checkMess(res, 'avec le texte « /I.a.e/ »')
    })
  ])



  , context("en cherchant des attributs",[
    , it("produit un succès en trouvant l'identifiant", ()=>{
      res = expect(divContainer).to.have_tag('div',{id:"div-inner"},resO)
      expect(res.isOK).to.be.true
      checkMess(res,'contient la balise &lt; DIV &gt;')
      checkMess(res,'avec ID="div-inner"')
    })
    , it("produit un échec en ne trouvant pas l'identifiant", ()=>{
      res = expect(divContainer).to.have_tag('DIV',{id:'nexiste-pas'}, resO)
      expect(res.isOK).to.be.false
      checkMess(res,'ne contient pas la balise &lt; DIV &gt;')
      checkMess(res,'avec ID="nexiste-pas"')
    })
    , it("produit un succès en trouvant la class parmi une seule class", ()=>{
      res = expect(divContainer).to.have_tag('section',{class:'la-section'},resO)
      expect(res.isOK).to.be.true
      checkMess(res,'contient la balise &lt; SECTION &gt;')
      checkMess(res,'avec CLASS="la-section"')
    })
    , it("produit un succès en trouvant la class parmi plusieurs class", ()=>{
      res = expect(divContainer).to.have_tag('a',{class:'mon-site', count:2},resO)
      expect(res.isOK).to.be.true
      checkMess(res,'contient la balise &lt; A &gt; avec CLASS="mon-site"')
    })
    , it("produit un échec en ne trouvant la class", ()=>{
      res = expect(divContainer).to.have_tag('a',{class:'unknown-class'},resO)
      expect(res.isOK).to.be.false
      checkMess(res,'ne contient pas la balise &lt; A &gt; avec CLASS="unknown-class"')
    })
    , it("produit un succès en trouvant un attribut quelconque", ()=>{
      res = expect(divContainer).to.have_tag('span',{'data-user':'12'}, resO)
      expect(res.isOK).to.be.true
      checkMess(res,'contient la balise &lt; SPAN &gt; avec DATA-USER="12"')
    })
    , it("produit un échec en ne trouvant pas l'attribut quelconque", ()=>{
      res = expect(divContainer).to.have_tag('span',{'data-unknown':'12'}, resO)
      expect(res.isOK).to.be.false
      checkMess(res, 'ne contient pas la balise &lt; SPAN &gt; avec DATA-UNKNOWN="12"')
    })
    , it("produit un échec et retourne un message d'erreur correct avec des attributs trouvés et d'autres non", ()=>{
      res = expect(divContainer).to.have_tag('span',{'data-user':'12', 'data-unknown':'12' }, resO)
      expect(res.isOK).to.be.false
      checkMess(res,'ne contient pas la balise &lt; SPAN &gt; avec DATA-USER="12", DATA-UNKNOWN="12"')
    })
  ])


  , context("en recherchant des sous-enfants",[
    , it("produit un succès si les enfants sont trouvés", ()=>{
      res = expect(divContainer).to.have_tag('section', {id:'ma-section',children:[
        ['span',{id:'mon-span'}]
      ]}, resO)
      expect(res.isOK).to.be.true
      checkMess(res,'contient la balise &lt; SECTION &gt; avec ID="ma-section"')
      checkMess(res,'et contient une balise &lt; SPAN &gt; avec {"id":"mon-span"}')
    })
    , it("produit un échec si les enfants ne sont pas trouvés", ()=>{
      res = expect(divContainer).to.have_tag('section', {id:'ma-section',children:[
        ['div',{id:'div-inner'}]
      ]}, resO)
      expect(res.isOK).to.be.false
      checkMess(res,'ne contient pas la balise &lt; SECTION &gt;')
      checkMess(res,'qui contiendrait une balise &lt; DIV &gt; avec {"id":"div-inner"}')
    })
  ])
])
