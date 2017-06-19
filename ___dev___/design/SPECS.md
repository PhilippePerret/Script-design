# Spécifications

Ce document définit ce que doit être l'application, ce qu'elle doit savoir faire et les fonctionnalités qu'elle doit posséder.


# Présentation générale

Il s'agit de concevoir une application qui permette de développer un script ou un roman de la façon la plus pratique possible.

* L'application peut présenter l'histoire à différentes échelles, comme elle le ferait avec google maps. Depuis la vue très générale, qui correspond au pitch de quelques lignes, jusqu'à la vision atomique qui permet de voir les évènements les plus petits.
* Planifier le travail est important, l'application doit permettre de fixer des échéances et de dire où se trouve l'auteur par rapport à ces échéances.
* [Personnages]
  * Des raccourcis permettent d'écrire les personnages très rapidement, à l'aide d'une ou deux lettres. Par exemple `c + TAB` permettrait d'écrire `Camille`.
* Suivre la diffusion du projet est important. Blog, envoi aux éditeurs, etc.

# Requierements

* L'application doit pouvoir être entièrement contrôlée par le clavier, sans aucun usage de la souris, même pour les opérations les plus communes (par exemple pour aggrandir la taille de la fenêtre).


# Entités de l'application

* **Auteur**. C'est l'utilisateur, donc l'auteur de l'histoire. Il peut y avoir plusieurs auteurs sur un même projet.
* **Projet**. C'est le projet qui est développé dans une instance de l'application.
* **Personnages**. Ce sont les personnages de l'histoire.

## Auteur

L'auteur ou les auteurs du projet.

### Propriété des auteurs

* `pseudo`. Le nom par lequel on doit l'appeler,
* `prenom`, son vrai prénom,
* `nom`, son vrai patronyme,
* `presentation`, présentation courte de l'auteur,
* `naissance`, son année de naissance,
* `role`, son rôle dans le projet (à voir),
* `created_at`, correspond à son entrée dans le projet,
* `updated_at`, date de dernière modification de la donnée

Pourquoi pas :

* `cv`, biographie complète de l'auteur.

## Projet

### Propriétés du projet

* `titre`
* `sous-titre`
* `resume` [Event] Un évènement qui définit le résumé du projet.
* `auteurs`. Une liste d'auteurs (identifiants, par ordre)
* `auteurs_idee_originale`. Liste des auteurs de l'idée originale,
* `created_at`, date de démarrage du projet (doit pouvoir être modifiée à la création du projet)
* `updated_at`, date de dernière modification de la donnée projet

## Evènement

### Propriétés des évènements

* `id`. Un identifiant universel unique
* `oneliner`. L'évènement résumé en une seule ligne
* `summary`. Résumé court (quelques lignes) de l'évènement
* `content`, le contenu détaillé de l'évènement
* `notes_ids`, liste d'ID de notes concernant l'évènement (cf. [Notes](#les_notes))
* `taches_ids`, liste d'ID de tâche à faire concernant l'évènement (cf. [Tâches](#les_taches))
* `parent_id`. Évènement parent auquel appartient l'évènement. Seul le premier évènement (l'histoire) ne possède pas de parent
* `siblings_ids`. Liste des IDs des évènéments en relation directe avec l'évènement (par exemple, une suite directe ou une redite de l'évènement). Note : il faudrait certainement pouvoir définir pourquoi ils sont en relation
* `scale`. Échelle de l'évènement. L'échelle est une notion fondamentale de l'évènement. L'histoire elle-même est un évènement, qui couvre la plus grande durée.
* `personnages_ids`, liste des IDs des personnages en relation avec l'évènement. Ils peuvent être automatiques s'ils sont repérés dans le texte de l'évènement ou être précisés explicitement par l'auteur.
* `date`. La date de l'évènement permet de le situer dans le temps. Il permet notamment de connaitre l'âge des personnages à un moment précis de l'histoire. Particulièrement utile lorsque l'histoire se déroule sur plusieurs époques.
* `updated_at`. Date de dernière modification de l'évènement.

## Personnages

### Propriétés des personnages

* `pseudo`. Correspond au nom qui sera écrit avec le raccourci (cf. `shortcut`),
* `prenom`,
* `nom`,
* `description`,
* `naissance`. Année qui permet de définir l'âge du personnage en fonction la partie de l'histoire.
* `shortcut`. C'est le raccourci qui permet d'écrire le personnage dans le texte à l'aide d'un snippet (en général une seule lettre).

#### Propriétés volatiles

* `events_ids`, liste des évènements en relation avec le personnage


## Les notes {#les_notes}

### Propriétés des notes

* `id`
* `content`
* `auteur_id`, ID de l'auteur de la note
* `destinataire_id`, ID de l'auteur à qui est destiné la note, éventuellement
* `events_ids`, liste des IDs des évènements concernant la note. Correspond à la propriété `notes_ids` de l'évènements.
* `created_at`
* `updated_at`

## Les tâches {#les_taches}

### Propriétés des tâches

* `id`
* `content`, définition de la tâche
* `echeance`, date de la fin de la tâche
* `auteurs_ids`, liste des IDs des auteurs qui doivent s'occuper de la tâche
* `events_ids`, liste des IDs des évènements concernés par la tâche. Correspond à la propriété `taches_ids` de l'évènement
* `created_at`
* `updated_at`
