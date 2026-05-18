import React from 'react';
import { Box, HStack, VStack, Text } from '@chakra-ui/react';

const NAVY = {
    border: "#1a3a5c",
    accent: "#00c896",
    textDim: "#4a7a99",
    white: "#e8f4ff",
    panel: "rgba(13, 21, 38, 0.8)",
};

interface ScoreBoardProps {
    myScore: number;    // bateaux adverses coulés
    opponentScore: number; // mes bateaux coulés
    totalShips: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ myScore, opponentScore, totalShips }) => {
    return (
        <HStack gap={4} justify="center" align="center">
            {/* My score */}
            <VStack gap={0} align="center">
                <Text
                    fontFamily="'Courier New', monospace"
                    fontSize="3xl"
                    fontWeight="700"
                    color={NAVY.white}
                    lineHeight={1}
                    letterSpacing="0.05em"
                >
                    {myScore}
                </Text>
            </VStack>

            {/* VS */}
            <VStack gap={1} align="center">
                <Text
                    fontFamily="'Courier New', monospace"
                    fontSize="sm"
                    color={NAVY.textDim}
                    letterSpacing="0.2em"
                    textTransform="uppercase"
                >
                    vs
                </Text>
                <Text
                    fontFamily="'Courier New', monospace"
                    fontSize="9px"
                    color={NAVY.textDim}
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                >
                    bateaux coulés
                </Text>
                {/* Progress bar */}
                <Box w="80px" h="3px" bg={NAVY.border} borderRadius="1px" overflow="hidden">
                    <Box
                        h="100%"
                        bg={NAVY.accent}
                        borderRadius="1px"
                        w={`${(myScore / totalShips) * 100}%`}
                        transition="width 0.4s ease"
                    />
                </Box>
            </VStack>

            {/* Opponent score */}
            <VStack gap={0} align="center">
                <Text
                    fontFamily="'Courier New', monospace"
                    fontSize="3xl"
                    fontWeight="700"
                    color={NAVY.white}
                    lineHeight={1}
                    letterSpacing="0.05em"
                >
                    {opponentScore}
                </Text>
            </VStack>
        </HStack>
    );
};

export default ScoreBoard;
