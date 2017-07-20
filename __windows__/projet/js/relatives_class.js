let moment = require("moment")

class Relatives
{
  constructor (iprojet)
  {
    this.projet = iprojet
  }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes publiques
    *
  *** --------------------------------------------------------------------- */

  /**
  * Ajout d'un paragraphe, sans association, dans la donnée des
  * relatives. Méthode appelée à la création du paragraphe pour qu'il soit
  * pris en compte dans les relatives.
  **/
  addParag (iparag)
  {
    this.data.relatives[String(iparag.id)] = {
        "i" : iparag.id
      , "t" : Projet.PANNEAUX_DATA[iparag.panneau_id].oneLetter
      , "r" : {} // les relatifs
    }
    // On réinitialise ses données relatives
    this.resetParag(iparag)
    // Note : on enregistrera les relatives que lorsqu'on sauvera
    // les paragraphes. On note simplement ici que relatives a été modifié
    this.modified = true
  }

  resetParag( iparag )
  {
    if ( iparag )
    {
      delete iparag._data_relatives
      delete iparag._relatifs
    }
  }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes fonctionnelle
    *
  *** --------------------------------------------------------------------- */
  save ()
  {
    this.data.updated_at = moment().format()
    this.store.set( this.data )
    this.modified = false
  }

  get data ()
  {
    this._data || ( this._data = this.store.data )
    return this._data
  }

  /**
  * Raccourci à data['relatives'] pour pouvoir faire :
  *     `projet.relatives.all`
  **/
  get all () { return this.data.relatives }

  get defaultData () {
    return {
        'created_at': moment().format()
      , 'updated_at': moment().format()
      , 'relatives' : {}
    }
  }

  get store ()
  {
    this._store || (this._store = new Store(this.relative_path, this.defaultData))
    return this._store
  }
  get relative_path ()
  { return path.join('projets',this.projet.id,'relatives') }

  /**
  * Premier temps de l'association, on regroupe les paragraphes par
  * panneau.
  **/
  associate_groupByPanneau( parags )
  {
    let hrelates = {}
    parags.forEach( (parag) => {
      if ( undefined === hrelates[parag.panneau_id] ){
        hrelates[parag.panneau_id] = []
      }
      // On ajoute l'identifiant à cette liste
      hrelates[parag.panneau_id].push(parag.id)
    })
    return hrelates
  }

  /**
  * Sous-méthode de `associate` qui retourne le paragraphe de référence.
  *
  * @return {Array} [hash-référent, hash-relatives]
  *
  **/
  associate_getReferent ( hrelates )
  {
    let erreurNoReferent  = false
      , referent          = null
      , pan

    for ( pan in hrelates )
    {
      if ( hrelates[pan].length == 1 )
      {
        referent = { panneau: pan, id: hrelates[pan][0] }
        delete hrelates[pan]
        break
      }
    }

    if ( ! referent )
    {
      alert("Plusieurs parags ont été sélectionnés dans les deux panneaux. Je n'ai donc aucun référent. Il faut sélectionner un seul élément dans l'un des panneaux (le référent) et un ou plusieurs dans l'autre.")
    }
    // Noter que hrelates est modifié par référence
    return referent
  }

