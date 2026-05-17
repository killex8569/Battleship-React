import React, {useState, useEffect, useCallback, useRef} from 'react';
import { useNavigate } from 'react-router';
import BattleshipService from '../services/battleshipService';
import CreateGameModal from './CreateGameModal';
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    Center,
    Separator,
    Grid,
} from '@chakra-ui/react';

const NAVY = {
    bg: "#0a0f1a",
    border: "#1a3a5c",
    accent: "#00c896",
    accentGlow: "rgba(0, 200, 150, 0.15)",
    text: "#b8d4e8",
    textDim: "#4a7a99",
    danger: "#e05c5c",
    white: "#e8f4ff",
    yellow: "#f0c040",
};

const gridBg = {
    backgroundImage: `
        linear-gradient(rgba(0, 200, 150, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 200, 150, 0.04) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
};

const POLL_INTERVAL = 5000;

interface Game {
    id: number;
    status: string;
    gridSize: number;
    shipCount: number;
    currentTurnPlayerId: number | null;
    winnerPlayerId: number | null;
    createdAt: string;
}

const StatBadge: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <VStack gap={0} align="center">
        <Text
            fontFamily="'Courier New', monospace"
            fontSize="14px"
            fontWeight="700"
            color={NAVY.white}
            letterSpacing="0.05em"
        >
            {value}
        </Text>
        <Text
            fontFamily="'Courier New', monospace"
            fontSize="9px"
            color={NAVY.textDim}
            letterSpacing="0.15em"
            textTransform="uppercase"
        >
            {label}
        </Text>
    </VStack>
);

const GameCard: React.FC<{ game: Game; onJoin: (id: number) => void; joining: number | null }> = ({
                                                                                                      game,
                                                                                                      onJoin,
                                                                                                      joining,
                                                                                                  }) => {
    const isJoining = joining === game.id;

    const formatDate = (raw: string) => {
        const d = new Date(raw.replace(' ', 'T'));
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <Box
            border={`1px solid ${NAVY.border}`}
            borderRadius="2px"
            overflow="hidden"
            transition="border-color 0.15s ease"
            _hover={{ borderColor: NAVY.accent }}
        >
            {/* Card header */}
            <HStack
                px={4}
                py={2}
                bg="rgba(26, 58, 92, 0.25)"
                borderBottom={`1px solid ${NAVY.border}`}
                justify="space-between"
            >
                <HStack gap={2}>
                    <Box
                        w="6px"
                        h="6px"
                        borderRadius="50%"
                        bg={NAVY.accent}
                        boxShadow={`0 0 6px ${NAVY.accent}`}
                        flexShrink={0}
                    />
                    <Text
                        fontFamily="'Courier New', monospace"
                        fontSize="xs"
                        fontWeight="700"
                        color={NAVY.white}
                        letterSpacing="0.1em"
                    >
                        PARTIE #{String(game.id).padStart(4, '0')}
                    </Text>
                </HStack>
                <Text
                    fontFamily="'Courier New', monospace"
                    fontSize="9px"
                    color={NAVY.textDim}
                    letterSpacing="0.1em"
                >
                    {formatDate(game.createdAt)}
                </Text>
            </HStack>

            {/* Card body */}
            <HStack px={4} py={3} justify="space-between" align="center">
                <HStack gap={6}>
                    <StatBadge label="Grille" value={`${game.gridSize}×${game.gridSize}`} />
                    <Box w="1px" h="28px" bg={NAVY.border} />
                    <StatBadge label="Navires" value={game.shipCount} />
                </HStack>

                <Button
                    onClick={() => onJoin(game.id)}
                    disabled={isJoining}
                    bg={NAVY.accentGlow}
                    border={`1px solid ${NAVY.accent}`}
                    color={NAVY.accent}
                    borderRadius="2px"
                    fontFamily="'Courier New', monospace"
                    fontWeight="700"
                    letterSpacing="0.12em"
                    fontSize="xs"
                    textTransform="uppercase"
                    px={5}
                    py={4}
                    opacity={isJoining ? 0.5 : 1}
                    _hover={isJoining ? {} : { opacity: 0.85, transform: "translateY(-1px)" }}
                    _active={{ transform: "scale(0.98)" }}
                    transition="all 0.15s ease"
                    flexShrink={0}
                >
                    {isJoining ? "..." : "→ Rejoindre"}
                </Button>
            </HStack>
        </Box>
    );
};

const Lobby: React.FC = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
    const [joining, setJoining] = useState<number | null>(null);
    const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000);
    const [showCreate, setShowCreate] = useState(false);
    const sonarRef = useRef<HTMLAudioElement>(null);

    const fetchGames = useCallback(async () => {
        if (sonarRef.current) {
            sonarRef.current.currentTime = 0;  // 👈 repart du début
            sonarRef.current.play().catch(() => {}); // catch pour éviter l'erreur browser si pas d'interaction utilisateur
        }
        try {
            const data = await BattleshipService.getGames();
            setGames(data);
            setLastRefresh(new Date());
        } catch (err) {
            console.error("Erreur fetch games:", err);
        } finally {
            setLoading(false);
            setCountdown(POLL_INTERVAL / 1000);
        }
    }, []);

    // Polling
    useEffect(() => {
        fetchGames();
        const interval = setInterval(fetchGames, POLL_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchGames]);

    // Countdown visuel
    useEffect(() => {
        const tick = setInterval(() => {
            setCountdown((c) => (c <= 1 ? POLL_INTERVAL / 1000 : c - 1));
        }, 1000);
        return () => clearInterval(tick);
    }, [lastRefresh]);

    const handleJoin = async (gameId: number) => {
        setJoining(gameId);
        try {
            // TODO: remplacer par BattleshipService.joinGame(gameId)
            await BattleshipService.joinGame(gameId);
            navigate(`/game/${gameId}`);
        } catch (err) {
            console.error("Erreur join:", err);
            setJoining(null);
        }
    };

    return (
        <Center
            minH="100vh"
            minW="100vw"
            bg={NAVY.bg}
            position="relative"
            overflow="hidden"
            style={gridBg}
            alignItems="flex-start"
        >
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="700px"
                h="700px"
                borderRadius="50%"
                background="radial-gradient(circle, rgba(0,200,150,0.03) 0%, transparent 70%)"
                pointerEvents="none"
            />
            <audio ref={sonarRef} src="/src/assets/sonar.wav" preload="auto" />

            <VStack
                position="relative"
                zIndex={1}
                gap={6}
                w="100%"
                maxW="600px"
                px={4}
                py={10}
            >
                {/* Header */}
                <VStack gap={1} w="100%">
                    <HStack gap={2} justify="center" mb={1}>
                        <Box
                            w="6px"
                            h="6px"
                            borderRadius="50%"
                            bg={NAVY.accent}
                            boxShadow={`0 0 6px ${NAVY.accent}`}
                        />
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="10px"
                            color={NAVY.accent}
                            letterSpacing="0.2em"
                            textTransform="uppercase"
                        >
                            Battleship
                        </Text>
                    </HStack>
                    <Text
                        fontFamily="'Courier New', monospace"
                        fontSize="2xl"
                        fontWeight="700"
                        color={NAVY.white}
                        letterSpacing="0.3em"
                        textTransform="uppercase"
                        textAlign="center"
                        lineHeight={1}
                    >
                        Salon des parties
                    </Text>
                </VStack>

                <Separator borderColor={NAVY.border} />

                {/* Toolbar */}
                <HStack w="100%" justify="space-between" align="center">
                    {/* Refresh status */}
                    <HStack gap={3}>
                        <HStack gap={2}>
                            <Box
                                w="6px"
                                h="6px"
                                borderRadius="50%"
                                bg={NAVY.accent}
                                boxShadow={`0 0 6px ${NAVY.accent}`}
                            />
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="10px"
                                color={NAVY.textDim}
                                letterSpacing="0.1em"
                                textTransform="uppercase"
                            >
                                Actu. dans {countdown}s
                            </Text>
                        </HStack>
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="10px"
                            color={NAVY.textDim}
                            letterSpacing="0.05em"
                        >
                            {games.length} partie{games.length !== 1 ? 's' : ''} en attente
                        </Text>
                    </HStack>

                    {/* Actions */}
                    <HStack gap={3}>
                        <Button
                            onClick={fetchGames}
                            bg="transparent"
                            border={`1px solid ${NAVY.border}`}
                            color={NAVY.textDim}
                            borderRadius="2px"
                            fontFamily="'Courier New', monospace"
                            fontWeight="700"
                            letterSpacing="0.12em"
                            fontSize="xs"
                            textTransform="uppercase"
                            px={4}
                            py={4}
                            _hover={{ borderColor: NAVY.text, color: NAVY.text }}
                            _active={{ transform: "scale(0.98)" }}
                            transition="all 0.15s ease"
                        >
                            ↺ Refresh
                        </Button>
                        <Button
                            onClick={() => setShowCreate(true)}
                            bg={NAVY.accentGlow}
                            border={`1px solid ${NAVY.accent}`}
                            color={NAVY.accent}
                            borderRadius="2px"
                            fontFamily="'Courier New', monospace"
                            fontWeight="700"
                            letterSpacing="0.12em"
                            fontSize="xs"
                            textTransform="uppercase"
                            px={4}
                            py={4}
                            _hover={{ opacity: 0.85, transform: "translateY(-1px)" }}
                            _active={{ transform: "scale(0.98)" }}
                            transition="all 0.15s ease"
                        >
                            ⊕ Créer
                        </Button>
                    </HStack>
                </HStack>

                {/* Game list */}
                <VStack w="100%" gap={3} align="stretch">
                    {loading ? (
                        <Box
                            border={`1px solid ${NAVY.border}`}
                            borderRadius="2px"
                            p={8}
                            textAlign="center"
                        >
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="xs"
                                color={NAVY.textDim}
                                letterSpacing="0.15em"
                                textTransform="uppercase"
                            >
                                Scan en cours...
                            </Text>
                        </Box>
                    ) : games.length === 0 ? (
                        <Box
                            border={`1px dashed ${NAVY.border}`}
                            borderRadius="2px"
                            p={10}
                            textAlign="center"
                        >
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="xs"
                                color={NAVY.textDim}
                                letterSpacing="0.15em"
                                textTransform="uppercase"
                                mb={2}
                            >
                                Aucune partie en attente
                            </Text>
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="10px"
                                color={NAVY.textDim}
                                letterSpacing="0.1em"
                            >
                                Créez la première ou attendez le prochain scan.
                            </Text>
                        </Box>
                    ) : (
                        games.map((game) => (
                            <GameCard
                                key={game.id}
                                game={game}
                                onJoin={handleJoin}
                                joining={joining}
                            />
                        ))
                    )}
                </VStack>

                {showCreate && <CreateGameModal onClose={() => setShowCreate(false)} />}

                <Separator borderColor={NAVY.border} />

                {/* Footer nav */}
                <HStack w="100%" justify="space-between">
                    <Button
                        onClick={() => navigate('/hub')}
                        bg="transparent"
                        border={`1px solid ${NAVY.border}`}
                        color={NAVY.textDim}
                        borderRadius="2px"
                        fontFamily="'Courier New', monospace"
                        fontWeight="700"
                        letterSpacing="0.12em"
                        fontSize="xs"
                        textTransform="uppercase"
                        px={4}
                        py={4}
                        _hover={{ borderColor: NAVY.text, color: NAVY.text }}
                        _active={{ transform: "scale(0.98)" }}
                        transition="all 0.15s ease"
                    >
                        ← Retour
                    </Button>
                    {lastRefresh && (
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="9px"
                            color={NAVY.textDim}
                            letterSpacing="0.1em"
                        >
                            Dernier scan : {lastRefresh.toLocaleTimeString('fr-FR')}
                        </Text>
                    )}
                </HStack>
            </VStack>
        </Center>
    );
};

export default Lobby;