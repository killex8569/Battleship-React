# Listez les vues Touché-Coulé

## 1. Page de Connexion / Inscription

**Description** : Point d'entrée de l'application. Permet à un joueur de s'identifier ou de créer un compte.

**Éléments UI** :
- Formulaire de connexion (identifiant / mot de passe)
- Formulaire d'inscription (si applicable)
- Bouton de connexion

**Endpoints requis** :
```
POST /auth/login       → authentification, retourne un token/session
POST /auth/register    → création de compte (si inscription prévue)
```

## 2. Lobby / Liste des Parties

**Description** : Vue principale après connexion. Le joueur peut voir les parties disponibles, en rejoindre une ou en créer une nouvelle.

**Éléments UI** :
- Liste des parties en attente de joueurs
- Bouton "Créer une partie"
- Bouton "Rejoindre" sur chaque entrée de la liste
- Informations sur les joueurs connectés

**Endpoints requis** :
```
GET  /users            → liste des utilisateurs connectés
GET  /games            → liste des parties disponibles
POST /games            → créer une nouvelle partie
POST /games/{id}/join  → rejoindre une partie existante
```

## 3. Salle d'Attente (Pré-partie)

**Description** : Après avoir rejoint ou créé une partie, les deux joueurs attendent que la partie soit prête à démarrer. Affiche le statut des joueurs (prêt / pas prêt).

**Éléments UI** :
- Pseudo des deux joueurs
- Indicateur de statut "Prêt" pour chaque joueur
- Bouton "Prêt" / "Annuler"

**Endpoints requis** :
```
GET  /games/{id}            → état courant de la partie
POST /games/{id}/ready      → signaler que le joueur est prêt
DELETE /games/{id}/leave    → quitter la salle d'attente
```

## 4. Phase de Placement des Bateaux

**Description** : Chaque joueur place ses bateaux sur sa grille avant le début de la partie. Vue privée (chaque joueur voit uniquement sa propre grille).

**Éléments UI** :
- Grille de placement interactive
- Liste des bateaux à placer (avec indicateur "placé / non placé")
- Options d'orientation (horizontal / vertical)
- Bouton "Valider le placement" (actif uniquement si tous les bateaux sont placés)
- Option de déplacer un bateau déjà placé

**Endpoints requis** :
```
GET  /ships                          → liste des bateaux disponibles
GET  /games/{id}/ships               → état des bateaux du joueur dans la partie
POST /games/{id}/ships/{shipId}/place  → placer un bateau (coordonnées + orientation)
PATCH /games/{id}/ships/{shipId}/move  → déplacer un bateau déjà placé
GET  /games/{id}/ships/ready         → vérifier si tous les bateaux sont placés
POST /games/{id}/start               → lancer la partie (si les deux joueurs sont prêts)
```

## 5. Vue de Jeu (Partie en cours)

**Description** : Vue principale du jeu. Chaque joueur voit sa propre grille (avec ses bateaux et les tirs reçus) et la grille adverse (avec uniquement les résultats de ses tirs). Le tour actif est mis en évidence.

**Éléments UI** :
- Grille du joueur (défense)
- Grille adverse (attaque) — cases cliquables pour tirer
- Indicateur du tour en cours ("Votre tour" / "Tour de l'adversaire")
- Historique ou légende des cases (eau, touché, coulé)
- Indicateur des bateaux restants (les deux joueurs)
- Feedback visuel après chaque tir (raté / touché / coulé)
- (Optionnel) Inventaire de missiles spéciaux si la fonctionnalité est activée

**Endpoints requis** :
```
GET  /games/{id}/board         → état du plateau (cases jouées, bateaux touchés)
POST /games/{id}/fire          → tirer une torpille (coordonnées cible)
GET  /games/{id}/turn          → savoir à qui c'est le tour
GET  /games/{id}/ships/status  → état des bateaux (touché, coulé, intact)
```

## 6. Fin de Partie

**Description** : Affichée lorsque tous les bateaux d'un joueur sont coulés. Présente le résultat (victoire / défaite) et propose des options de suite.

**Éléments UI** :
- Annonce du vainqueur
- Récapitulatif de la partie (nombre de tirs, bateaux coulés, etc.)
- Bouton "Rejouer" (nouvelle partie avec le même adversaire)
- Bouton "Retour au Lobby"

**Endpoints requis** :
```
GET  /games/{id}/result   → résultat final de la partie (gagnant, stats)
POST /games              → créer une nouvelle partie (si "Rejouer")
```