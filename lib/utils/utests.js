
define([
  C.DOM_MODULE_PATH
],function(
  DOM
){
    function isFunction(actual)
    {
      if ( 'function' === typeof actual ){ return null }
      else { return `__ACTUAL__ est de type ${typeof actual}` }
    }
    class It {
      static it (it_message, ask_methode)
      {
        let une_erreur = ask_methode.call()
        if ( null === une_erreur ){
          UTest.w.bind(UTest)(it_message, 'success')
        }
        else
        {
          UTest.w.bind(UTest)(`${it_message} : ${une_erreur}`, 'failure')
        }
        // Pour echainer les it
        return It
      } // fin de it
    }// Fin de class It

    class UTest
    {
      static describe ( described, methode )
      {
        this.w(described, 'describe')
        return It
      }
      static start ()
      {
        this.w('Démarrage des tests', 'notice')
      }
      static w(mess, type)
      {
        DOM.create('div',{in:'retours-tests', class:type, inner:mess})
      }

    }

    // Exposer describe
    window.describe = UTest.describe.bind(UTest)

    return UTest
})
