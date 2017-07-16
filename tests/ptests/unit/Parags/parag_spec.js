/*
Tests unitaire de la classe Parag

 */
 let path      = require('path')
 require(path.resolve(path.join('.','tests','ptests','support','unit','parags.js')))
 const oof = {only_on_fail: true}

let paragContent = "Contenu du paragraphe\nSur deux lignes."
  , paragContentDisplay = "Contenu du paragraphe\nSur deux lignes."
  , parag = new Parag({contents:paragContent, id:1021})

PTests.expose_dom_methods()

describe("La class Parag",[
  , describe("#build",[
    , it("répond", ()=>{
      expect(parag).asInstanceOf(Parag).to.respond_to('build')
    })
    , it("retourne le code HTML conforme du parag", ()=>{
      let res = parag.build()
      // puts(res.inspect())
      expect(res,'parag.build() ->').to.be.classOf('htmldivelement')
      expect(res,'l’élément DOM du Parag').to.have_tag('div', {
          id        :'p-1021'
        , class     :'p'
        , 'data-id' : '1021'
        , children  : [
            // Ci-dessous, avec les changements futurs, il peut y avoir une erreur
            ['div',{class:'p-contents', id:'p-1021-contents', text:new RegExp(paragContentDisplay)}]
          ]
        })
    })
  ])
])
