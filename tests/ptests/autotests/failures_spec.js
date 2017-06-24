/*
  Tous ces test échouent et c'est normal
*/

describe("TOUS LES TESTS SUIVANTS DOIVENT ÉCHOUER")
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
      expect('bonjour').strictly.equals('Bonjour')
    })

describe('FAILURES POUR LA MÉTHODE between')
  .context('en mode non strict')
    .it('1 ne se trouve pas entre 0 et 2', () => {
      expect(1).not.between([0,2])
    })
    .it('1 ne se trouve pas entre 1 et 2', () => {
      expect(1).not.between([1,2])
    })
    .it('1 ne se trouve pas entre 1 et 1', () => {
      expect(1).not.between([1,1])
    })
  .context('en mode strict')
    .it('1 ne se trouve pas entre 0 et 2', () => {
      expect(1).not.strictly.between([0,2])
    })
    .it('1 se trouve entre 1 et 2', () => {
      expect(1).strictly.between([1,2])
    })
    .it('1 se trouve entre 1 et 1', () => {
      expect(1).strictly.between([1,1])
    })
