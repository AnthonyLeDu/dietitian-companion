# dietitian-companion

## Objet

Dietitian Companion est une application web pour diététicien.

Il permet de créer des journaux alimentaire, recueil détaillé des repas (aliments et boissons) d'un patient sur plusieurs jours et permettant d'évaluer ses apports nutritionnels et énergétiques.

Ceci afin que le diététicien puisse détecter d'éventuelles carences ou, au contraire, des apports trop important en énergie ou nutriments (protéines, lipides, sucres, etc.).

Le site peut être visité à cette adresse : [dietitian-companion.anthonyledu.fr](https://dietitian-companion.anthonyledu.fr)

## Fonctionnalités

L'aplication à terme doit permettre de (les fonctionnalités présentes sont cochées):

- [x] Créer un profil de patient (nom, prénom, sexe, date de naissance)
- [x] Éditer ou supprimer un profil de patient (et les journaux qui lui sont associés).
- [x] Créer un journal alimentaire composé de jours, eux-mêmes composés de repas, eux-mêmes composés d'aliments (incluant la quantité ingérée).
- [x] Éditer ou supprimer un journal.
- [x] Visualiser les calculs nutrionnels du journal (par aliment, repas, journée, ou pour tout le journal).
- [ ] Visualiser comment le patient se situe par rapport à la balance nutritionnelle recommandée (en fonction de son sexe, poids et âge.)
- [ ] Alimenter une base de donnée complémentaire à celle du Ciqual pour tout aliment que le diététicien ne trouverait pas.

## Roadmap

Les tâches réalisées, en cours ou à venir peuvent être suivie sur le [projet Git](https://github.com/users/AnthonyLeDu/projects/2).

Les principales étapes restant à réaliser à ce jour avant d'avoir un vrai premier MVP sont :

- Travailler l'affichage des calculs nutrionnels (lisibilité, ergonomie)
- Calculer et afficher la balance nutritionnelle (comment le patient se situe par rapport aux recommandations adaptées à son sex, âge et poids)
- Commenter le code
- Refactoriser le code des controllers (en passant par des classes) et des composants front
- Mettre en place des tests unitaire
- Mettre en place l'authentification afin que chaque utilisateur n'ait accès qu'à ses propres journaux et patients

## Sources

- La liste des aliments/boissons disponibles et le calcul nutritionnel repose sur la [base de donnée Ciqual de l'Anses](https://ciqual.anses.fr).
- Les recommandations nutritionnelles utilisées dans le calcul de la balance nutrionnelle viennent l'Anses.
