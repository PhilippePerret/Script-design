let res
this.attrs_exp = 'div#mon-div.class1.class2[contenteditable="true"][autre="valeur"]'


let pat = /^([a-z]+)(#[a-z0-9_\-]+)?(\.[\.a-z0-9]+)?(.*)$/i
let m = this.attrs_exp.match(pat)
let ea = { tag: m[1] }

// ID
if(m[2]){
  ea.id = m[2].substr(1,m[2].length).trim()
}

// Class CSS
if(m[3]){
  ea.class = m[3].substr(1,m[3].length).trim().split('.')
}
let arr, props = null
if(m[4]!==''){
  props = m[4].substr(1,m[4].length-2).trim().split('][')
  props = props.map(paire => { return paire.split('=') })
  props.forEach( paire => {
    if(paire[1].startsWith('"')){paire[1] = paire[1].substring(1,paire[1].length)}
    if(paire[1].endsWith('"')){paire[1] = paire[1].substring(0,paire[1].length-1)}
    // On ajoute ici
    ea[paire[0]] = paire[1]
  })
}
this.attrs_exp = ea

res = JSON.stringify(ea)
console.log(res)
