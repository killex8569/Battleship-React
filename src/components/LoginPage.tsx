import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import BattleshipService from '../services/battleshipService';
import { Box, Button, Input, VStack, HStack, Text, Center, Separator } from '@chakra-ui/react';

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

const gridBg = {
    backgroundImage: `
        linear-gradient(rgba(0, 200, 150, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 200, 150, 0.04) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
};

const LoginPage: React.FC = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await BattleshipService.login(name, password);
            console.log("Login OK:", data);
            navigate("/hub");
        } catch (err) {
            console.error("Login failed:", err);
            setError("Identifiants incorrects. Réessayez.");
        } finally {
            setLoading(false);
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
        >
            {/* Radial glow */}
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                w="600px"
                h="600px"
                borderRadius="50%"
                background="radial-gradient(circle, rgba(0,200,150,0.04) 0%, transparent 70%)"
                pointerEvents="none"
            />

            <VStack
                position="relative"
                zIndex={1}
                gap={6}
                w="100%"
                maxW="400px"
                px={4}
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
                            Accès sécurisé
                        </Text>
                    </HStack>
                    <Text
                        fontFamily="'Courier New', monospace"
                        fontSize="3xl"
                        fontWeight="700"
                        color={NAVY.white}
                        letterSpacing="0.3em"
                        textTransform="uppercase"
                        textAlign="center"
                        lineHeight={1}
                    >
                        Battleship
                    </Text>
                    <Text
                        fontFamily="'Courier New', monospace"
                        fontSize="10px"
                        color={NAVY.textDim}
                        letterSpacing="0.25em"
                        textTransform="uppercase"
                    >
                        Naval Command Center
                    </Text>
                </VStack>

                <Separator borderColor={NAVY.border} />

                {/* Form panel */}
                <Box
                    w="100%"
                    border={`1px solid ${NAVY.border}`}
                    borderRadius="2px"
                    overflow="hidden"
                >
                    {/* Panel header */}
                    <HStack
                        px={4}
                        py={2}
                        bg="rgba(26, 58, 92, 0.25)"
                        borderBottom={`1px solid ${NAVY.border}`}
                        justify="space-between"
                    >
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="xs"
                            fontWeight="700"
                            color={NAVY.accent}
                            letterSpacing="0.15em"
                            textTransform="uppercase"
                        >
                            Identification
                        </Text>
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="10px"
                            color={NAVY.textDim}
                            letterSpacing="0.1em"
                        >
                            AUTH-01
                        </Text>
                    </HStack>

                    <Box p={5}>
                        <form onSubmit={handleSubmit}>
                            <VStack gap={4} align="stretch">

                                {/* Nom */}
                                <VStack gap={1} align="stretch">
                                    <Text
                                        fontFamily="'Courier New', monospace"
                                        fontSize="10px"
                                        color={NAVY.textDim}
                                        letterSpacing="0.15em"
                                        textTransform="uppercase"
                                    >
                                        Nom d'utilisateur
                                    </Text>
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="commandant"
                                        fontFamily="'Courier New', monospace"
                                        fontSize="sm"
                                        bg="rgba(0,0,0,0.3)"
                                        border={`1px solid ${NAVY.border}`}
                                        borderRadius="2px"
                                        color={NAVY.white}
                                        _placeholder={{ color: NAVY.textDim }}
                                        _focus={{
                                            borderColor: NAVY.accent,
                                            boxShadow: `0 0 0 1px ${NAVY.accent}`,
                                            bg: "rgba(0,200,150,0.04)",
                                            outline: "none",
                                        }}
                                        _hover={{ borderColor: NAVY.text }}
                                    />
                                </VStack>

                                {/* Password */}
                                <VStack gap={1} align="stretch">
                                    <Text
                                        fontFamily="'Courier New', monospace"
                                        fontSize="10px"
                                        color={NAVY.textDim}
                                        letterSpacing="0.15em"
                                        textTransform="uppercase"
                                    >
                                        Mot de passe
                                    </Text>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        fontFamily="'Courier New', monospace"
                                        fontSize="sm"
                                        bg="rgba(0,0,0,0.3)"
                                        border={`1px solid ${NAVY.border}`}
                                        borderRadius="2px"
                                        color={NAVY.white}
                                        _placeholder={{ color: NAVY.textDim }}
                                        _focus={{
                                            borderColor: NAVY.accent,
                                            boxShadow: `0 0 0 1px ${NAVY.accent}`,
                                            bg: "rgba(0,200,150,0.04)",
                                            outline: "none",
                                        }}
                                        _hover={{ borderColor: NAVY.text }}
                                    />
                                </VStack>

                                {/* Error */}
                                <Box
                                    overflow="hidden"
                                    maxH={error ? "40px" : "0px"}
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

                                {/* Submit */}
                                <Button
                                    type="submit"
                                    width="full"
                                    disabled={loading || !name || !password}
                                    mt={1}
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
                                    opacity={loading || !name || !password ? 0.4 : 1}
                                    cursor={loading || !name || !password ? "not-allowed" : "pointer"}
                                    _hover={
                                        loading || !name || !password
                                            ? {}
                                            : { opacity: 0.85, transform: "translateY(-1px)" }
                                    }
                                    _active={{ transform: "scale(0.98)" }}
                                    transition="all 0.15s ease"
                                >
                                    {loading ? "Connexion..." : "→ \u00A0Se connecter"}
                                </Button>
                            </VStack>
                        </form>
                    </Box>
                </Box>
            </VStack>
        </Center>
    );
};

export default LoginPage;