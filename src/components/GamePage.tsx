import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box, HStack, VStack, Text, Grid } from '@chakra-ui/react';
import type { Game, Tile, Ship } from '@/types.ts';
import GameBoard from '@/components/GameBoard';
import UserCard from '@/components/UserCard';
import ScoreBoard from '@/components/ScoreBoard';
import ShipTracker from '@/components/ShipTracker';
import BattleshipService from '@/services/battleshipService';

const NAVY = {
    bg: "#0a0f1a",
    border: "#1a3a5c",
    accent: "#00c896",
    textDim: "#4a7a99",
    white: "#e8f4ff",
    panel: "rgba(13, 21, 38, 0.9)",
};

const gridBg = {
    backgroundImage: `
        linear-gradient(rgba(0, 200, 150, 0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 200, 150, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
};

const POLL_INTERVAL = 3000;

const buildEmptyGrid = (size: number): Tile[][] =>
    Array.from({ length: size }, (_, row) =>
        Array.from({ length: size }, (_, col) => ({ row, col, state: 'empty' as const }))
    );

// Helper: transforme la réponse API board en Tile[][]
const buildGridFromApi = (apiBoard: any[], gridSize: number): Tile[][] => {
    const grid = buildEmptyGrid(gridSize);
    apiBoard.forEach((cell: any) => {
        const row = cell.y;
        const col = cell.x;
        if (grid[row]?.[col]) {
            if (cell.result === 'hit') grid[row][col].state = 'hit';
            else if (cell.result === 'miss') grid[row][col].state = 'miss';
            else if (cell.shipId) grid[row][col].state = 'ship';
        }
    });
    return grid;
};

// Helper: transforme la réponse API ships en Ship[]
const buildShipsFromApi = (apiShips: any[]): Ship[] =>
    apiShips.map((s: any) => ({
        id: s.id,
        name: s.name,
        tacticalName: s.tacticalName ?? '',
        length: s.length,
        size: s.length,
        isSunk: s.status === 'sunk',
        hits: s.hitCount ?? 0,
        cells: [],
    }));

const ATTACK_LEGEND = [
    { label: 'Raté',   color: 'rgba(40,80,120,0.6)' },
    { label: 'Touché', color: '#c0392b' },
    { label: 'Coulé',  color: '#8b0000' },
];

const FLEET_LEGEND = [
    { label: 'Bateau',  color: 'rgba(70,110,160,0.5)' },
    { label: 'Touché',  color: '#c0392b' },
];

const GamePage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();

    // TODO: décoder le vrai userId depuis le JWT (ex: jwt-decode)
    const currentUserId = Number(localStorage.getItem('userId') ?? 1);

    const [game, setGame]                   = useState<Game | null>(null);
    const [myGrid, setMyGrid]               = useState<Tile[][]>(buildEmptyGrid(10));
    const [opponentGrid, setOpponentGrid]   = useState<Tile[][]>(buildEmptyGrid(10));
    const [myShips, setMyShips]             = useState<Ship[]>([]);
    const [opponentShips, setOpponentShips] = useState<Ship[]>([]);
    const [message, setMessage]             = useState('Chargement de la partie...');
    const [firing, setFiring]               = useState(false);

    const isMyTurn      = game?.currentTurnPlayerId === currentUserId;
    const myPlayer      = game ? (game.player1.id === currentUserId ? game.player1 : game.player2!) : { id: 0, name: '...' };
    const opponentPlayer = game ? (game.player1.id === currentUserId ? game.player2! : game.player1) : { id: 0, name: '...' };
    const mySunkCount       = opponentShips.filter(s => s.isSunk).length;
    const opponentSunkCount = myShips.filter(s => s.isSunk).length;

    // ── Fetch ──────────────────────────────────────────────────────────────────
    const fetchGameState = useCallback(async () => {
        if (!gameId) return;
        try {
            const data = await BattleshipService.getGameById(gameId);
            setGame(data);

            if (data.status === 'finished') {
                const iWon = data.winnerPlayerId === currentUserId;
                setMessage(iWon
                    ? '🎉 Victoire ! Vous avez coulé toute la flotte adverse.'
                    : '💀 Défaite. Votre flotte a été détruite.'
                );
            } else if (data.currentTurnPlayerId === currentUserId) {
                setMessage('Cliquez sur une case adverse pour tirer une torpille.');
            } else {
                setMessage("En attente du tir adverse...");
            }
        } catch (err) {
            console.error('fetchGameState error:', err);
        }
    }, [gameId, currentUserId]);

    const fetchBoards = useCallback(async () => {
        if (!gameId || !game) return;
        try {
            const myBoard = await BattleshipService.getMyBoard(gameId);
            setMyGrid(buildGridFromApi(myBoard, game.gridSize));

            const opponentBoard = await BattleshipService.getOpponentBoard(gameId);
            setOpponentGrid(buildGridFromApi(opponentBoard, game.gridSize));
        } catch (err) {
            console.error('fetchBoards error:', err);
        }
    }, [gameId, game]);

    const fetchShips = useCallback(async () => {
        if (!gameId) return;
        try {
            const mine = await BattleshipService.getMyShips(gameId);
            setMyShips(buildShipsFromApi(mine));

            const opponent = await BattleshipService.getOpponentShips(gameId);
            setOpponentShips(buildShipsFromApi(opponent));
        } catch (err) {
            console.error('fetchShips error:', err);
        }
    }, [gameId]);

    // ── Polling ────────────────────────────────────────────────────────────────
    useEffect(() => {
        fetchGameState();
        fetchShips();

        const interval = setInterval(() => {
            fetchGameState();
            fetchBoards();
            fetchShips();
        }, POLL_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchGameState, fetchBoards, fetchShips]);

    // Fetch boards quand game est chargé (gridSize nécessaire)
    useEffect(() => {
        if (game) fetchBoards();
    }, [game?.gridSize]);

    // ── Fire ───────────────────────────────────────────────────────────────────
    const handleFire = async (row: number, col: number) => {
        if (!isMyTurn || firing || game?.status !== 'playing') return;

        setFiring(true);
        setMessage(`Tir en cours sur ${String.fromCharCode(65 + col)}${row + 1}...`);

        try {
            const result = await BattleshipService.fire(gameId!, row, col);

            // Update optimiste de la tile
            setOpponentGrid(prev => {
                const next = prev.map(r => r.map(t => ({ ...t })));
                next[row][col].state = result.result === 'hit' ? 'hit' : 'miss';
                return next;
            });

            setMessage(
                result.result === 'hit'
                    ? `💥 Touché en ${String.fromCharCode(65 + col)}${row + 1} !`
                    : `🌊 Raté en ${String.fromCharCode(65 + col)}${row + 1}.`
            );

            // Resync complet
            await fetchGameState();
            await fetchBoards();
            await fetchShips();
        } catch (err) {
            console.error('fire error:', err);
            setMessage('Erreur lors du tir. Réessayez.');
        } finally {
            setFiring(false);
        }
    };

    if (!game) {
        return (
            <Box minH="100vh" minW="100vw" bg={NAVY.bg} display="flex" alignItems="center" justifyContent="center">
                <Text fontFamily="'Courier New', monospace" fontSize="xs" color={NAVY.textDim} letterSpacing="0.2em" textTransform="uppercase">
                    Chargement...
                </Text>
            </Box>
        );
    }

    return (
        <Box minH="100vh" minW="100vw" bg={NAVY.bg} style={gridBg} position="relative" overflow="auto">
            <VStack gap={0} align="stretch" p={4} maxW="1400px" mx="auto">

                {/* Header */}
                <HStack justify="space-between" py={3} borderBottom={`1px solid ${NAVY.border}`} mb={4}>
                    <HStack gap={2}>
                        <Box w="6px" h="6px" borderRadius="50%" bg={NAVY.accent} boxShadow={`0 0 6px ${NAVY.accent}`} />
                        <Text fontFamily="'Courier New', monospace" fontSize="xs" fontWeight="700" color={NAVY.accent} letterSpacing="0.2em" textTransform="uppercase">
                            Touché-Coulé — Partie en cours
                        </Text>
                    </HStack>
                    <Text fontFamily="'Courier New', monospace" fontSize="9px" color={NAVY.textDim} letterSpacing="0.1em">
                        PARTIE #{String(game.id).padStart(4, '0')}
                    </Text>
                </HStack>

                {/* Players + Score */}
                <HStack justify="space-between" align="center" bg={NAVY.panel} border={`1px solid ${NAVY.border}`} borderRadius="2px" px={5} py={4} mb={4}>
                    <UserCard player={myPlayer} isMyTurn={isMyTurn ?? false} isLeft={true} />
                    <ScoreBoard myScore={mySunkCount} opponentScore={opponentSunkCount} totalShips={game.shipCount} />
                    <UserCard player={opponentPlayer} isMyTurn={!isMyTurn} isLeft={false} />
                </HStack>

                {/* Boards */}
                <Grid templateColumns="1fr 1fr" gap={6} mb={4}>
                    <GameBoard title="Zone d'attaque" icon="⊕" tiles={opponentGrid} isAttackBoard={true} isMyTurn={(isMyTurn ?? false) && !firing && game.status === 'playing'} onTileClick={handleFire} legend={ATTACK_LEGEND} />
                    <GameBoard title="Votre flotte" icon="○" tiles={myGrid} isAttackBoard={false} isMyTurn={false} legend={FLEET_LEGEND} />
                </Grid>

                {/* Ship trackers */}
                <Grid templateColumns="1fr 1fr" gap={6} mb={4}>
                    <Box border={`1px solid ${NAVY.border}`} borderRadius="2px" p={4} bg={NAVY.panel}>
                        <ShipTracker ships={opponentShips} title="Flotte adverse" />
                    </Box>
                    <Box border={`1px solid ${NAVY.border}`} borderRadius="2px" p={4} bg={NAVY.panel}>
                        <ShipTracker ships={myShips} title="Vos bateaux" />
                    </Box>
                </Grid>

                {/* Message bar */}
                <Box border={`1px solid ${NAVY.border}`} borderRadius="2px" px={5} py={3} bg="rgba(0, 200, 150, 0.04)">
                    <HStack gap={2}>
                        <Box w="6px" h="6px" borderRadius="50%" bg={isMyTurn ? NAVY.accent : NAVY.textDim} boxShadow={isMyTurn ? `0 0 6px ${NAVY.accent}` : 'none'} flexShrink={0} />
                        <Text fontFamily="'Courier New', monospace" fontSize="xs" color={NAVY.textDim} letterSpacing="0.08em">
                            {message}
                        </Text>
                    </HStack>
                </Box>

            </VStack>
        </Box>
    );
};

export default GamePage;