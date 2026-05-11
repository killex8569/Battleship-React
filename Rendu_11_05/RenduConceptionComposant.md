# Architecture de la page ShipPage

## Arbre des composants :

### ShipPage.tsx
- ### ShipCard.tsx

Dans le composant ShipPage il y a plusieurs ShipCard...

## Interfaces TypeScript

### Quelle est la structure d’un Ship ? Pourquoi ces champs ?

Dans types.ts on créer le model de Ship...

```ts
export interface Ship {
    id : number;
    name: string;
    tacticalName: string;
    lenght: number;
}
```
On peut voir ici que pour l'instant dans le code un **Ship** est représenté de la manière suivante :

- Il possède un ID unique qui est un number.
- Un name et un tacticalName soit le nom du bateau et son abréviation qui sont tous deux un String.
- Puis lenght qui est la longueur du dis bateau représenté par un number.


Pour l'instant cette représentation nous permet d'identifier un bateau par son ID et afficher son nom/libellé et sa longueur.

### Quels sont les props de ShipCard ?

```ts
interface ShipCardProps {
    key: number,
    ship: Ship;
}

const ShipCard = ({ ship }: ShipCardProps) => {}
```

Dans cet extrait de code on peut voir que le composant **ShipCard** demande une donnée de type **ShipCardProps** qui est elle même représenté sous la forme suivante :

- Key qui est en fait un point de repère pour pas se confondre entre les lignes en bdd.
- Ship qui représente un bateau.

## Où vit l’état — et pourquoi ?

### Pourquoi ships, isLoading et error sont-ils dans ShipsPage et non dans ShipCard ?

C'est plus logique de faire la gestion d'erreur à la racine de la page car on ne veut pas afficher des composants vides...
En checkant les erreurs au niveau de la page, on évite les problèmes d'afficahges lié à la non receptions des props nécessaires aux composants.

### Qu’est-ce qui se passerait si on mettait l’appel API directement dans ShipCard ?

Si on faisait un call API directement dans **ShipCard** ça serait potentiellement pour afficher le détail d'un bateau récupérer plus tôt par la liste...Dans notre exemple il n'y a pas assez de données pour que la différence entre le call de *Ships* et *ShipByID* soit significatif.

## Rôle de useEffect

//TODO