require('../../spec_helper.js')

describe.only('Parag', function () {
  describe('#build', function () {
    it('répond', function(){
      resetTest({nombre_parags:2})
      expect(parag0).to.respondsTo('build')
    });
    it('retourne un élément DOM valide pour le paragraphe', function(){
      res = parag0.build()
      expect(res).to.haveTag('div', {id: 'p-0', class:'p', 'data-id': '0'})
      // res = parag0.build().querySelector('div#p-0')
      res = res.querySelector('div#p-0-contents')
      expect(res).to.haveTag('div', {id:'p-0-contents', class:'p-contents', text: parag0.contents})
    })
  })
})
