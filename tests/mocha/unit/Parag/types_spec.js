/*

  Test des types

*/
describe.only('Types de parag', function () {
  describe('@types', function () {
    it("existe", function(){
      expect(parag0.types).not.to.be.undefined
    })
    it("retourne une instance d'objet Parag.Types", function(){
      expect(parag0.types).to.be.instanceOf(ParagTypes)
    })
  });

  describe('Parag#types.data', function () {
    it("existe", function(){
      expect(parag1.types.data).not.to.be.undefined
    })
    it("retourne 0000 par défaut", function(){
      parag1.types._data = undefined
      expect(parag1.types.data).to.equal('0000')
    })
  });

  describe('Parag#types.data=', function () {
    it("existe", function(){
      expect(()=>{parag7.types.data='1234'}).not.to.throw()
    })
    it("permet de définir la nouvelle donnée", function(){
      expect(parag7.types._data).to.equal('1234')
      parag7.types.data = '2345'
      expect(parag7.types._data).to.equal('2345')
    })
    it("permet de redéfinir les 4 valeurs 32 des typesX", function(){
      parag7.types.data = 'abcd'
      expect(parag7.types.type1_b32).to.equal('a')
      expect(parag7.types.type2_b32).to.equal('b')
      expect(parag7.types.type3_b32).to.equal('c')
      expect(parag7.types.type4_b32).to.equal('d')
    })
    it("permet de redéfinir les 4 valeurs décimales des typesX", function(){
      parag7.types.data = '1234'
      expect(parag7.types.type1).to.equal(1)
      expect(parag7.types.type2).to.equal(2)
      expect(parag7.types.type3).to.equal(3)
      expect(parag7.types.type4).to.equal(4)
      parag7.types.data = 'bcde'
      expect(parag7.types.type1).to.equal(11)
      expect(parag7.types.type2).to.equal(12)
      expect(parag7.types.type3).to.equal(13)
      expect(parag7.types.type4).to.equal(14)
    })
  });

  [1,2,3,4].forEach( (n) => {
    let ptype = `type${n}`

    describe(`Parag#types.${ptype}`, function () {
      it("existe", function(){
        parag3.types.data = '0123'
        expect(parag3.types[ptype]).not.to.be.undefined
      })
      it("retourne un nombre", function(){
        expect(typeof parag3.types[ptype]).to.equal('number')
      })
    });

    describe(`Parag#types.${ptype}_b32`, function () {
      it("existe", function(){
        expect(parag4.types[`${ptype}_b32`]).not.to.be.undefined
      })
      it("retourne une lettre", function(){
        expect(typeof parag4.types[`${ptype}_b32`]).to.equal('string')
      })
    });

    describe(`Parag#types.${ptype}=`, function () {
      it(`permet de définir le ${ptype}`, function(){
        let nombre = 20 + Number(n)
        parag5.types[ptype] = nombre
        expect(parag5.types[`_${ptype}`]).to.equal( nombre )
      })
      it("actualise le ptype 32", function(){
        let nombre = 25 + Number(n)
        parag6.types[ptype] = nombre
        expect(parag6.types[`_${ptype}_b32`]).to.equal( nombre.toBase32() )
      })
      it("actualise la data", function(){
        let nombre = 10 + Number(n)
        parag8.types[ptype] = nombre
        expect(parag8.types.data[Number(n) - 1]).to.equal( nombre.toBase32() )
      })
    });

  })
});
