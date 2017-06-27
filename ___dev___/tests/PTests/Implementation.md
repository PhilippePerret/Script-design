

* Principe de lecture d'une feuille de test


* On lit tout le fichier, en créant des instances pour chaque `describe`, `context`, `it`, `and`
* On repasse en revue toutes les instances créées (dans chaque classe) et on définit pour les enfants le `owner` et le niveau de tabulation (`tab_level`). Note : il faut vraiment le faire après une première "lecture" du fichier, pour connaitre le tab-level des parents.
* On repasse en revue toutes les instances créées (pour chaque classe) et on joue celles qui n'ont pas de `owner` (donc celles qui sont en racine de fichier). Noter que contrairement à `RSpec` par exemple, ici, on peut avoir un `context` ou un `it` en racine de fichier. Un test peut très bien ne contenir que des it (pourquoi en serait-il autrement) :

```js

  it('le premier case', () => { ... })
  it('le deuxième case', () => { ... })
  it('le troisième case', () => { ... })
  ...

```

## Message de retour {#lemessage_de_resultat}

### Propriétés pouvant être définies {#proprietes_definissable}


#### Type de l'élément (`this.actualType`, `this.expectType`) {#type_de_element_in_message}

Par défaut, quand le type de l'élément est indiqué (lors des comparaisons strictes par exemple), on indique le type de l'élément. Par défaut, ce type est pris avec `typeof`, mais il peut être spécifié dans une méthode à l'aide de `actualType` et/ou `expectType`.
