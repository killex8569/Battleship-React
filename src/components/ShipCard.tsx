import { type Ship } from'../types';
interface ShipCardProps {
    key: number,
    ship: Ship;
}

const shipCard = ( {key,ship}: ShipCardProps) => {
    return (
        <div key={key}>
            <h2>{ship.name}</h2>
            <h2> Taille :{ship.lenght} cases</h2>
        </div>
    )
}

export default shipCard