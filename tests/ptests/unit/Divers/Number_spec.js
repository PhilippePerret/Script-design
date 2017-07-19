/*

  Test des extensions de Number
*/
let path = require('path')
require(path.resolve(path.join('.','lib','utils','Number.js')))

describe("Number",[
  , describe("#as_pages",[
    , it("répond", ()=>{
      expect(12).asInstanceOf(Number).to.respond_to('as_pages')
    })
    , it("retourne 1 si on donne 60 secondes", ()=>{
      expect(Number(60).as_pages(),'Number(60).as_pages()').to.equal(1)
    })
    , it("return 2,5 si on donne 150", ()=>{
      expect(Number(150).as_pages(),'Number(150).as_pages()').to.equal(2.5)
    })
  ])
  , describe("#as_seconds",[
    , it("répond", ()=>{
      expect("String").asInstanceOf(String).to.respond_to('as_seconds')
    })
    , it("retourne un nombre valide avec une horloge sans ':' (seulement secondes)", ()=>{
      let h = {
        30: '0:30', 3: '0:03', 59: '0:59'
      }
      for(let n in h){
        expect(h[n].as_seconds(),`${h[n]}.as_seconds()`,{values:true}).to.equal(n)
      }
    })
  ])
  , describe("#as_horloge",[
    , it("répond", ()=>{
      expect(30).asInstanceOf(Number).to.respond_to('as_horloge')
    })
    , it("retourne une horloge valide quand on donne un nombre de secondes < 1 minute", ()=>{
      let h = {
        30: '0:30', 3: '0:03', 59: '0:59'
      }
      for(let n in h){
        expect(Number(n).as_horloge(),`Number(${n}).as_horloge()`,{values:true}).to.equal(h[n])
      }
    })
    , it("retourne une horloge valide avec un nombre de secondes < 1 heure", ()=>{
      let h = {
        60: '1:00', 120: '2:00', 133:'2:13', 123:'2:03', 3599: '59:59'
      }
      for(let n in h){
        expect(Number(n).as_horloge(),`Number(${n}).as_horloge()`).to.equal(h[n])
      }
    })
    , it("retourne une horloge valide avec un nombre de secondes > 1 heure", ()=>{
      let h = {
        3600: '1:00:00', 3601: '1:00:01', 3662:'1:01:02', 4201:'1:10:01', 7811:'2:10:11'
      }
      for(let n in h){
        expect(Number(n).as_horloge(),`Number(${n}).as_horloge()`).to.equal(h[n])
      }
    })
  ])
])

describe("Class Number",[
  , describe("::s2h",[
    , it("répond", ()=>{
      expect(Number).to.respond_to('s2h')
    })
    , it("retourne le nombre de secondes sous forme d'horloge", ()=>{
      let h = {
        30: '0:30', 3: '0:03', 59: '0:59',
        60: '1:00', 120: '2:00', 133:'2:13', 123:'2:03', 3599: '59:59',
        3600: '1:00:00', 3601: '1:00:01', 3662:'1:01:02', 4201:'1:10:01', 7811:'2:10:11'
      }
      for(let n in h){
        expect(Number.s2h(n),`Number.s2h(${n})`).to.equal(h[n])
      }
    })
  ])
])

describe("Class String",[
  , describe("::h2s",[
    , it("répond", ()=>{
      expect(String).to.respond_to('h2s')
    })
    , it("retourne l'horloge sous forme de nombre de secondes", ()=>{
      let h = {
        30: '0:30', 3: '0:03', 59: '0:59',
        60: '1:00', 120: '2:00', 133:'2:13', 123:'2:03', 3599: '59:59',
        3600: '1:00:00', 3601: '1:00:01', 3662:'1:01:02', 4201:'1:10:01', 7811:'2:10:11'

      }
      for(let n in h){
        expect(String.h2s(h[n]),`String.h2s(${h[n]})`).to.equal(n)
      }

    })
  ])
])
