// let path  = require('path')
// let fs    = require('fs')

require('../lib/utils/Number')

let res = ''

class MyCustomError extends Error {
  constructor(message) {
    super ( message )
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

try
{
  throw new MyCustomError("This is a big error")
}
catch ( err )
{
  if ( err.name == 'MyCustomError' )
  {
    console.log(err)
  }
  else
  {
    throw err
  }
}


console.log(res)
