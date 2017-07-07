/*
  Test de l'affichage des panneaux à l'aide du tabulator "boutons-panneaux"
*/
PTests.expose_dom_methods()

class Waiter
{
  constructor ( expected, options )
  {
    this.expected = document.querySelector(expected)
    this.start_time = (new Date()).getTime()
    this.defaultize_options(options)
    console.log('this.start_time',this.start_time)
    this.end_time   = this.start_time + 1000 * this.options.timeout
    console.log('this.end_time',this.end_time)
    this.wait()
  }
  /**
  * La boucle d'attente
  **/
  wait ()
  {
    this.timer = setInterval(this.waitMethod.bind(this), this.options.checklaps)
  }
  get isOK ()
  {
    try
    {
      switch ( this.options.checkIf )
      {
        case 'visible':
          return this.expected.offsetParent !== null
        case 'not_visible':
          return this.expected.offsetParent === null
      }
    }
    catch(erreur)
    {
      console.log(erreur)
      return false
    }
  }

  waitMethod ()
  {
    if ( this.isOK )
    {
      // ========= C'EST BON ===========
      clearInterval( this.timer )
      this.follow()
    }
    else
    {
      if ( (new Date().getTime()) > this.end_time )
      {
        clearInterval(this.timer)
        if ( 'function' === typeof this.else_method )
        {
          console.log('Je joue run_else')
          this.run_else()
        }
        else
        {
          throw new Error("Le temps d'attente est malheureusement dépassé…")
        }
      }
    }
  }
  defaultize_options ( options )
  {
    if ( undefined === options ) { options = {} }
    if ( undefined === options.timeout )  { options.timeout = 30    }
    // Le laps de temps entre chaque vérification du DOM
    if ( undefined === options.checklaps) { options.checklaps = 100 }
    this.options = options
  }
  then ( method )
  {
    this.then_method = method
    return this
  }
  else ( method )
  {
    this.else_method = method
    return this
  }
  follow   () { this.then_method.call() }
  run_else () { this.else_method.call() }
}

function waitFor ( arg, opts )
{
  return new Waiter(arg, opts)
}
function waitForVisible( arg, opts) {
  console.log("J'attends que le tabulator soit focussé")
  if(!opts){opts={}}
  opts.checkIf = 'visible'
  return new Waiter(arg, opts)
}
function waitForNotVisible(arg,opts){
  if(!opts){opts={}}
  opts.checkIf = 'not_visible'
  return new Waiter(arg, opts)
}

describe("Affichage des panneaux",[
  , describe("le tabulator #boutons-panneaux", [
    , it("répond au focus", ()=>{
      let tabulator = DOM.get('tabulator#boutons-panneaux')
      expect('tabulator#boutons-panneaux').asNode.to.exist

      // On focus après 4 secondes
      let timer = setTimeout(()=>{
        console.log("Je focus sur le tabulator")
        clearTimeout(timer)
        tabulator.focus()
      }, 4000)

      waitForVisible('button[data-tab="notes"]').then( () => {
        puts( "Le menu est ouvert, yes!")
        console.log( "Le menu est ouvert, yes!")
      }).else( () => {
        puts( "Je n'ai pas pu faire le truc…")
        console.log( "Je n'ai pas pu faire le truc…")
      })
    })
  ])
])
