require('../../spec_helper.js')

describe('Parag', function () {
  describe('#read', function () {
    it('répond', function(){
      expect(parag1).to.respondsTo('read')
    });
    it('permet de lire la donnée dans le fichier', function(done){
      // ======= PRÉ-REQUIS =======
      panneauScenier.parags.add(parag1)
      parag1.modified = true
      // ======= PRÉ-VÉRIFICATIONS ========
      expect(parag1._modified,"le parag1 devrait être marqué modifié").to.be.true
      expect(parag1.startPos).to.equal(Parag._dataLengthInFile)
      assert.equal(parag1.panneau_id, 'scenier', "le parag1 devrait être associé au panneau 'scénier'")
      assert.equal(panneauScenier._modified,true, 'le panneau scénier devrait être marqué modifié')
      assert.equal(fs.existsSync(projet.parags_file_path),false,"Le fichier de données ne doit pas exister")
      // On enregistre
      projet.saveParags( function(){
        // ==== APRÈS L'ENREGISTREMENT ======
        assert.equal(fs.existsSync(projet.parags_file_path),true, 'Le fichier des données devrait exister')
        let contenuInitial = String(parag1._contents)
        parag1._contents  = ''
        parag1._ucontents = ''
        // ====== PRÉ-VÉRIFICATIONS =======
        expect(projet).to.respondsTo('readParag')
        expect(parag1.contents).to.equal('')
        // =======> TEST <======
        parag1.read( function(){
          expect(parag1.contents).to.equal(contenuInitial)
          done()
        })
      })
    });

  });
});
