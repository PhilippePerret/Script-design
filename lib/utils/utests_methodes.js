/*
  L'idée pour les tests est la suivante : on allonge les classes pour leur
  adjoindre des prototypes qui sont les tests.

  Par exemple, on a la classe Store et les instances store.

  J'ajoute dans les tests…

  Store.prototype.respond_to = function(methode)
  {

  }

  … qui est un test pour savoir si l'instance Store répond à la méthode +methode+

  Store.prototype.respond_to = PTest.respond_to

  class PTest {
    respond_to (methode) {
      if (positive)
      {
        test('function', typeof this[methode], 'répond à', 'devrait répondre à')
      }
      else
      {
        test('function', typeof this[methode], 'ne répond pas à', 'devrait répondre à')
      }
    }
  }
*/

//
// /*
//
// Essayer d'exposer les méthodes avec :
//
// Et voir si en require('utests_methodes') on obtient ces méthodes
// exports.isFunction
// etc.
//
// */
//
//
// define(
//   [],function(){
//
//     // Pour exposer des méthodes à un renderer
//
//     window.isFunction = function(actual)
//     {
//       if ('function' === typeof actual)
//       {
//         return null
//       }
//       else
//       {
//         return `l'élément est de type ${typeof actual}`
//       }
//     }
//
//     window.isObject = function(actual)
//     {
//       if ( 'object' === typeof actual ) { return null }
//       else
//       {
//         return `l'élément est de type ${typeof actual}`
//       }
//     }
//
//   }
// )