  /**
  * Sous-méthode `associate` qui retourne true si l'opération d'association est
  * impossible entre les éléments fournis.
  **/
  associate_Impossible ( referent, hrelates )
  {
    let ref_id          = referent.id
      , ref_pan         = referent.panneau
      , ref_pan_letter  = Projet.PANNEAUX_DATA[ref_pan].oneLetter
      , pan
      , my = this
    try
    {

      for ( pan in hrelates )
      {
        hrelates[pan].forEach( (other_id) => {

          // * Impossible si on essaie d'associer un paragraphe à lui-même *
          // Note : cela ne peut arriver que si on s'est trompé d'identifiant
          if ( other_id === ref_id )
          {
            throw new Error(`Le parag #${ref_id} ne peut être associé à lui-même`)
          }

          // * Association impossible si les paragraphes sont déjà associés *
          if ( this.areRelatifs(ref_id, other_id) )
          {
            throw new Error(`Les parags #${ref_id} et #${other_id} sont déjà relatifs.`)
          }

          // Si l'other est déjà associé à un élément de même type que
          // le référent, il faut que cette association ne comporte que lui
          // S'il y a deux ou plusieurs autres associés de même type, l'association
          // est impossible car il y aurait (au moins) 2 parags d'un panneau
          // associés à 2 parags d'un autre (selon le principe d'unicité du
          // référent, c'est impossible).
          // Donc :
          //  other est associé à un élément de même type que le référent
          //  p.e.  référent est une scène (type "scenier")
          //        l'other de type "notes" est associé à P1 de type scenier
          //        Si P1 est associé seulement à la note other, pas de
          //        problème, on aura simplement la note other associée à ces
          //        deux paragraphes.
          //        En revanche, si P1 est associé à plus d'une note, on signale
          //        une impossibilité
          let data_other = my.data.relatives[String(other_id)]

          if ( ! data_other )
          {
            throw new Error(`Le paragraphe #${other_id} n'a pas de données relatives… Dans ${JSON.stringify(my.data.relatives)}`)
          }
          let lpan_other = data_other['t']
            , rels_other = data_other['r']
          if ( undefined !== rels_other[ref_pan_letter] )
          {
            // <= l'other connait déjà une association avec au moins un
            //    élément de même type que le référent
            // => Il faut voir si les associés sont relatifs de plus d'un
            //    élément de même type
            rels_other[ref_pan_letter].forEach( (mpid) => {
              let data_meme = my.data.relatives[String(mpid)]
                , rels_meme = data_meme['r'][lpan_other]
              if ( rels_meme && rels_meme.length > 1 )
              {
                // => ERREUR
                throw new Error(`Selon le principe d'unicité du référent, il est impossible d'associer les parags #${ref_id} et #${other_id}, on obtiendrait 2 parags d'un même panneau avec 2 référents différents.`)
              }
            })
          }

        })// fin de forEach sur chaque élément du panneau `pan`
      }

      // Tout est OK, on peut retourner false
      return false
    }
    catch(erreur)
    {
      alert(erreur.message) // Attention : sert au test et à donner une alerte à l'user
      // console.log(erreur)
      return true
    }
  }

  /**
  * @return true si le parag +pid1+ et associé au parag +pid2+
  *
  * @param {Number} pid1 Identifiant du premier paragraphe ou {Parag}
  * @param {Number} pid2 Identifiant du second paragraphe ou {Parag}
  **/
  areRelatifs (pid1, pid2)
  {
    pid1.constructor.name == 'Parag' && ( pid1 = pid1.id )
    pid2.constructor.name == 'Parag' && ( pid2 = pid2.id )

    // console.log('[pid1, pid2]', [pid1, pid2])
    // console.log('this.data.relatives',this.data.relatives)

    let data_p1   = this.data.relatives[String(pid1)]
      , data_p2   = this.data.relatives[String(pid2)]

    if ( !data_p1 || !data_p2 ) { return false }
    let lpan_p1   = data_p1['t']
      , lpan_p2   = data_p2['t']
      , relpan_p1 = data_p1['r'][lpan_p2]
      , relpan_p2 = data_p2['r'][lpan_p1]

    return (relpan_p1 && relpan_p1.indexOf(pid2) > -1) || (relpan_p2 && relpan_p2.indexOf(pid1) > -1)
  }

