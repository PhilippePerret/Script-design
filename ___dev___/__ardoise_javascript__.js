// let path  = require('path')
// let fs    = require('fs')

require('../lib/utils/Number')

let res = "FIN"

let id = 31

hex = id.toBase32()

hex = 'q'
res = hex.fromBase32()

console.log("hex = ", hex)
console.log(res)
