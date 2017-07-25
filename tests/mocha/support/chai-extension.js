/*

  Mes extensions pour chai

*/
const Assertion = require('chai').Assertion
const DOMTest   = require('./Dom')

const plugin = function plugin(chai, utils) {
  Assertion.addMethod('haveTag', function assertion(tag, attrs){
    const self = this
    // console.log('this = ', this)
    var obj = utils.flag(self, 'object') // => HTMLElement

    attrs.tag = tag
    let resultat = DOMTest.actualTagContainsExpect(obj, attrs)
    // console.log('resultat',resultat)
    if ( resultat.success )
    {
      return true
    }
    else
    {
      // En cas d'erreur on construit le texte
      var asSource = obj.outerHTML.replace(/[\n\r]/g,'')
      if (asSource.length > 80){
        asSource = asSource.substr(0,60) + '...' + asSource.substr(-20, 20)
      }
      let attrsStr = '' ; nombre_fois = '' ; texte = ''
      delete attrs.tag
      if ( attrs ){
        if ( attrs.count ) {nombre_fois = `${attrs.count}: ` ; delete attrs.count}
        if ( attrs.text  ) {texte = `${attrs.text}</${tag}>` ; delete attrs.text }
        if ( attrs )
        {
          attrsStr = []
          for(let a in attrs){if (attrs.hasOwnProperty(a)){attrsStr.push(`${a}="${attrs[a]}"`)}}
          attrsStr = ' ' + attrsStr.join(' ')
        }
      }
      var expAsStr = `${nombre_fois}<${tag}${attrsStr}>${texte}`

      throw new Error(resultat.error)
      // throw new Error(`${resultat.error} dans ${asSource} (search for ${expAsStr})`)
    }
  })
}
module.exports = plugin