  /**
  *   Grande méthode d'association de parags
  *   --------------------------------------
  *
  * Méthode qui procède à l'association des parags contenus dans la liste
  * @param {Array} parags Liste de {Parag} à associer
  * @product
  * @return {Parag} Le paragraphe référent si l'association a pu se faire
  *                 et false dans le cas contraire.
  *                 Note : on renvoie le référent pour mettre tout de suite
  *                 ses relatifs en exergue.
  *
  * Rappel:
  *
  * Pour que la donnée à enregistrer soit moins conséquente, on utilise des
  * noms très réduit. À la base, une définition se présente ainsi :
  *   "<PARAG ID>": {"t": "<PAN 1 LETTRE>", "r":{ ... définition relatifs ... }}
  *
  * Avec la définition relatifs :
  *   "r":{"<PAN 1 LETTRE>":[liste ID], "<PAN 1 LETTRE>":[liste ID], etc.}
  *
  * Le PAN 1 LETTRE est défini dans PANNEAUX_DATA
  *   Projet.PANNEAUX_DATA[panneau]     = 'la_lettre'
  *   Projet.PANNEAUX_DATA['la_lettre'] = 'le_panneau'
  *
  **/
  associate ( parags )
  {
    let hrelates, referent

    // console.log("\n==== RELATIVES avant l'association : ", JSON.stringify(this.data))
    // Avant de vérifier que les données sont valides,
    // On regroupe les paragraphes par panprojet (synopsis, scenier, etc.)
    // On doit obtenir un Hash qui ressemble à celui qui doit être enregistré :
    // {
    //    "notes":    [c]         // <-- Ce sera le "référent"
    //    "scenier":  [x, y]
    //    "synopsis": [z, a, b]
    // }
    // Noter que ci-dessus on obtient les valeurs de trois tableaux, mais
    // en règle générale, puisqu'on associe par deux tableaux, il ne peut y en
    // avoir que deux.
    hrelates = this.associate_groupByPanneau(parags)
    // console.log(`==== hrelates: ${JSON.stringify(hrelates)}`)

    // On récupère le référent, c'est-à-dire le parag qu'on doit associer
    // aux autres, entendu qu'on ne peut pas associer plusieurs parag à
    // plusieurs autres. Un parag peut être associé à plusieurs parag,
    // mais toujours un référent à la fois.
    referent = this.associate_getReferent( hrelates )
    // console.log(`referent = ${JSON.stringify(referent)}`)
    if ( ! referent ) { return false }
    // console.log("==== hrelates après retrait du référent: ", JSON.stringify(hrelates))

    // On doit procéder à un contrôle pour voir si l'association peut se
    // faire.
    if ( this.associate_Impossible(referent, hrelates) ){ return false }

    // L'opération est possible, on peut procéder
    // ------------------------------------------
    let ref_id          = referent.id
      , ref_pan_letter  = Projet.PANNEAUX_DATA[referent.panneau].oneLetter
      , ref_relatives   = this.data.relatives[String(ref_id)]
      , other_id
      , other_relatives

    let pan, pan_letter
    let my = this
    for ( pan in hrelates )
    {
      pan_letter = Projet.PANNEAUX_DATA[pan].oneLetter
      // console.log(`Traitement du panneau ${pan} (${pan_letter})`)

      if (undefined === ref_relatives['r'][pan_letter])
      {
        ref_relatives['r'][pan_letter] = []
      }
      // On ajoute tous les relatifs
      hrelates[pan].forEach( (pid) => {

        // Ajout du relatif dans le référent
        ref_relatives['r'][pan_letter].push(pid)

        // Ajout du référent dans le relatif
        other_relatives = my.data.relatives[String(pid)]
        if (undefined === other_relatives['r'][ref_pan_letter])
        {
          other_relatives['r'][ref_pan_letter] = []
        }
        other_relatives['r'][ref_pan_letter].push(ref_id)
        my.data.relatives[String(pid)] = other_relatives

      })
    }

    // On remet dans les données les relatives du référent
    this.data.relatives[String(ref_id)] = ref_relatives

    // console.log("\n==== RELATIVES est devenue : ", JSON.stringify(this.data))
    let iparag = Parags.get(Number(ref_id))
    this.resetParag(iparag)
    this.modified = true
    return iparag
  }

