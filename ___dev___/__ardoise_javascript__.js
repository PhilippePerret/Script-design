// let path  = require('path')
// let fs    = require('fs')

require('../lib/utils/Number')

let res = []
let Brins = {items:null}

Brins.items = new Map([
    [0, {type: 62, hname: "62"}]
  , [1, {type: 35, hname: "35"}]
  , [2, {type: 102, hname: "102"}]
  , [3, {type: 62, hname: "62 autre"}]
  , [4, {type: 62, hname: "62 troisième"}]
])

// On classe
let bsg = new Map()
  , lt  = []
Brins.items.forEach((v,k) => {
  if (undefined === bsg.get(v.type))
    { bsg.set(v.type,[]);lt.push(v.type) }
  bsg.get(v.type).push(v)
})
lt.sort(function(a,b){ return a - b})
let brins_grouped = lt.map(type => { return bsg.get(type) })

res = brins_grouped

console.log(res)
