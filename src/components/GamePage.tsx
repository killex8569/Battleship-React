import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box, Button, HStack, VStack, Text, Grid, Center } from '@chakra-ui/react';
import type { Game, Tile, Ship } from '@/types.ts';
import GameBoard from '@/components/GameBoard';
import UserCard from '@/components/UserCard';
import ScoreBoard from '@/components/ScoreBoard';
import ShipTracker from '@/components/ShipTracker';
import PlacementPhase from '@/components/PlacementPhase';
import BattleshipService from '@/services/battleshipService';

const NAVY = {
    bg: "#0a0f1a",
    border: "#1a3a5c",
    accent: "#00c896",
    accentGlow: "rgba(0, 200, 150, 0.15)",
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

const buildGridFromApi = (apiBoard: any[], gridSize: number): Tile[][] => {
    const grid = buildEmptyGrid(gridSize);
    apiBoard.forEach((cell: any) => {
        const row = cell.y;
        const col = cell.x;
        if (grid[row]?.[col]) {
            if (cell.result === 'hit')       grid[row][col].state = 'hit';
            else if (cell.result === 'miss') grid[row][col].state = 'miss';
            else if (cell.shipId)            grid[row][col].state = 'ship';
        }
    });
    return grid;
};

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

// ── Waiting screen ─────────────────────────────────────────────────────────
const WaitingScreen: React.FC<{ gameId: string }> = ({ gameId }) => {
    const navigate = useNavigate();
    const link = `${window.location.origin}/game/${gameId}`;

    return (
        <Center minH="100vh" minW="100vw" bg={NAVY.bg} style={gridBg}>
            <VStack gap={6} maxW="420px" w="100%" px={4}>
                <HStack gap={2}>
                    <Box w="8px" h="8px" borderRadius="50%" bg={NAVY.accent}
                        boxShadow={`0 0 10px ${NAVY.accent}`}
                        style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
                    <Text fontFamily="'Courier New', monospace" fontSize="xs" color={NAVY.accent}
                        letterSpacing="0.2em" textTransform="uppercase">
                        En attente d'un adversaire
                    </Text>
                </HStack>
                <Text fontFamily="'Courier New', monospace" fontSize="xl" fontWeight="700"
                    color={NAVY.white} letterSpacing="0.2em" textTransform="uppercase" textAlign="center">
                    Partie #{String(gameId).padStart(4, '0')}
                </Text>
                <Box border={`1px solid ${NAVY.border}`} borderRadius="2px" p={4} w="100%">
                    <Text fontFamily="'Courier New', monospace" fontSize="9px" color={NAVY.textDim}
                        letterSpacing="0.15em" textTransform="uppercase" mb={2}>
                        Partagez ce lien à votre adversaire
                    </Text>
                    <Text fontFamily="'Courier New', monospace" fontSize="xs" color={NAVY.white}
                        wordBreak="break-all">
                        {link}
                    </Text>
                </Box>
                <Button onClick={() => navigate('/lobby')} bg="transparent"
                    border={`1px solid ${NAVY.border}`} color={NAVY.textDim} borderRadius="2px"
                    fontFamily="'Courier New', monospace" fontWeight="700" letterSpacing="0.12em"
                    fontSize="xs" textTransform="uppercase" px={6} py={4}
                    _hover={{ borderColor: NAVY.white, color: NAVY.white }}
                    _active={{ transform: 'scale(0.98)' }}>
                    ← Retour au lobby
                </Button>
            </VStack>
        </Center>
    );
};

// ── Main GamePage ──────────────────────────────────────────────────────────
const GamePage: React.FC = () => {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();

    const currentUserId = Number(localStorage.getItem('userId') ?? 0);

    const [game, setGame]                   = useState<Game | null>(null);
    const [myGrid, setMyGrid]               = useState<Tile[][]>(buildEmptyGrid(10));
    const [opponentGrid, setOpponentGrid]   = useState<Tile[][]>(buildEmptyGrid(10));
    const [myShips, setMyShips]             = useState<Ship[]>([]);
    const [opponentShips, setOpponentShips] = useState<Ship[]>([]);
    const [message, setMessage]             = useState('Chargement...');
    const [firing, setFiring]               = useState(false);

    const isMyTurn      = game?.currentTurnPlayerId === currentUserId;
    const isPlayer1     = game ? game.player1?.id === currentUserId : false;
    const myPlayer      = game ? (isPlayer1 ? game.player1! : game.player2!) : { id: 0, name: '...' };
    const opponentPlayer = game ? (isPlayer1 ? game.player2! : game.player1!) : { id: 0, name: '...' };
    const mySunkCount       = opponentShips.filter(s => s.isSunk).length;
    const opponentSunkCount = myShips.filter(s => s.isSunk).length;

    const fetchGameState = useCallback(async () => {
        if (!gameId) return;
        try {
            const data = await BattleshipService.getGameById(gameId);
            setGame(data);

            if (data.status === 'finished') {
                const iWon = data.winnerPlayerId === currentUserId;
                setMessage(iWon ? 'Victoire ! Vous avez coulé toute la flotte adverse.' : 'Défaite. Votre flotte a été détruite.');
            } else if (data.status === 'started') {
                setMessage(data.currentTurnPlayerId === currentUserId
                    ? 'Cliquez sur une case adverse pour tirer.'
                    : 'En attente du tir adverse...');
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
            const oppBoard = await BattleshipService.getOpponentBoard(gameId);
            setOpponentGrid(buildGridFromApi(oppBoard, game.gridSize));
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
        } catch {
            // Ships endpoint may not be available in all states
        }
    }, [gameId]);

    useEffect(() => {
        fetchGameState();
        const interval = setInterval(fetchGameState, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchGameState]);

    useEffect(() => {
        if (game?.status === 'started' || game?.status === 'finished') {
            fetchBoards();
            fetchShips();
            const interval = setInterval(() => { fetchBoards(); fetchShips(); }, POLL_INTERVAL);
            return () => clearInterval(interval);
        }
    }, [game?.status, fetchBoards, fetchShips]);

    useEffect(() => {
        if (game) {
            setMyGrid(buildEmptyGrid(game.gridSize));
            setOpponentGrid(buildEmptyGrid(game.gridSize));
        }
    }, [game?.gridSize]);

    const handleFire = async (row: number, col: number) => {
        if (!isMyTurn || firing || game?.status !== 'started') return;
        setFiring(true);
        setMessage(`Tir en cours sur ${String.fromCharCode(65 + col)}${row + 1}...`);
        try {
            const result = await BattleshipService.fire(gameId!, row, col);
            setOpponentGrid(prev => {
                const next = prev.map(r => r.map(t => ({ ...t })));
                next[row][col].state = result.result === 'hit' ? 'hit' : 'miss';
                return next;
            });
            setMessage(result.result === 'hit'
                ? `Touché en ${String.fromCharCode(65 + col)}${row + 1} !`
                : `Raté en ${String.fromCharCode(65 + col)}${row + 1}.`
            );
            await fetchGameState();
            await fetchBoards();
            await fetchShips();
        } catch (err) {
            setMessage('Erreur lors du tir. Réessayez.');
        } finally {
            setFiring(false);
        }
    };

    // ── Loading ───────────────────────────────────────────────────────────
    if (!game) {
        return (
            <Box minH="100vh" minW="100vw" bg={NAVY.bg} display="flex" alignItems="center" justifyContent="center">
                <Text fontFamily="'Courier New', monospace" fontSize="xs" color={NAVY.textDim}
                    letterSpacing="0.2em" textTransform="uppercase">
                    Chargement...
                </Text>
            </Box>
        );
    }

    // ── Waiting for 2nd player ────────────────────────────────────────────
    if (game.status === 'waiting') {
        return <WaitingScreen gameId={gameId!} />;
    }

    // ── Placement phase ───────────────────────────────────────────────────
    if (game.status === 'placement') {
        return <PlacementPhase game={game} gameId={gameId!} />;
    }

    // ── Started / Finished ────────────────────────────────────────────────
    return (
        <Box minH="100vh" minW="100vw" bg={NAVY.bg} style={gridBg} position="relative" overflow="auto">
            <VStack gap={0} align="stretch" p={4} maxW="1400px" mx="auto">

                {/* Header */}
                <HStack justify="space-between" py={3} borderBottom={`1px solid ${NAVY.border}`} mb={4}>
                    <HStack gap={2}>
                        <Box w="6px" h="6px" borderRadius="50%" bg={NAVY.accent} boxShadow={`0 0 6px ${NAVY.accent}`} />
                        <Text fontFamily="'Courier New', monospace" fontSize="xs" fontWeight="700"
                            color={NAVY.accent} letterSpacing="0.2em" textTransform="uppercase">
                            {game.status === 'finished' ? 'Partie terminée' : 'Touché-Coulé — Partie en cours'}
                        </Text>
                    </HStack>
                    <Text fontFamily="'Courier New', monospace" fontSize="9px" color={NAVY.textDim} letterSpacing="0.1em">
                        PARTIE #{String(game.id).padStart(4, '0')}
                    </Text>
                </HStack>

                {/* Players + Score */}
                <HStack justify="space-between" align="center" bg={NAVY.panel}
                    border={`1px solid ${NAVY.border}`} borderRadius="2px" px={5} py={4} mb={4}>
                    <UserCard player={myPlayer} isMyTurn={isMyTurn ?? false} isLeft={true} />
                    <ScoreBoard myScore={mySunkCount} opponentScore={opponentSunkCount} totalShips={game.shipCount} />
                    <UserCard player={opponentPlayer} isMyTurn={!isMyTurn} isLeft={false} />
                </HStack>

                {/* Boards */}
                <Grid templateColumns="1fr 1fr" gap={6} mb={4}>
                    <GameBoard title="Zone d'attaque" icon="⊕" tiles={opponentGrid}
                        isAttackBoard={true}
                        isMyTurn={(isMyTurn ?? false) && !firing && game.status === 'started'}
                        onTileClick={handleFire} legend={ATTACK_LEGEND} />
                    <GameBoard title="Votre flotte" icon="○" tiles={myGrid}
                        isAttackBoard={false} isMyTurn={false} legend={FLEET_LEGEND} />
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
                <Box border={`1px solid ${NAVY.border}`} borderRadius="2px" px={5} py={3}
                    bg="rgba(0, 200, 150, 0.04)">
                    <HStack gap={2}>
                        <Box w="6px" h="6px" borderRadius="50%"
                            bg={isMyTurn ? NAVY.accent : NAVY.textDim}
                            boxShadow={isMyTurn ? `0 0 6px ${NAVY.accent}` : 'none'} flexShrink={0} />
                        <Text fontFamily="'Courier New', monospace" fontSize="xs"
                            color={NAVY.textDim} letterSpacing="0.08em">
                            {message}
                        </Text>
                    </HStack>
                </Box>

            </VStack>
        </Box>
    );
};

export default GamePage;
