### 0.2.0

  * Passe (presque) tous les tests. Principales fonctions mises en place (proche de la version 1 — il reste les relatives).

### 0.1.17

  * Gestion complète des brins (affichage et édition)

### 0.1.16

  * Gestion presque complète des Brins (création et enregistrement)

### 0.1.15

  * Mise en place de la vérification de la validité des données avant l'enregistrement des `Parags`.

### 0.1.14

  * Nouvelles propriétés `position`, `brins` et `type` pour le parag.
  * Mis en place de la gestion d'éléments DOM quelconque par `Tabulator` (appliqué au verso du parag).

### 0.1.13

  * Implémentation du verso du paragraphe, avec des informations utiles et éditables.
  * Utilisation systématique des Promises

### 0.1.12

  * Utilisation des Promises pour gérer tous les enregistrements/chargements de données.
  * Panneau Data isolé des autres panneaux

### 0.1.11

  * Une seule inclusion pour les tests et le programme lui-même pour définir les globales.
  * Tests complets de la synchronisation des paragraphes.
  * Introduction des handy-méthodes (pour essayer)

### 0.1.10

  * Ajout d'un footer dans la page projet
  * Ajout d'une class ProjetUI pour la gestion de l'interface en générale
  * Première implémentation des options.

### 0.1.9

  * Implémentation des touches 'i' et 'k' pour remplacer les flèches haut/bas.

### 0.1.8

  * Possibilité d'activer un menu/commande Tabulator simplement en répétant la touche.
  * Déplacements et insertions des paragraphes tout à fait opérationnels.

### 0.1.7

  * Implémentation complète des `Tabulators` (et leur système de raccourci-clavier intelligents).

### 0.1.6

  * Sélection et déselection (mise en exergue) des éléments relatifs, avec une exergue particulière pour le référent. On doit être en mode double panneau pour atteindre cette fonctionnalité, et le référent est entouré de rouge tandis que les relatifs sont entourés de pourpre.

### 0.1.5

  * Un clic en dehors des paragraphes déselectionne tous les paragraphes sélectionnés.

### 0.1.4

  * Modification du fonctionnement des `Relatives`.

### 0.1.3

  * Implémentation des `relatives` qui permettent de tenir à jour la relation entre les paragraphes de deux `PanProjets` différents, c'est-à-dire entre par exemple le synopsis et le manuscrit.

### 0.1.2

  * Sauvegarde partielle des données, par panneau, dans des fichiers JSON séparés.

### 0.1.1

  * Classes Parag and Parags created.
  * Use Travis for CI.
