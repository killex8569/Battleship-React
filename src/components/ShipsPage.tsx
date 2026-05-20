import React, { useEffect, useState } from'react';
import BattleshipService from '../services/battleshipService.ts';
import type {Ship} from '../types.ts';
import {Box, Heading, Text, Spinner, Alert, SimpleGrid} from '@chakra-ui/react';
import ShipCard from './ShipCard';
const ShipsPage: React.FC = () => {
// État pour stocker la liste des navires
    const [ships, setShips] = useState<Ship[]>([]);
// État pour gérer le chargement
    const [isLoading, setIsLoading] = useState<boolean>(true);
// État pour gérer les erreurs
    const [error, setError] = useState<string | null>(null);
// Récupération des navires au chargement du composant
    useEffect(() => {
// Appel au service pour récupérer les navires
        BattleshipService.getShips()
            .then(data => {
                setShips(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Erreur lors de la récupération des navires:'
                    , err);
                setError('Impossible de charger la liste des navires');
                setIsLoading(false);
            });
    }, []); // Le tableau vide signifie que l'effet s'exécute uniquement après le premier rendu

    // Affichage conditionnel en fonction de l'état
    if (isLoading) {
        return (
            <Box textAlign=
                     "center" p={8}>
                <Spinner size=
                             "xl" />
                <Text mt={4}>Chargement des navires...</Text>
            </Box>
        );
    }
    if (error) {
        return (
            <Alert.Root status="error"><Alert.Indicator />
                {error}
            </Alert.Root>
        );
    }
    return (
        <Box h="100vh" p={6} display="flex" flexDirection="column">
            {/* Header */}
            <Box mb={6}>
                <Heading as="h1">Liste des navires</Heading>
            </Box>

            {/* Content */}
            <Box flex="1" overflowY="auto">
                <SimpleGrid columns={[1, 2, 3,4]} >
                    {ships.map((ship) => (
                        <ShipCard key={ship.id} ship={ship} />
                    ))}
                </SimpleGrid>
            </Box>
        </Box>
    );
};
export default ShipsPage;