// let path  = require('path')
// let fs    = require('fs')

let res = "FIN"

let id = 1000

hex = id.toBase32()
res = hex.fromBase32()

console.log("hex = ", hex)
console.log(res)
