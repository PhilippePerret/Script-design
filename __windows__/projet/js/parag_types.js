/*

  Tout ce qui concerne les types des parags

  Noter que Parag doit déjà être chargé et global quand on appelle cette
  librairie.

*/
Parag.Types = class {
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

}
