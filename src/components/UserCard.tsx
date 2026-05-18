import React from 'react';
import { Box, HStack, VStack, Text } from '@chakra-ui/react';
import type {Player} from '@/types.ts';

const NAVY = {
    border: "#1a3a5c",
    accent: "#00c896",
    accentGlow: "rgba(0, 200, 150, 0.15)",
    textDim: "#4a7a99",
    white: "#e8f4ff",
    yellow: "#f0c040",
    panel: "rgba(13, 21, 38, 0.8)",
};

interface UserCardProps {
    player: Player;
    isMyTurn: boolean;
    isLeft?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({ player, isMyTurn, isLeft = true }) => {
    return (
        <HStack
            gap={3}
            flexDirection={isLeft ? 'row' : 'row-reverse'}
            bg={NAVY.panel}
            border={`1px solid ${isMyTurn ? NAVY.accent : NAVY.border}`}
            borderRadius="2px"
            px={4}
            py={3}
            transition="border-color 0.3s ease"
            boxShadow={isMyTurn ? `0 0 12px rgba(0,200,150,0.1)` : 'none'}
        >
            {/* Avatar */}
            <Box
                w="36px"
                h="36px"
                borderRadius="2px"
                bg={isMyTurn ? NAVY.accentGlow : "rgba(26,58,92,0.5)"}
                border={`1px solid ${isMyTurn ? NAVY.accent : NAVY.border}`}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
            >
                <Text
                    fontFamily="'Courier New', monospace"
                    fontSize="xs"
                    fontWeight="700"
                    color={isMyTurn ? NAVY.accent : NAVY.textDim}
                    letterSpacing="0.05em"
                >
                    {player.name.slice(0, 2).toUpperCase()}
                </Text>
            </Box>

            {/* Info */}
            <VStack gap={0} align={isLeft ? 'flex-start' : 'flex-end'}>
                <Text
                    fontFamily="'Courier New', monospace"
                    fontSize="sm"
                    fontWeight="700"
                    color={NAVY.white}
                    letterSpacing="0.08em"
                >
                    {player.name}
                </Text>

                {/* Turn badge */}
                <Box
                    px={2}
                    py="1px"
                    borderRadius="1px"
                    bg={isMyTurn ? NAVY.accentGlow : 'transparent'}
                    border={`1px solid ${isMyTurn ? NAVY.accent : 'transparent'}`}
                >
                    <Text
                        fontFamily="'Courier New', monospace"
                        fontSize="9px"
                        fontWeight="700"
                        color={isMyTurn ? NAVY.accent : NAVY.textDim}
                        letterSpacing="0.15em"
                        textTransform="uppercase"
                    >
                        {isMyTurn ? 'Votre tour' : 'En attente'}
                    </Text>
                </Box>
            </VStack>
        </HStack>
    );
};

export default UserCard;
