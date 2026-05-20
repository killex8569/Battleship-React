import React from 'react';
import { Box, HStack, VStack, Text } from '@chakra-ui/react';
import type {Ship} from '@/types.ts';

const NAVY = {
    border: "#1a3a5c",
    accent: "#00c896",
    textDim: "#4a7a99",
    white: "#e8f4ff",
    danger: "#e05c5c",
    hit: "#c0392b",
    ship: "rgba(70, 110, 160, 0.5)",
};

interface ShipTrackerProps {
    ships: Ship[];
    title: string;
}

const ShipTracker: React.FC<ShipTrackerProps> = ({ ships, title }) => {
    return (
        <VStack gap={2} align="stretch">
            <Text
                fontFamily="'Courier New', monospace"
                fontSize="10px"
                fontWeight="700"
                color={NAVY.textDim}
                letterSpacing="0.2em"
                textTransform="uppercase"
            >
                {title}
            </Text>

            {ships.map((ship) => (
                <HStack key={ship.id} justify="space-between" align="center" gap={3}>
                    {/* Ship name */}
                    <Text
                        fontFamily="'Courier New', monospace"
                        fontSize="xs"
                        color={ship.isSunk ? NAVY.danger : NAVY.white}
                        letterSpacing="0.05em"
                        w="90px"
                        flexShrink={0}
                        textDecoration={ship.isSunk ? 'line-through' : 'none'}
                        opacity={ship.isSunk ? 0.6 : 1}
                    >
                        {ship.name}
                    </Text>

                    {/* Cell indicators */}
                    <HStack gap="3px">
                        {Array.from({ length: ship.size }).map((_, i) => (
                            <Box
                                key={i}
                                w="14px"
                                h="14px"
                                borderRadius="1px"
                                bg={
                                    ship.isSunk
                                        ? NAVY.hit
                                        : i < ship.hits
                                        ? NAVY.hit
                                        : NAVY.ship
                                }
                                border={`1px solid ${NAVY.border}`}
                                transition="background 0.2s ease"
                            />
                        ))}
                    </HStack>

                    {/* Sunk badge */}
                    {ship.isSunk && (
                        <Box
                            px={2}
                            py="1px"
                            bg="rgba(224,92,92,0.15)"
                            border={`1px solid ${NAVY.danger}`}
                            borderRadius="1px"
                        >
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="9px"
                                fontWeight="700"
                                color={NAVY.danger}
                                letterSpacing="0.1em"
                                textTransform="uppercase"
                            >
                                Coulé
                            </Text>
                        </Box>
                    )}
                </HStack>
            ))}
        </VStack>
    );
};

export default ShipTracker;
