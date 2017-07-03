/*
Tests unitaire de la classe Parag

 */

let
    path  = require('path')
  , Parag = require_module(path.join('.','__windows__/','_common_','js','Parag.js'))
  , paragContent = "Contenu du paragraphe\nSur deux lignes."
  , paragContentDisplay = 'Contenu du paragraphe<br>Sur deux lignes.'
  , parag = new Parag({contents:paragContent, id:1021})

PTests.expose_dom_methods()

describe("La class Parag",[
  , describe("#build",[
    , it("répond", ()=>{
      expect(parag).asInstanceOf(Parag).to.respond_to('build')
      expect(Parag).to.have.instanceMethod('build')
    })
    , it("retourne le code HTML conforme du parag", ()=>{
      let res = parag.build()
      expect(res,'parag.build() ->').to.be.classOf('htmldivelement')
      expect(res,'l’élément DOM du Parag').to.have_tag('div', {
          id        :'p-1021'
        , class     :'p'
        , 'data-id' : '1021'
        , children  : [
            // Paragraphe contenant le texte du paragraphe.
              ['div',{class:'p-contents', id:'p-1021-contents', text:paragContentDisplay}]
            // , ['input',{type:'hidden',value:'1021',id:'p-id'}]
          ]
        })
    })
  ])
])
