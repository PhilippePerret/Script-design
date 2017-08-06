// let path  = require('path')
// let fs    = require('fs')

require('../lib/utils/Number')

let res = {un:'1', deux:'2'}
forEach(res, (v, k) => { console.log("La clé %s vaut %s", k, v)})

console.log("Les clés sont : ", map(res, (v, k) => { return k }))

// console.log(res)
