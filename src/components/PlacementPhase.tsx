import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Button, HStack, VStack, Text, Center } from '@chakra-ui/react';
import type { Game } from '@/types';
import BattleshipService from '@/services/battleshipService';

const NAVY = {
    bg: "#0a0f1a",
    border: "#1a3a5c",
    accent: "#00c896",
    accentGlow: "rgba(0, 200, 150, 0.15)",
    text: "#b8d4e8",
    textDim: "#4a7a99",
    danger: "#e05c5c",
    white: "#e8f4ff",
    ship: "rgba(0, 150, 200, 0.55)",
    previewOk: "rgba(0, 200, 150, 0.4)",
    previewBad: "rgba(224, 92, 92, 0.5)",
};

const COL_LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];

interface PlacedShip {
    id: number;
    shipId: number;
    name: string;
    length: number;
    placed: boolean;
    x: number | null;
    y: number | null;
    orientation: 'H' | 'V' | null;
}

type CellState = 'empty' | 'ship' | 'preview-ok' | 'preview-bad';

interface Props {
    game: Game;
    gameId: string;
}

const PlacementPhase: React.FC<Props> = ({ game, gameId }) => {
    const [ships, setShips] = useState<PlacedShip[]>([]);
    const [selectedShipId, setSelectedShipId] = useState<number | null>(null);
    const [orientation, setOrientation] = useState<'H' | 'V'>('H');
    const [hoverCell, setHoverCell] = useState<{ r: number; c: number } | null>(null);
    const [placing, setPlacing] = useState(false);
    const [readying, setReadying] = useState(false);
    const [myReady, setMyReady] = useState(false);
    const [error, setError] = useState('');

    const currentUserId = Number(localStorage.getItem('userId') ?? 0);
    const isPlayer1 = game.player1?.id === currentUserId;
    const myInfo = isPlayer1 ? game.player1 : game.player2;
    const opponentInfo = isPlayer1 ? game.player2 : game.player1;

    const fetchShips = useCallback(async () => {
        try {
            const data = await BattleshipService.getMyShips(gameId);
            setShips(data.map((s: any) => ({
                id: s.id,
                shipId: s.shipId,
                name: s.name,
                length: s.length,
                placed: s.placed,
                x: s.x,
                y: s.y,
                orientation: s.orientation === 'horizontal' ? 'H' : s.orientation === 'vertical' ? 'V' : null,
            })));
        } catch (e) {
            console.error('fetchShips error:', e);
        }
    }, [gameId]);

    useEffect(() => {
        fetchShips();
    }, [fetchShips]);

    useEffect(() => {
        if (myInfo?.ready) setMyReady(true);
    }, [myInfo?.ready]);

    const selectedShip = ships.find(s => s.shipId === selectedShipId) ?? null;
    const allPlaced = ships.length > 0 && ships.every(s => s.placed);

    // Build grid state
    const grid: CellState[][] = useMemo(() => {
        const g: CellState[][] = Array.from({ length: game.gridSize }, () =>
            Array(game.gridSize).fill('empty') as CellState[]
        );

        // Draw placed ships
        ships.filter(s => s.placed).forEach(ship => {
            for (let i = 0; i < ship.length; i++) {
                const r = ship.orientation === 'V' ? ship.y! + i : ship.y!;
                const c = ship.orientation === 'H' ? ship.x! + i : ship.x!;
                if (r >= 0 && r < game.gridSize && c >= 0 && c < game.gridSize) {
                    g[r][c] = 'ship';
                }
            }
        });

        // Draw preview
        if (selectedShip && hoverCell) {
            let valid = true;
            const previewCells: { r: number; c: number }[] = [];
            for (let i = 0; i < selectedShip.length; i++) {
                const r = orientation === 'V' ? hoverCell.r + i : hoverCell.r;
                const c = orientation === 'H' ? hoverCell.c + i : hoverCell.c;
                if (r < 0 || r >= game.gridSize || c < 0 || c >= game.gridSize) { valid = false; break; }
                // Check collision with already placed ships (skip the ship being repositioned)
                if (g[r][c] === 'ship' && !(
                    selectedShip.placed &&
                    selectedShip.orientation === orientation &&
                    ((orientation === 'H' && selectedShip.y === hoverCell.r &&
                        c >= selectedShip.x! && c < selectedShip.x! + selectedShip.length) ||
                     (orientation === 'V' && selectedShip.x === hoverCell.c &&
                        r >= selectedShip.y! && r < selectedShip.y! + selectedShip.length))
                )) { valid = false; }
                previewCells.push({ r, c });
            }
            previewCells.forEach(({ r, c }) => {
                if (r >= 0 && r < game.gridSize && c >= 0 && c < game.gridSize) {
                    g[r][c] = valid ? 'preview-ok' : 'preview-bad';
                }
            });
        }

        return g;
    }, [ships, selectedShip, hoverCell, orientation, game.gridSize]);

    const handleCellClick = async (r: number, c: number) => {
        if (!selectedShip || placing || myReady) return;
        setError('');
        setPlacing(true);
        try {
            await BattleshipService.placeShip(gameId, selectedShip.shipId, r, c, orientation);
            await fetchShips();
            // Auto-select next unplaced ship
            const updated = await BattleshipService.getMyShips(gameId);
            const nextUnplaced = updated.find((s: any) => !s.placed && s.shipId !== selectedShip.shipId);
            setSelectedShipId(nextUnplaced?.shipId ?? null);
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'Erreur de placement');
        } finally {
            setPlacing(false);
        }
    };

    const handleReady = async () => {
        setReadying(true);
        setError('');
        try {
            await BattleshipService.ready(gameId);
            setMyReady(true);
        } catch (e: any) {
            setError(e.response?.data?.error ?? 'Erreur');
            setReadying(false);
        }
    };

    const cellBg = (state: CellState): string => {
        switch (state) {
            case 'ship':        return NAVY.ship;
            case 'preview-ok':  return NAVY.previewOk;
            case 'preview-bad': return NAVY.previewBad;
            default:            return 'rgba(13,21,38,0.8)';
        }
    };

    return (
        <Center minH="100vh" minW="100vw" bg={NAVY.bg} alignItems="flex-start" overflow="auto">
            <VStack gap={0} w="100%" maxW="1100px" px={4} py={8}>

                {/* Header */}
                <HStack w="100%" justify="space-between" mb={6}>
                    <HStack gap={2}>
                        <Box w="6px" h="6px" borderRadius="50%" bg={NAVY.accent} boxShadow={`0 0 6px ${NAVY.accent}`} />
                        <Text fontFamily="'Courier New', monospace" fontSize="xs" fontWeight="700"
                            color={NAVY.accent} letterSpacing="0.2em" textTransform="uppercase">
                            Placement des navires — Partie #{String(game.id).padStart(4,'0')}
                        </Text>
                    </HStack>
                    <HStack gap={4}>
                        <Text fontFamily="'Courier New', monospace" fontSize="10px" color={myReady ? NAVY.accent : NAVY.textDim}>
                            Toi : {myReady ? '✓ Prêt' : 'En cours...'}
                        </Text>
                        <Text fontFamily="'Courier New', monospace" fontSize="10px" color={(opponentInfo?.ready) ? NAVY.accent : NAVY.textDim}>
                            {opponentInfo?.name ?? '...'} : {(opponentInfo?.ready) ? '✓ Prêt' : 'En attente...'}
                        </Text>
                    </HStack>
                </HStack>

                <HStack gap={8} w="100%" align="flex-start">

                    {/* Grid */}
                    <Box flex={1}>
                        <Text fontFamily="'Courier New', monospace" fontSize="10px" color={NAVY.textDim}
                            letterSpacing="0.15em" textTransform="uppercase" mb={2}>
                            {myReady ? 'Votre flotte (placement verrouillé)' : selectedShip
                                ? `Placement : ${selectedShip.name} (${selectedShip.length} cases) — orientation ${orientation}`
                                : 'Sélectionnez un navire'}
                        </Text>

                        {/* Col headers */}
                        <HStack gap={0} ml="24px" mb="2px">
                            {COL_LABELS.slice(0, game.gridSize).map(l => (
                                <Box key={l} flex={1} textAlign="center">
                                    <Text fontFamily="'Courier New', monospace" fontSize="9px" color={NAVY.textDim}>{l}</Text>
                                </Box>
                            ))}
                        </HStack>

                        {/* Grid rows */}
                        <VStack gap={0}>
                            {grid.map((row, rIdx) => (
                                <HStack key={rIdx} gap={0} w="100%">
                                    <Box w="24px" flexShrink={0} textAlign="right" pr="4px">
                                        <Text fontFamily="'Courier New', monospace" fontSize="9px" color={NAVY.textDim}>{rIdx + 1}</Text>
                                    </Box>
                                    <HStack gap={0} flex={1}>
                                        {row.map((cellState, cIdx) => (
                                            <Box
                                                key={cIdx}
                                                flex={1}
                                                paddingBottom="100%"
                                                position="relative"
                                                border={`1px solid ${NAVY.border}`}
                                                borderRadius="1px"
                                                bg={cellBg(cellState)}
                                                cursor={selectedShip && !myReady ? 'crosshair' : 'default'}
                                                transition="background 0.08s"
                                                onClick={() => handleCellClick(rIdx, cIdx)}
                                                onMouseEnter={() => setHoverCell({ r: rIdx, c: cIdx })}
                                                onMouseLeave={() => setHoverCell(null)}
                                            />
                                        ))}
                                    </HStack>
                                </HStack>
                            ))}
                        </VStack>
                    </Box>

                    {/* Sidebar */}
                    <VStack gap={4} w="220px" flexShrink={0} align="stretch">

                        {/* Orientation */}
                        {!myReady && (
                            <Box border={`1px solid ${NAVY.border}`} borderRadius="2px" p={3}>
                                <Text fontFamily="'Courier New', monospace" fontSize="9px" color={NAVY.textDim}
                                    letterSpacing="0.15em" textTransform="uppercase" mb={2}>
                                    Orientation
                                </Text>
                                <HStack gap={2}>
                                    {(['H', 'V'] as const).map(o => (
                                        <Button key={o} flex={1} onClick={() => setOrientation(o)}
                                            bg={orientation === o ? NAVY.accentGlow : 'transparent'}
                                            border={`1px solid ${orientation === o ? NAVY.accent : NAVY.border}`}
                                            color={orientation === o ? NAVY.accent : NAVY.textDim}
                                            borderRadius="2px" fontFamily="'Courier New', monospace"
                                            fontWeight="700" fontSize="xs" py={4}
                                            _hover={{ borderColor: NAVY.accent, color: NAVY.accent }}
                                            _active={{ transform: 'scale(0.97)' }}>
                                            {o === 'H' ? '⟷ H' : '↕ V'}
                                        </Button>
                                    ))}
                                </HStack>
                            </Box>
                        )}

                        {/* Ship list */}
                        <Box border={`1px solid ${NAVY.border}`} borderRadius="2px" overflow="hidden">
                            <Box px={3} py={2} bg="rgba(26,58,92,0.25)" borderBottom={`1px solid ${NAVY.border}`}>
                                <Text fontFamily="'Courier New', monospace" fontSize="9px" color={NAVY.accent}
                                    letterSpacing="0.15em" textTransform="uppercase">
                                    Flotte ({ships.filter(s => s.placed).length}/{ships.length} placés)
                                </Text>
                            </Box>
                            <VStack gap={0} align="stretch">
                                {ships.map(ship => {
                                    const isSelected = selectedShipId === ship.shipId;
                                    return (
                                        <Box key={ship.id}
                                            px={3} py={2}
                                            bg={isSelected ? NAVY.accentGlow : 'transparent'}
                                            border={isSelected ? `1px solid ${NAVY.accent}` : '1px solid transparent'}
                                            cursor={myReady ? 'default' : 'pointer'}
                                            onClick={() => !myReady && setSelectedShipId(ship.shipId)}
                                            _hover={myReady ? {} : { bg: 'rgba(0,200,150,0.08)' }}
                                            transition="all 0.1s">
                                            <HStack justify="space-between">
                                                <VStack gap={0} align="flex-start">
                                                    <Text fontFamily="'Courier New', monospace" fontSize="xs"
                                                        fontWeight="700"
                                                        color={ship.placed ? NAVY.accent : isSelected ? NAVY.white : NAVY.text}>
                                                        {ship.placed ? '✓ ' : ''}{ship.name}
                                                    </Text>
                                                    <HStack gap={1} mt="2px">
                                                        {Array.from({ length: ship.length }).map((_, i) => (
                                                            <Box key={i} w="8px" h="8px" borderRadius="1px"
                                                                bg={ship.placed ? NAVY.ship : isSelected ? NAVY.accent : NAVY.border} />
                                                        ))}
                                                    </HStack>
                                                </VStack>
                                                <Text fontFamily="'Courier New', monospace" fontSize="9px" color={NAVY.textDim}>
                                                    {ship.length}
                                                </Text>
                                            </HStack>
                                        </Box>
                                    );
                                })}
                            </VStack>
                        </Box>

                        {/* Error */}
                        {error && (
                            <Text fontFamily="'Courier New', monospace" fontSize="xs" color={NAVY.danger} letterSpacing="0.08em">
                                ⚠ {error}
                            </Text>
                        )}

                        {/* Ready button */}
                        {!myReady ? (
                            <Button onClick={handleReady} disabled={!allPlaced || readying}
                                bg={allPlaced ? NAVY.accentGlow : 'transparent'}
                                border={`1px solid ${allPlaced ? NAVY.accent : NAVY.border}`}
                                color={allPlaced ? NAVY.accent : NAVY.textDim}
                                borderRadius="2px" fontFamily="'Courier New', monospace"
                                fontWeight="700" letterSpacing="0.12em" fontSize="xs"
                                textTransform="uppercase" py={5}
                                opacity={allPlaced ? 1 : 0.4}
                                _hover={allPlaced ? { opacity: 0.85, transform: 'translateY(-1px)' } : {}}
                                _active={{ transform: 'scale(0.98)' }}
                                transition="all 0.15s">
                                {readying ? 'Envoi...' : '→ Je suis prêt'}
                            </Button>
                        ) : (
                            <Box border={`1px solid ${NAVY.accent}`} borderRadius="2px" p={3} bg={NAVY.accentGlow}>
                                <Text fontFamily="'Courier New', monospace" fontSize="xs" color={NAVY.accent}
                                    fontWeight="700" letterSpacing="0.1em" textAlign="center">
                                    ✓ En attente de {opponentInfo?.name ?? "l'adversaire"}...
                                </Text>
                            </Box>
                        )}

                        {/* Legend */}
                        <Box border={`1px solid ${NAVY.border}`} borderRadius="2px" p={3}>
                            <Text fontFamily="'Courier New', monospace" fontSize="9px" color={NAVY.textDim}
                                letterSpacing="0.15em" textTransform="uppercase" mb={2}>Légende</Text>
                            {[
                                { label: 'Navire placé', color: NAVY.ship },
                                { label: 'Placement valide', color: NAVY.previewOk },
                                { label: 'Placement invalide', color: NAVY.previewBad },
                            ].map(l => (
                                <HStack key={l.label} gap={2} mb={1}>
                                    <Box w="12px" h="12px" borderRadius="1px" bg={l.color} flexShrink={0} />
                                    <Text fontFamily="'Courier New', monospace" fontSize="9px" color={NAVY.textDim}>{l.label}</Text>
                                </HStack>
                            ))}
                        </Box>
                    </VStack>
                </HStack>
            </VStack>
        </Center>
    );
};

export default PlacementPhase;
