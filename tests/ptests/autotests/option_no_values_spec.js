let
    res
  , resO = {not_a_test:true}

describe("Option no_values ou no_value",[
  , context("en valeur par défaut",[
    , context("quand c'est un succès",[
      , it("indique la valeur réelle dans le message", ()=>{
        res = expect(13,'le nombre d’œufs').is.greater_than(12,resO)
        expect(res.returnedMessage).to.contain('le nombre d’œufs (13) est égal ou supérieur à 12')
      })
    ])
    , context("quand c'est un échec",[
      , it("indique la valeur réelle dans le message", ()=>{
        res = expect(11,'le nombre d’œufs').equals(12,resO)
        expect(res.returnedMessage).to.contain('le nombre d’œufs (11) n’est pas égal à 12')
      })
    ])
  ])
  , context("avec la valeur false",[
    , context("quand c'est un succès",[
      , it("indique la valeur réelle dans le message", ()=>{
        res = expect(13,'le nombre d’œufs',{no_values:false}).is.greater_than(12,resO)
        expect(res.returnedMessage).to.contain('le nombre d’œufs (13) est égal ou supérieur à 12')
      })
    ])
    , context("quand c'est un échec",[
      , it("indique la valeur réelle dans le message", ()=>{
        res = expect(11,'le nombre d’œufs',{no_values:false}).equals(12,resO)
        expect(res.returnedMessage).to.contain('le nombre d’œufs (11) n’est pas égal à 12')
      })
    ])
  ])
  , context("avec la valeur true",[
    , context("quand c'est un succès",[
      , it("n'indique pas la valeur réelle dans le message", ()=>{
        res = expect(13,'le nombre d’œufs',{no_values:true}).is.greater_than(12,resO)
        expect(res.returnedMessage).to.contain('le nombre d’œufs est égal ou supérieur à 12')
      })
    ])
    , context("quand c'est un échec",[
      , it("n'indique pas la valeur réelle dans le message", ()=>{
        res = expect(11,'le nombre d’œufs',{no_values:true}).equals(12,resO)
        expect(res.returnedMessage).to.contain('le nombre d’œufs n’est pas égal à 12')
      })
    ])
  ])
])
