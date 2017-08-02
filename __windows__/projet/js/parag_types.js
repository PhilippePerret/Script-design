/*

  Tout ce qui concerne les types des parags

  Noter que Parag doit déjà être chargé et global quand on appelle cette
  librairie.

*/
class ParagTypes {
  /** ---------------------------------------------------------------------
    *
    *   CLASSE
    *
  *** --------------------------------------------------------------------- */

  /**
  * Définition des valeurs
  **/
  static get DATA () {
    if ( undefined === this._DATA )
    {
      this._DATA = {
        type1:{
            0  : { hname: "Non défini" }
          , 1  : { hname: "Structure" }
          , 2  : { hname: "Structure : PFA"}
          , 5  : { hname: "Personnage"}
          , 6  : { hname: "Personnage : dialogue"}
        }
        , type2: { // type de contenu

            0  : { hname: "Non défini" }
          , 1  : { hname: "Action" }
          , 2  : { hname: "Description" }
          , 3  : { hname: "Dialogue" }
          , 4  : { hname: "Action & dialogue" }
          , 5  : { hname: "Réflexion" }

          /*
          ------------------------------------------------------------
          Tous les types suivants sont considérés comme ne faisant pas
          partie du texte proprement dit.
          ------------------------------------------------------------
          */
          , 10 : { hname: "Note _AUTEUR_1_" }
          , 11 : { hname: "Note _AUTEUR_2_" }
          , 12 : { hname: "Note _AUTEUR_3_" }

          , 15 : { hname: "Question" }
          , 16 : { hname: "Remarque" }

          , 20 : { hname: "À faire"}

        }
        , type3: {

            0  : { hname: "Non défini" }
        }
        , type4: { // Niveau de développement
          //  Note : ce menu est construit à partir des menus
          // 1, 7, 13 etc
            0  : { hname: "Non défini" }
          , 1  : { hname: "Esquisse" }

          , 7  : { hname: "Brainstorming"}

          , 13 : { hname: "Développement"}

          , 19 : { hname: "Affinement"}

          , 25 : { hname: "Finalisation"}

          , 31 : { hname: "Version définitif"}

        }
      }

      /*- Définition du type 4 -*/
      let i = 1, ii, menu, smenu
      const arr_estime = ['mauvais', 'passable', 'moyen', 'bien', 'très bien']
      while ( i < 31 ) {
        menu = this._DATA.type4[i].hname
        for (ii = 1 ; ii < 6 ; ++ii) {
          smenu = arr_estime[ii-1]
          this._DATA.type4[Number(i) + Number(ii)] = {hname: `${menu} - ${smenu}`}
        }
        i += 6
      }
      console.log("Parag.Types.DATA", this._Parag.Types.DATA)
    }// Fin de la définition
    return this._DATA
  }
  /** ---------------------------------------------------------------------
    *
    *   INSTANCE
    *
    *   Définie par Parag#types
    *
  *** --------------------------------------------------------------------- */
  /**
  * Instanciation
  * @param {Parag} parag Le paragraphe en question
  **/
  constructor (parag)
  {
    this.parag = parag
  }

  get data () {
    if ( undefined === this._data ) {
      this.data = '0000'
    }
    return this._data
  }
  set data (v){
    const my = this
    my._data = v
    my.redefineDown()
  }

  get type1     ()  { this._type1 || this.redefineDown() ; return this._type1 }
  get type2     ()  { this._type2 || this.redefineDown() ; return this._type2 }
  get type3     ()  { this._type3 || this.redefineDown() ; return this._type3 }
  get type4     ()  { this._type4 || this.redefineDown() ; return this._type4 }
  get type1_b32 ()  { return this._type1_b32 || this.data[0]  }
  get type2_b32 ()  { return this._type2_b32 || this.data[1]  }
  get type3_b32 ()  { return this._type3_b32 || this.data[2]  }
  get type4_b32 ()  { return this._type4_b32 || this.data[3]  }

  set type1     (v) { this._type1 = v ; this.redefineUp(1) }
  set type2     (v) { this._type2 = v ; this.redefineUp(2) }
  set type3     (v) { this._type3 = v ; this.redefineUp(3) }
  set type4     (v) { this._type4 = v ; this.redefineUp(4) }
  set type1_b32 (v) { this._type1_b32 = v ; this.redefineMiddle(1) }
  set type2_b32 (v) { this._type2_b32 = v ; this.redefineMiddle(2) }
  set type3_b32 (v) { this._type3_b32 = v ; this.redefineMiddle(3) }
  set type4_b32 (v) { this._type4_b32 = v ; this.redefineMiddle(4) }

  /**
  * C'est-à-dire qu'on part de la valeur du typeX pour aller vers la
  * valeur du typeX_b32 puis la valeur de data.
  *
  * WARNING Il faut impérativement renseigner les valeurs '._' pour ne
  * pas obtenir de loop infinie.
  **/
  redefineUp (x) {
    const my = this
    let d = ''
    my[`_type${x}_b32`] = my[`_type${x}`].toBase32()
    for(x=1; x<5; ++x) { d += my[`_type${x}_b32`] }
    my._data = d
  }
  redefineDown () {
    const my = this
    for(let i=1;i<5;++i){
      my[`_type${i}_b32`]= my._data.substr(- 1 + i , 1)
      my[`_type${i}`]= my[`_type${i}_b32`].fromBase32()
    }
  }
  redefineMiddle (x)
  {
    const my = this
    my[`_type${x}`] = my[`_type${x}_b32`].fromBase32()
    let d = ''
    for(x=1; x<5; ++x){
      d += `${my[`_type${x}_b32`]}`
    }
    my._data = d
  }

}

module.exports = ParagTypes
