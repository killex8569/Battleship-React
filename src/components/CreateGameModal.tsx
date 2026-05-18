import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import BattleshipService from '../services/battleshipService';
import { Box, Button, VStack, HStack, Text, Input } from '@chakra-ui/react';

const NAVY = {
    bg: "#0a0f1a",
    border: "#1a3a5c",
    accent: "#00c896",
    accentGlow: "rgba(0, 200, 150, 0.15)",
    text: "#b8d4e8",
    textDim: "#4a7a99",
    danger: "#e05c5c",
    white: "#e8f4ff",
};

interface CreateGameModalProps {
    onClose: () => void;
}

const GRID_OPTIONS = [8, 10, 12, 15];
const SHIP_OPTIONS = [3, 4, 5, 6];

const CreateGameModal: React.FC<CreateGameModalProps> = ({ onClose }) => {
    const navigate = useNavigate();
    const [gridSize, setGridSize] = useState<number>(10);
    const [shipCount, setShipCount] = useState<number>(5);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setError('');
        setLoading(true);
        try {
            const game = await BattleshipService.createGame(gridSize, shipCount);
            await BattleshipService.joinGame(game.id);
            navigate(`/game/${game.id}`);
        } catch (err) {
            console.error("Erreur createGame:", err);
            setError("Impossible de créer la partie. Réessayez.");
            setLoading(false);
        }
    };

    return (
        // Backdrop
        <Box
            position="fixed"
            inset={0}
            bg="rgba(0,0,0,0.75)"
            zIndex={50}
            display="flex"
            alignItems="center"
            justifyContent="center"
            onClick={onClose}
            style={{
                backdropFilter: "blur(2px)",
                backgroundImage: `
                    linear-gradient(rgba(0, 200, 150, 0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 200, 150, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
            }}
        >
            {/* Modal */}
            <Box
                onClick={(e) => e.stopPropagation()}
                w="100%"
                maxW="420px"
                mx={4}
                border={`1px solid ${NAVY.border}`}
                borderRadius="2px"
                overflow="hidden"
                bg={NAVY.bg}
                boxShadow={`0 0 40px rgba(0,200,150,0.08)`}
            >
                {/* Modal header */}
                <HStack
                    px={5}
                    py={3}
                    bg="rgba(26, 58, 92, 0.35)"
                    borderBottom={`1px solid ${NAVY.border}`}
                    justify="space-between"
                >
                    <HStack gap={2}>
                        <Box
                            w="6px" h="6px"
                            borderRadius="50%"
                            bg={NAVY.accent}
                            boxShadow={`0 0 6px ${NAVY.accent}`}
                        />
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="xs"
                            fontWeight="700"
                            color={NAVY.accent}
                            letterSpacing="0.15em"
                            textTransform="uppercase"
                        >
                            Nouvelle partie
                        </Text>
                    </HStack>
                    <Text
                        fontFamily="'Courier New', monospace"
                        fontSize="10px"
                        color={NAVY.textDim}
                        letterSpacing="0.1em"
                    >
                        CMD-01
                    </Text>
                </HStack>

                {/* Modal body */}
                <VStack gap={6} p={6} align="stretch">

                    {/* Grid size */}
                    <VStack gap={3} align="stretch">
                        <HStack justify="space-between">
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="10px"
                                color={NAVY.textDim}
                                letterSpacing="0.15em"
                                textTransform="uppercase"
                            >
                                Taille de la grille
                            </Text>
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="xs"
                                fontWeight="700"
                                color={NAVY.white}
                                letterSpacing="0.1em"
                            >
                                {gridSize} × {gridSize}
                            </Text>
                        </HStack>

                        {/* Preset buttons */}
                        <HStack gap={2}>
                            {GRID_OPTIONS.map((n) => (
                                <Button
                                    key={n}
                                    onClick={() => setGridSize(n)}
                                    flex={1}
                                    bg={gridSize === n ? NAVY.accentGlow : "transparent"}
                                    border={`1px solid ${gridSize === n ? NAVY.accent : NAVY.border}`}
                                    color={gridSize === n ? NAVY.accent : NAVY.textDim}
                                    borderRadius="2px"
                                    fontFamily="'Courier New', monospace"
                                    fontWeight="700"
                                    fontSize="xs"
                                    letterSpacing="0.1em"
                                    py={4}
                                    _hover={{ borderColor: NAVY.accent, color: NAVY.accent }}
                                    _active={{ transform: "scale(0.97)" }}
                                    transition="all 0.12s ease"
                                >
                                    {n}×{n}
                                </Button>
                            ))}
                        </HStack>

                        {/* Custom input */}
                        <HStack gap={3} align="center">
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="9px"
                                color={NAVY.textDim}
                                letterSpacing="0.1em"
                                textTransform="uppercase"
                                flexShrink={0}
                            >
                                Personnalisé
                            </Text>
                            <Input
                                type="number"
                                min={5}
                                max={20}
                                value={gridSize}
                                onChange={(e) => setGridSize(Number(e.target.value))}
                                fontFamily="'Courier New', monospace"
                                fontSize="sm"
                                fontWeight="700"
                                bg="rgba(0,0,0,0.3)"
                                border={`1px solid ${NAVY.border}`}
                                borderRadius="2px"
                                color={NAVY.white}
                                textAlign="center"
                                _focus={{
                                    borderColor: NAVY.accent,
                                    boxShadow: `0 0 0 1px ${NAVY.accent}`,
                                    outline: "none",
                                }}
                                _hover={{ borderColor: NAVY.text }}
                                size="sm"
                            />
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="9px"
                                color={NAVY.textDim}
                                letterSpacing="0.1em"
                            >
                                (5 – 20)
                            </Text>
                        </HStack>
                    </VStack>

                    {/* Divider */}
                    <Box h="1px" bg={NAVY.border} />

                    {/* Ship count */}
                    <VStack gap={3} align="stretch">
                        <HStack justify="space-between">
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="10px"
                                color={NAVY.textDim}
                                letterSpacing="0.15em"
                                textTransform="uppercase"
                            >
                                Nombre de navires
                            </Text>
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="xs"
                                fontWeight="700"
                                color={NAVY.white}
                                letterSpacing="0.1em"
                            >
                                {shipCount} navire{shipCount > 1 ? 's' : ''}
                            </Text>
                        </HStack>

                        {/* Preset buttons */}
                        <HStack gap={2}>
                            {SHIP_OPTIONS.map((n) => (
                                <Button
                                    key={n}
                                    onClick={() => setShipCount(n)}
                                    flex={1}
                                    bg={shipCount === n ? NAVY.accentGlow : "transparent"}
                                    border={`1px solid ${shipCount === n ? NAVY.accent : NAVY.border}`}
                                    color={shipCount === n ? NAVY.accent : NAVY.textDim}
                                    borderRadius="2px"
                                    fontFamily="'Courier New', monospace"
                                    fontWeight="700"
                                    fontSize="xs"
                                    letterSpacing="0.1em"
                                    py={4}
                                    _hover={{ borderColor: NAVY.accent, color: NAVY.accent }}
                                    _active={{ transform: "scale(0.97)" }}
                                    transition="all 0.12s ease"
                                >
                                    {n}
                                </Button>
                            ))}
                        </HStack>

                        {/* Custom input */}
                        <HStack gap={3} align="center">
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="9px"
                                color={NAVY.textDim}
                                letterSpacing="0.1em"
                                textTransform="uppercase"
                                flexShrink={0}
                            >
                                Personnalisé
                            </Text>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={shipCount}
                                onChange={(e) => setShipCount(Number(e.target.value))}
                                fontFamily="'Courier New', monospace"
                                fontSize="sm"
                                fontWeight="700"
                                bg="rgba(0,0,0,0.3)"
                                border={`1px solid ${NAVY.border}`}
                                borderRadius="2px"
                                color={NAVY.white}
                                textAlign="center"
                                _focus={{
                                    borderColor: NAVY.accent,
                                    boxShadow: `0 0 0 1px ${NAVY.accent}`,
                                    outline: "none",
                                }}
                                _hover={{ borderColor: NAVY.text }}
                                size="sm"
                            />
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="9px"
                                color={NAVY.textDim}
                                letterSpacing="0.1em"
                            >
                                (1 – 10)
                            </Text>
                        </HStack>
                    </VStack>

                    {/* Error */}
                    <Box
                        overflow="hidden"
                        maxH={error ? "30px" : "0px"}
                        style={{ transition: "max-height 0.2s ease" }}
                    >
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="xs"
                            color={NAVY.danger}
                            letterSpacing="0.08em"
                        >
                            ⚠ &nbsp;{error}
                        </Text>
                    </Box>

                    {/* Actions */}
                    <HStack gap={3} pt={1}>
                        <Button
                            onClick={onClose}
                            flex={1}
                            bg="transparent"
                            border={`1px solid ${NAVY.border}`}
                            color={NAVY.textDim}
                            borderRadius="2px"
                            fontFamily="'Courier New', monospace"
                            fontWeight="700"
                            letterSpacing="0.12em"
                            fontSize="xs"
                            textTransform="uppercase"
                            py={5}
                            _hover={{ borderColor: NAVY.text, color: NAVY.text }}
                            _active={{ transform: "scale(0.98)" }}
                            transition="all 0.15s ease"
                        >
                            ✕ &nbsp;Annuler
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            flex={2}
                            bg={NAVY.accentGlow}
                            border={`1px solid ${NAVY.accent}`}
                            color={NAVY.accent}
                            borderRadius="2px"
                            fontFamily="'Courier New', monospace"
                            fontWeight="700"
                            letterSpacing="0.12em"
                            fontSize="xs"
                            textTransform="uppercase"
                            py={5}
                            opacity={loading ? 0.4 : 1}
                            _hover={loading ? {} : { opacity: 0.85, transform: "translateY(-1px)" }}
                            _active={{ transform: "scale(0.98)" }}
                            transition="all 0.15s ease"
                        >
                            {loading ? "Création..." : "⊕ \u00A0Lancer la partie"}
                        </Button>
                    </HStack>
                </VStack>
            </Box>
        </Box>
    );
};

export default CreateGameModal;