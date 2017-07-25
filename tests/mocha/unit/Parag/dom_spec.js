require('../../spec_helper.js')

describe('Parag', function () {
  describe('#build', function () {
    it('répond', function(){
      expect(parag0).to.respondsTo('build')
    });
    it.only('retourne le code voulu', function(){
      res = parag0.build()
      expect(res).to.haveTag('div', {id: 'p-0', class:'p', count:2})
    });

  });
});
