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
      // puts(`Le paragraphe : ${res.outerHTML.replace(/</,'&lt;')}`)

      // On teste le contenu conforme du HTMLDivElement retourné par build
      expect(res,'le code HTML du parag').to.have
        .tag('div', {
            class :'p'
          , id    :'p-1021'
          , children: [
            ['div',{class:'p-content', id:'p-content-1021', text:paragContentDisplay}],
            ['input',{type:'hidden',value:'1021',id:'p-id'}]
          ]
        })

    })
  ])
])
