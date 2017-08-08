
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
  * On reset aussi bien les relatives ici que dans les paragraphes.
  *
  * Pour le moment, cette méthode n'est utile que pour les tests.
  **/
  reset ()
  {
    this._data = this.defaultData
    Parags.items.forEach( (parag, pid) => {
      this.resetParag(parag)
    })
  }
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
      delete iparag._relatives
    }
  }

  /** ---------------------------------------------------------------------
    *
    *   Méthodes fonctionnelle
    *
  *** --------------------------------------------------------------------- */

  /**
  * Sauve les données relatives de façon asynchrone
  *
  * @return {Promise}
  *
  * NOTE La méthode peut être appelée sans vérification de la modification
  * des données, donc il faut le faire ici.
  **/
  save () {
    if ( this.modified ) { return this.store.save() }
    else { return Promise.resolve() }
  }

  get data ()
  {
    this._data || this.loadData() // bon tant que c'est synchrone…
    return this._data
  }
  set data (v) { this._data = v }

  /**
  * Chargement (synchrone) des données des relatives.
  *
  * NOTE Pour le moment, il est synchrone, mais il se peut qu'il ne le soit
  * plus dans quelques temps.
  **/
  loadData ()
  {
    if ( this.store.exists() )
    {
      this.store.loadSync()
    }
    else
    {
      this.data = this.defaultData
    }
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
    this._store || ( this._store = new Store(path.join('projets',this.projet.id,'relatives'), this) )
    return this._store
  }

  /**
  * Premier temps de l'association, on regroupe les paragraphes par
  * panneau.
  **/
  associate_groupByPanneau( parags )
  {
    let hrelates = new Map()
    parags.forEach( (parag) => {
      if ( undefined === hrelates.get(parag.panneau_id) ){
        hrelates.set(parag.panneau_id, [])
      }
      hrelates.get(parag.panneau_id).push(parag.id)
    })
    return hrelates
  }

  /**
  * Sous-méthode de `associate` qui retourne le paragraphe de référence.
  *
  * @return {Map} [hash-référent, hash-relatives]
  *
  **/
  associate_getReferent ( hrelates /* {Map} */)
  {
    let erreurNoReferent  = false
      , referent          = null
      , pan, arr_ids

    for(let tab of hrelates)
    {
      [pan, arr_ids] = tab
      if ( arr_ids.length == 1 )
      {
        referent = {
            id          : arr_ids[0]
          , panneau_id  : pan
          , panLetter   : PanProjet.oneLetterOf(pan)
        }
        hrelates.delete(pan)
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
      , ref_pan         = referent.panneau_id
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

    if ( !relpan_p1 || relpan_p1.indexOf(pid2) < 0 ) { return false }
    if ( !relpan_p2 || relpan_p2.indexOf(pid1) < 0 ) { return false }

    /* - les deux parags sont relatifs - */

    return true

  }

  /**
  *   Grande méthode d'association de parags
  *   --------------------------------------
  *
  * Méthode qui procède à l'association des parags contenus dans la liste
  * @param {Array} parags Liste de {Parag} à associer
  * @product
  *
  * @return {Parag} Le paragraphe référent si l'association a pu se faire
  *                 et false dans le cas contraire.
  *                 Note : on renvoie le référent pour mettre tout de suite
  *                 ses relatifs en exergue dans le panneau, si possible.
  *
  * Pour le principe de l'association, cf. :
  * N0006
  * https://github.com/PhilippePerret/Script-design/wiki/NoI#n0006
  *
  * Concernant la forme de la donnée produite, cf. :
  * N0007
  * https://github.com/PhilippePerret/Script-design/wiki/NoI#n0007
  *
  **/
  associate ( parags )
  {
    const my = this

    /*- validité des arguments fournis -*/

    if ( ! parags ) {
      throw new Error("Il faut fournir les parags à associer !")
    }
    if ( ! Array.isArray( parags ) ) {
      throw new Error("Il faut fournir une liste des parags à associer !")
    }
    let arr = new Map()
    parags.forEach( parag => {
      if ( arr.get(parag.id) ) throw new Error("Un parag ne peut être associé à lui-même.")
      arr.set(parag.id, true)
    })

    // console.log("\n==== RELATIVES avant l'association : ", JSON.stringify(this.data))
    // Avant de vérifier que les données sont valides,
    // On regroupe les paragraphes par panprojet (synopsis, scenier, etc.)
    // On doit obtenir un Hash qui ressemble à celui qui doit être enregistré :
    // {
    //    "notes":    [c]       // <-- Le premier parag seul est le "référent"
    //    "scenier":  [x, y]
    //    "synopsis": [z, a, b]
    // }

    let hrelates = this.associate_groupByPanneau(parags) // => Map
    // console.log(`==== hrelates: ${JSON.stringify(hrelates)}`)

    // On récupère le référent, qui doit obligatoirement exister, selon
    // le principe de l'association.
    let referent = this.associate_getReferent( hrelates )
    // console.log(`referent = ${JSON.stringify(referent)}`)
    if ( ! referent ) return false ;

    // console.log("==== hrelates après retrait du référent: ", JSON.stringify(hrelates))

    // On doit procéder à un contrôle pour voir si l'association peut se
    // faire.
    if ( this.associate_Impossible(referent, hrelates) ) return false ;

    // On doit récupérer tous les « parags seuls » de cette association
    // Note : le {Object} référent en fait partie
    let parags_seuls      = [referent]
    let parags_non_seuls  = []
    hrelates.forEach( (value, pan) => {
      if ( value.length > 1 ) parags_non_seuls.push( {panneau_id: pan, parag_ids: value}) ;
      else parags_seuls.push({panneau_id: pan, id: value[0] })
    })

    // On doit associer tous les « parags seuls » aux autres parags
    parags_seuls.forEach( hparag_seul => {
      let paragId_ref   = hparag_seul.id
        , panId_ref     = hparag_seul.panneau_id
        , panLetter_ref = PanProjet.oneLetterOf(panId_ref)
        , relatives_ref = this.data.relatives[String(paragId_ref)]

      /*- Association des parags seuls entre eux -*/

      parags_seuls.forEach( autre_hparag_seul => {
        if ( autre_hparag_seul.id == paragId_ref ) return ; // celui traité
        let paragId_aut   = autre_hparag_seul.id
          , panId_aut     = autre_hparag_seul.panneau_id
          , panLetter_aut = PanProjet.oneLetterOf(panId_aut)
          , relatives_aut = this.data.relatives[String(paragId_aut)]

        // Noter qu'ici on ne traite l'association que dans un sens,
        // puisque l'autre sens sera traité lorsque ce sera le deuxième parag
        // qui sera en référence.
        // Si le référent n'a pas encore de relatifs de ce panneau, il
        // faut initier sa donnée
        relatives_ref['r'][panLetter_aut] || ( relatives_ref['r'][panLetter_aut] = [] )
        relatives_ref['r'][panLetter_aut].push(paragId_aut)

      })

      /*- Association du parag seul avec les parags non seuls -*/

      // On répète pour chaque parag non seul
      parags_non_seuls.forEach( hpanneau_non_seul => {
        // 'pns' pour 'parag non seul'
        let panId_pns     = hpanneau_non_seul.panneau_id
          , panLetter_pns = PanProjet.oneLetterOf(panId_pns)

        // Si le référent n'a pas encore de relatifs de ce panneau, il
        // faut initier sa donnée
        relatives_ref['r'][panLetter_pns] || ( relatives_ref['r'][panLetter_pns] = [] )

        // On boucle dans la liste de tous les parags de ce panneau
        hpanneau_non_seul.parag_ids.forEach( paragId_pns => {
          // 'pns' pour 'parag non seul'
          let relatives_pns = this.data.relatives[String(paragId_pns)]

          // Ajout du relatif dans le référent
          relatives_ref['r'][panLetter_pns].push(paragId_pns)

          // Si le PNS n'a pas encore de relatifs dans le panneau du référent,
          // il faut initier sa donnée avant d'ajouter le référent
          relatives_pns['r'][panLetter_ref] || ( relatives_pns['r'][panLetter_ref] = [] )
          relatives_pns['r'][panLetter_ref].push(paragId_ref)
        })
      })
    })

    // console.log("\n==== RELATIVES APRÈS l'association : ", JSON.stringify(this.data))

    my.resetAllParags(parags)
    my.modified = true

    /*  On retourne le référent (pour sélection) */

    return Parags.get(Number(referent.id))
  }

  /**
  * Méthode qui associe les paragraphes sans référent
  *
  * À la différence de la méthode `associate`, qui associe les parags
  * à un référent unique (sans associer les autres parags entre eux), ici,
  * il n'y a pas de référent et il n'y a (normalement) qu'un seul parag par
  * panneau. Cette méthode est appelée par la synchronisation.
  * Dans ce cas, tous les parags sont associés entre eux.
  **/
  associateWithNoReferent ( parags )
  {
    const my = this
    let pRef, pRel, dataRef

    parags.forEach( pRef => {
      dataRef = my.data.relatives[String(pRef.id)]['r']
      parags.forEach( pRel => {
        if (pRel.id == pRef.id){ return }
        if ( undefined === dataRef[pRel.panneau.oneLetter] )
        {
          dataRef[pRel.panneau.oneLetter] = []
        }
        if ( dataRef[pRel.panneau.oneLetter].indexOf(pRel.id) < 0 )
        {
          dataRef[pRel.panneau.oneLetter].push( pRel.id )
        }
      })
    })

    my.resetAllParags( parags )
    my.modified = true
  }

  resetAllParags (parags)
  {
    parags.forEach( p => { this.resetParag(p) } )
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
