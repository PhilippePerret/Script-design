/*
  Tous ces test échouent et c'est normal
*/

describe("Une suite de tests qui échouent")
  .context('En mode non strict')
    .it('1 est égal à "bonjour"', () => {
      expect(1).equals('bonjour')
    })
  .context('en mode strict')
    .it('1 est égal à "1"', () => {
      expect(1).strictly.equals('1')
        .and.strictly.greater_than(2)
        .and.strictly.less_than(-1)
    })
    .and('1 est strictement supérieur à 1', () => {
      expect(1).strictly.greater_than(1)
        .and.is.strictly.greater_than(1)
    })
    .and('1 est strictement inférieur à 1', () => {
      expect(1).strictly.less_than(1)
        .and.is.strictly.less_than(1)
    })
    .and('"bonjour" est égal à "Bonjour"', () => {
      expect('bonjour').equals('Bonjour')
    })
