const electron = require('electron')

  /**
  * @return Un objet décrivant la position de l'écran courant et sa taille.
  *         {baseX, baseY, baseW, baseH}
  **/
function baseXY () {
  if (undefined === this._basexy)
  {
    let scr = electron.screen
    let currentDisplay = scr.getDisplayNearestPoint(scr.getCursorScreenPoint())
    let {x: baseX, y: baseY, width: baseW, height: baseH} = currentDisplay.workArea
    this._basexy =  {baseX: baseX, baseY: baseY, baseW: baseW, baseH: baseH}
  }
  return this._basexy
}

module.exports = baseXY
