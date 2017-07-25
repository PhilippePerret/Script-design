/*

  Mes extensions pour chai

*/
const Assertion = require('chai').Assertion
const DOMTest   = require('./Dom')

const plugin = function plugin(chai, utils) {
  Assertion.addMethod('haveClass', function assertion(classes){
    const self = this
    const obj = utils.flag(self, 'object') // => HTMLElement
    if (!obj || !(obj.constructor.name.startsWith('HTML'))){
      throw new Error('Actual should be an HTML Element.')
    }
    if (! Array.isArray(classes)){classes = [classes]}
    if ( 'string' !== typeof classes[0] ){
      throw new Error('Class should be a String')
    }
    let objClasses = obj.className.split(' ')
    for (let classe of classes ){
      if ( objClasses.indexOf(classe) < 0 ){
        throw new Error(`${obj} doesn't own class '${classe}'`)
      }
    }
    return true
  })
  Assertion.addMethod('haveTag', function assertion(tag, attrs){
    const self = this
    // console.log('this = ', this)
    var obj = utils.flag(self, 'object') // => HTMLElement
    if ( ! obj ) { throw new Error('Actual is null.') }
    attrs.tag = tag
    let resultat = DOMTest.actualTagContainsExpect(obj, attrs)
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
      resultat.error = String(resultat.error).replace(/_ACTUAL_/g, expAsStr)
      throw new Error(resultat.error)
    }
  })
}
module.exports = plugin
