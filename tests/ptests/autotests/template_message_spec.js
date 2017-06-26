/*

  Pour tester les messages de template qui peuvent être explicitement fourni

*/
log('-> template_message_spec.js')

let res, mes, opts

describe('Contrôle général des messages de rapport du test',[
  , describe("Messages en cas de succès",[
    , context('sans message template ni valeur-pseudo',[
      , it('écrit le message normal', () => {
        res = expect(4).equals(4, {not_a_test:true}).returnedMessage
        expect(res, 'le retour de "equal"').contains('4 est égal à 4', {no_values: true})
      })
    ])
    , context('avec des valeurs pseudo', [
      , context('en indiquant la valeur réelle (défaut)', [
        , it('écrit le message avec la valeur-pseudo de l’actual si elle est fournie', () => {
          res = expect(4,'le nombre d’œufs').equals(4, {not_a_test:true}).returnedMessage
          expect(res,'le retour de "equals"').contains('le nombre d’œufs (4) est égal à 4')
        })
        , it('écrit le message avec la valeur-pseudo de l’expected si elle est fournie', () => {
          res = expect(4).equals(4, 'le nombre d’œufs', {not_a_test:true}).returnedMessage
          expect(res,'le retour de "equals"').contains('4 est égal à le nombre d’œufs (4)')
        })
        , it('écrit le message avec les deux valeurs-pseudo si elles sont fournies', () => {
          res = expect(4,'le nombre de pots').equals(4, 'le nombre d’œufs', {not_a_test:true}).returnedMessage
          expect(res,'le retour de "equals"').contains('le nombre de pots (4) est égal à le nombre d’œufs (4)')
        })
      ])
      , context('sans indiquer la valeur réelle (no_values: true)', [
        , it('écrit le message avec la valeur-pseudo de l’actual si elle est fournie', () => {
          res = expect(4,'le nombre d’œufs').equals(4, {not_a_test:true, no_values:true}).returnedMessage
          expect(res,'le retour de "equals"').contains('le nombre d’œufs est égal à 4')
        })
        , it('écrit le message avec la valeur-pseudo de l’expected si elle est fournie', () => {
          res = expect(4).equals(4, 'le nombre d’œufs', {not_a_test:true, no_values:true}).returnedMessage
          expect(res,'le retour de "equals"')
            .contains('4 est égal à le nombre d’œufs')
            .and.not.contains('le nombre d’œufs (4)')
        })
        , it('écrit le message avec les deux valeurs-pseudo si elles sont fournies', () => {
          res = expect(4,'le nombre de pots').equals(4, 'le nombre d’œufs', {not_a_test:true, no_values:true}).returnedMessage
          expect(res,'le retour de "equals"').contains('le nombre de pots est égal à le nombre d’œufs')
        })
      ])
    ])
    , context('avec des messages templates',[
      , context('sans indiquer de valeur-pseudo',[
        it('utilise le message template fourni en remplaçant __ACTUAL__ et __EXPECTED__', () => {
          mes = '__EXPECTED__ = __ACTUAL__'
          res = expect(12).equals(12,{not_a_test:true, template:{success:mes}})
          expect(res.returnedMessage).to.contain("12 = 12")
        })
      ])
      , context('en donnant des valeurs-pseudo', [
        , context('en indiquant la valeur réelle (défaut)', [
          , it('remplace correctement le __ACTUAL__', () => {
              mes = "__ACTUAL__ = __EXPECTED__"
              res = expect(12, 'les haricots').equals(12,{not_a_test:true, template:{success:mes}})
              expect(res.returnedMessage).to.contain('les haricots (12) = 12')
            })
          , it('remplace correctement le __EXPECTED__', () => {
            mes = "__ACTUAL__ = __EXPECTED__"
            res = expect(12).equals(12,'les haricots',{not_a_test:true, template:{success:mes}})
            expect(res.returnedMessage).to.contain('12 = les haricots (12)')
          })
          , it('remplace correctement les deux valeurs', () => {
            mes = "__ACTUAL__ sont au nombre des __EXPECTED__"
            res = expect(12, 'fourmis').equals(12,'haricots',{not_a_test:true, template:{success:mes}})
            expect(res.returnedMessage).to.contain('fourmis (12) sont au nombre des haricots (12)')
          })
        ])
        , context('sans indiquer la valeur réelle (option no_values: true)', [
          , it('remplace correctement le __ACTUAL__', () => {
              mes = "__ACTUAL__ = __EXPECTED__"
              opts = {not_a_test:true, no_values: true, template:{success:mes}}
              res = expect(12, 'les haricots').equals(12,opts)
              expect(res.returnedMessage).to.contain('les haricots = 12')
            })
          , it('remplace correctement le __EXPECTED__', () => {
            mes = "__ACTUAL__ = __EXPECTED__"
            opts = {not_a_test:true, no_values: true, template:{success:mes}}
            res = expect(12).equals(12,'les haricots',opts)
            expect(res.returnedMessage).to
              .contain('12 = les haricots')
              .and.not.contain('les haricots (12)')
          })
          , it('remplace correctement les deux valeurs', () => {
            mes = "__ACTUAL__ sont au nombre des __EXPECTED__"
            opts = {not_a_test:true, no_values: true, template:{success:mes}}
            res = expect(12, 'fourmis').equals(12,'haricots',opts)
            expect(res.returnedMessage).to
              .contain('fourmis sont au nombre des haricots')
              .and.not.contain('haricots (12)')
          })
        ])
      ])
    ])
  ])
  , describe("Messages en cas d'échec",[
    , context('sans message template et sans valeur-pseudo (défaut)',[
      it('retourne le message d’échec par défaut', () => {
        mes = expect(12).to.equal(10, {not_a_test:true}).returnedMessage
        expect(mes).to.contain("12 n’est pas égal à 10")
      })
    ])
    , context('avec des valeurs-pseudo', [
      , context('en indiquant les valeurs réelles (défaut)', [
        , it('remplace l’actual par la valeur-pseudo fournie', () => {
            mes = expect(12, "l’âge du capitaine").to.equal(10, {not_a_test:true}).returnedMessage
            expect(mes).to.contain("l’âge du capitaine (12) n’est pas égal à 10")
          })
        , it('remplace l’expected par la valeur-pseudo fournie', () => {
          mes = expect(12).to.equal(10, "l’âge du capitaine", {not_a_test:true}).returnedMessage
          expect(mes).to.contain("12 n’est pas égal à l’âge du capitaine (10)")
          })
        , it('remplace les deux valeur par les valeurs-pseudo fournies', () => {
          mes = expect(12, "l’âge de Marion").to.equal(100, "l’âge du capitaine", {not_a_test:true}).returnedMessage
          expect(mes).to.contain("l’âge de Marion (12) n’est pas égal à l’âge du capitaine (100)")
          })
      ])
      , context('sans indiquer les valeurs réelles (option `no_values: true`)',[
        , it('remplace l’actual par la valeur-pseudo fournie', () => {
            mes = expect(12, "l’âge du capitaine").to.equal(10, {not_a_test:true, no_values:true}).returnedMessage
            expect(mes).to.contain("l’âge du capitaine n’est pas égal à 10")
          })
        , it('remplace l’expected par la valeur-pseudo fournie', () => {
          mes = expect(12).to.equal(10, "l’âge du capitaine", {not_a_test:true, no_values:true}).returnedMessage
          expect(mes)
            .contains("12 n’est pas égal à l’âge du capitaine")
            .and.not.contain("l’âge du capitaine (10)")
          })
        , it('remplace les deux valeurs par les valeurs-pseudo fournies', () => {
          mes = expect(12, "l’âge de Marion").to.equal(100, "l’âge du capitaine", {not_a_test:true, no_values:true}).returnedMessage
          expect(mes).to.contain("l’âge de Marion n’est pas égal à l’âge du capitaine")
            .and.not.contain("l’âge du capitaine (100)")
          })
      ])
    ])
    , context('avec des messages templates',[
      , context('sans valeurs-pseudo', [
        , it('remplace correctement le template', () => {
          mes   = "__EXPECTED__ devrait valoir __ACTUAL__."
          opts  = {not_a_test:true, template:{failure:mes}}
          res   = expect(12).equals(5, opts)
          expect(res.returnedMessage).contains("5 devrait valoir 12.")
        })
      ])
      , context('avec des valeurs pseudo',[
        , context('en indiquant la valeur réelle (défaut)', [
          , it('remplace correctement le template et l’actual', () => {
            mes   = "__EXPECTED__ devrait valoir __ACTUAL__."
            opts  = {not_a_test:true, template:{failure:mes}}
            res   = expect(12, 'la douzaine').equals(5, opts)
            expect(res.returnedMessage).contains("5 devrait valoir la douzaine (12).")
          })
          , it("remplace correctement le template et l'expected", () => {
            mes   = "__EXPECTED__ devrait valoir __ACTUAL__."
            opts  = {not_a_test:true, template:{failure:mes}}
            res   = expect(12).equals(5, 'le quintal', opts)
            expect(res.returnedMessage).contains("le quintal (5) devrait valoir 12.")
          })
          , it("remplace correctement le template et les deux valeurs", () => {
            mes   = "__EXPECTED__ devrait valoir __ACTUAL__."
            opts  = {not_a_test:true, template:{failure:mes}}
            res   = expect(12, 'la douzaine').equals(5, 'le quintal', opts)
            expect(res.returnedMessage).contains("le quintal (5) devrait valoir la douzaine (12).")
          })
        ])
        , context('sans indiquer la valeur réelle (option no_values:true)',[
          , it('remplace correctement le template et l’actual', () => {
            mes   = "__EXPECTED__ devrait valoir __ACTUAL__."
            opts  = {not_a_test:true, no_values:true, template:{failure:mes}}
            res   = expect(12, 'la douzaine').equals(5, opts)
            expect(res.returnedMessage).contains("5 devrait valoir la douzaine.")
          })
          , it("remplace correctement le template et l'expected", () => {
            mes   = "__EXPECTED__ devrait valoir __ACTUAL__."
            opts  = {not_a_test:true, no_values:true, template:{failure:mes}}
            res   = expect(12).equals(5, 'le quintal', opts)
            expect(res.returnedMessage).contains("le quintal devrait valoir 12.")
          })
          , it("remplace correctement le template et les deux valeurs", () => {
            mes   = "__EXPECTED__ devrait valoir __ACTUAL__."
            opts  = {not_a_test:true, no_values:true, template:{failure:mes}}
            res   = expect(12, 'la douzaine').equals(5, 'le quintal', opts)
            expect(res.returnedMessage).contains("le quintal devrait valoir la douzaine.")
          })
        ])
      ])
    ])
  ])
])
