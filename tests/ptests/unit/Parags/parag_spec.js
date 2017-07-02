/*
Tests unitaire de la classe Parag

 */

let
    path  = require('path')
  , Parag = require_module(path.join('.','__windows__/','_common_','js','Parag.js'))
  , parag = new Parag({contents:'Contenu du paragraphe', id:1021})

PTests.expose_dom_methods()

describe("La class Parag",[
  , describe("#build",[
    , it("répond", ()=>{
      expect(parag).asInstanceOf(Parag).to.respond_to('build')
      expect(Parag).to.have.instanceMethod('build')
    })
    , it("tourne le code HTML du parag", ()=>{
      let res = parag.build()
      expect(res,'parag.build() ->').to.be.classOf('htmldivelement')
      console.log(parag.parseXML()) // voir le code XML
      puts(`Le paragraphe : ${res.outerHTML.replace(/</,'&lt;')}`)
      // expect(res,'le code HTML du parag').to.have.tag('div', {class:'p', id:'p-1021'})
    })
  ])
])