  /**
  * Dissocie les deux paragraphes fournis en argument
  * @param {Parag} pid1 Le premier paragraphe
  *       ou {Number} Identifiant du premier paragraphe
  * @param {Parag} pid2 Le seconde paragraphe
  *       ou {Number} Identifiant du second paragraphe
  **/
  dissociate (pid1, pid2)
  {
    if ( 'number' != typeof pid1 ) { pid1 = pid1.id }
    if ( 'number' != typeof pid2 ) { pid2 = pid2.id }

    let dp1     = this.data.relatives[String(pid1)]
    let dp2     = this.data.relatives[String(pid2)]
    let t1      = dp1.t
    let t2      = dp2.t
    let relpan1 = dp1['r'][t2]
    let relpan2 = dp2['r'][t1]
    let ind1    = relpan2.indexOf(pid1)
    let ind2    = relpan1.indexOf(pid2)
    if ( ind1 > -1 )
    {
      relpan2 = relpan2.splice(ind1, 1)
      this.data.relatives[String(pid2)]['r'][t1] = relpan2
    }
    if ( ind2 > -1 )
    {
      relpan1 = relpan1.splice(ind2, 1)
      this.data.relatives[String(pid1)]['r'][t2] = relpan1
    }

    this.resetParag(Parags.get(Number(pid1)))
    this.resetParag(Parags.get(Number(pid2)))

    this.modified = true
  }

  /**
  * Quand on annule la suppression, on remet les associations enregistrées
  * par la méthode `dissociateWithAll` ci-dessous.
  **/
  deCancellisable (hcancel)
  {
    let mainData = hcancel['main']
    delete hcancel['main']
    this.data.relatives[String(mainData.id)] = JSON.parse(mainData.data)
    this.resetParag(Parags.get(Number(mainData.id)))
    for ( let rel_id in hcancel )
    {
      let drel = hcancel[rel_id]
      if( undefined === this.data.relatives[String(rel_id)] ){
        this.data.relatives[String(rel_id)] = {}
      }
      if ( undefined === this.data.relatives[String(rel_id)]['r'] ) {
        this.data.relatives[String(rel_id)]['r'] = {}
      }
      this.data.relatives[String(rel_id)]['r'][drel.t] = JSON.parse(drel.r)
      this.resetParag(Parags.get(Number(rel_id)))
    }
  }

  /**
  * Méthode qui supprime toutes les associations de relatives qui peuvent
  * exister avec +iparag+
  *
  * @param {Parag}    iparag    Le paragraphe qu'il faut dissocier.
  * @param {Boolean}  removing  True lorsqu'il faut dissocier parce que c'est
  *                             une destruction. On ne recrée par la donnée.
  *
  * @return {Object} La donnée de cancellisation.
  *
  **/
  dissociateWithAll (iparag, removing)
  {
    let cancelisable = {}
    // Donnée relatives sur paragraphe
    let drels = this.data.relatives[String(iparag.id)]
    cancelisable['main'] = { id:String(iparag.id), data:JSON.stringify(drels)}
    // lpan pour 'lettre panneau', la lettre représentant un tableau
    for(let lpan in drels.r) {
      drels['r'][lpan].forEach( (rel_id) => {
        // La liste des ids du panneau de iparag avec lesquels le relatif (qui
        // peut être le référent, mais qui est appelé relatif ici) est associé.
        let l = this.data.relatives[String(rel_id)]['r'][drels.t]
        cancelisable[rel_id] = {t:drels.t,r:JSON.stringify(l)}
        let ind
        if ( (ind = l.indexOf(iparag.id)) > -1 ){
          l = l.splice(ind,1)
        }
        this.data.relatives[String(rel_id)]['r'][drels.t] = l
      })
    }
    // On initialise tout pour iparag
    if ( removing )
    {
      delete this.data.relatives[String(iparag.id)]
    }
    else
    {
      this.data.relatives[String(iparag.id)]['r'] = {}
    }
    this.resetParag(iparag)

    this.modified = true

    return cancelisable

  }// dissociateWithAll

} // class Relatives

module.exports = Relatives
