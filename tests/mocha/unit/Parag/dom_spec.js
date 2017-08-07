require('../../spec_helper.js')

let res

describe('Parag', function () {
  describe('#build', function () {
    it('répond', function(){
      resetTest({nombre_parags:2})
      expect(parag0).to.respondsTo('build')
    });
  })
  describe('Construction du paragraphe', function(){
    before(function () {
      parag0.contents = "Un lien vers le PARAG#12."
      // ========> TEST <==========
      res = parag0.build()
    });
    it('retourne un élément DOM valide pour le paragraphe', function(){
      expect(res).to.haveTag('div', {id: 'p-0', class:'p', 'data-id': '0'})
      // res = parag0.build().querySelector('div#p-0')
      expect(res).to.haveTag('div', {id:'p-0-recto', class:'p-recto'})
    })

    it("indique qu'il a des relatifs s'il en a par un picto", function(){
      this.skip()
    })

    it("corrige les liens vers les autres parags dans le texte", function(){
      expect(res).to.not.haveTag('div', {id:'p-0-contents', text: /PARAG#12/})
      expect(res).to.haveTag('a', {text: '#12', onclick: 'return showParag(12)'})
    })

    it("contient un panneau arrière de données", function(){
      expect(res).to.haveTag('div', {id:'p-0-recto', class: 'p-recto'})
    })
  })
})
