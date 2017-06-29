/*
  L'idée, pour tester PTests.require_module, est de créer artificiellement un module pour le charger.
  Ou alors
*/

let Any = require_module('./lib/utils/PTests_Any')

describe("Méthode PTests.require_module",[
  , it("répond", ()=>{
    expect(PTests).to.have.classMethod('require_module')
  })
  , it("permet de charger un module quelconque", ()=>{
    let MaClasseTest = require_module('tests/ptests/support/assets/ma_classe_test')
    expect(MaClasseTest).to.be.classOf('function')
    // Si on fait une distinction plus tard :
    // expect(MaClasseTest).to.be.classOf('class')
    expect(MaClasseTest).to.have.instanceMethod('maMethodeDinstance')
  })
])
