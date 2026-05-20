import {
    Text,
    Center,
    Button,
    VStack,
    HStack,
    Box,
    Separator,
    Input,
} from '@chakra-ui/react';
import React, { useState } from "react";
import { useNavigate } from "react-router";

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

interface NavalButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "danger" | "ghost";
    fullWidth?: boolean;
    disabled?: boolean;
}

const NavalButton: React.FC<NavalButtonProps> = ({
                                                     children,
                                                     onClick,
                                                     variant = "primary",
                                                     fullWidth = false,
                                                     disabled = false,
                                                 }) => {
    const styles = {
        primary: {
            bg: NAVY.accentGlow,
            border: `1px solid ${NAVY.accent}`,
            color: NAVY.accent,
        },
        danger: {
            bg: "rgba(224, 92, 92, 0.08)",
            border: `1px solid ${NAVY.danger}`,
            color: NAVY.danger,
        },
        ghost: {
            bg: "transparent",
            border: `1px solid ${NAVY.border}`,
            color: NAVY.textDim,
        },
    }[variant];

    return (
        <Button
            onClick={onClick}
            disabled={disabled}
            width={fullWidth ? "100%" : "auto"}
            borderRadius="2px"
            fontFamily="'Courier New', monospace"
            fontWeight="700"
            letterSpacing="0.12em"
            fontSize="xs"
            textTransform="uppercase"
            px={6}
            py={5}
            transition="all 0.15s ease"
            opacity={disabled ? 0.3 : 1}
            cursor={disabled ? "not-allowed" : "pointer"}
            {...styles}
            _hover={disabled ? {} : { opacity: 0.85, transform: "translateY(-1px)" }}
            _active={{ transform: "scale(0.98)" }}
        >
            {children}
        </Button>
    );
};

const SectionPanel: React.FC<{ title: string; tag: string; children: React.ReactNode }> = ({
                                                                                               title,
                                                                                               tag,
                                                                                               children,
                                                                                           }) => (
    <Box
        w="100%"
        border={`1px solid ${NAVY.border}`}
        borderRadius="2px"
        overflow="hidden"
    >
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
                {title}
            </Text>
            <Text
                fontFamily="'Courier New', monospace"
                fontSize="10px"
                color={NAVY.textDim}
                letterSpacing="0.1em"
            >
                {tag}
            </Text>
        </HStack>
        <Box p={5}>{children}</Box>
    </Box>
);

const Hub: React.FC = () => {
    const navigate = useNavigate();
    const [joinOpen, setJoinOpen] = useState(false);
    const [gameCode, setGameCode] = useState("");

    return (
        <Center
            minH="100vh"
            minW="100vw"
            bg={NAVY.bg}
            position="relative"
            overflow="hidden"
            style={gridBg}
        >
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
                            Système opérationnel
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

                {/* Créer une partie */}
                <SectionPanel title="Recherche de Partie" tag="CMD-01">
                    <VStack gap={3} align="stretch">
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="xs"
                            color={NAVY.textDim}
                            letterSpacing="0.08em"
                        >
                            Créer ou rejoindre une partie.
                        </Text>
                        <NavalButton
                            fullWidth
                            onClick={() => {
                                // TODO: appel API createGame()
                                navigate("/lobby");
                            }}
                        >
                            ⊕ &nbsp;Jouer
                        </NavalButton>
                    </VStack>
                </SectionPanel>

                {/* Rejoindre */}
                <SectionPanel title="Rejoindre" tag="CMD-02">
                    <VStack gap={3} align="stretch">
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="xs"
                            color={NAVY.textDim}
                            letterSpacing="0.08em"
                        >
                            Entrer le code de partie fourni par l'adversaire.
                        </Text>

                        {/* Collapse CSS pur — max-height transition */}
                        <Box
                            overflow="hidden"
                            maxH={joinOpen ? "120px" : "0px"}
                            style={{ transition: "max-height 0.25s ease" }}
                        >
                            <VStack gap={3} pt={1}>
                                <Input
                                    value={gameCode}
                                    onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                                    placeholder="CODE-XXXX"
                                    maxLength={9}
                                    fontFamily="'Courier New', monospace"
                                    fontSize="sm"
                                    fontWeight="700"
                                    letterSpacing="0.2em"
                                    textTransform="uppercase"
                                    bg="rgba(0,0,0,0.3)"
                                    border={`1px solid ${NAVY.border}`}
                                    borderRadius="2px"
                                    color={NAVY.white}
                                    textAlign="center"
                                    _placeholder={{ color: NAVY.textDim }}
                                    _focus={{
                                        borderColor: NAVY.accent,
                                        boxShadow: `0 0 0 1px ${NAVY.accent}`,
                                        bg: "rgba(0,200,150,0.04)",
                                        outline: "none",
                                    }}
                                    _hover={{ borderColor: NAVY.text }}
                                />
                                <NavalButton
                                    fullWidth
                                    disabled={gameCode.length < 4}
                                    onClick={() => {
                                        // TODO: appel API joinGame(gameCode)
                                        navigate(`/lobby/${gameCode}`);
                                    }}
                                >
                                    → &nbsp;Rejoindre
                                </NavalButton>
                            </VStack>
                        </Box>

                        <NavalButton
                            fullWidth
                            variant={joinOpen ? "danger" : "ghost"}
                            onClick={() => {
                                setJoinOpen((o) => !o);
                                if (joinOpen) setGameCode("");
                            }}
                        >
                            {joinOpen ? "✕  Annuler" : "⊞  Saisir un code"}
                        </NavalButton>
                    </VStack>
                </SectionPanel>

                <Separator borderColor={NAVY.border} />

                {/* Footer */}
                <HStack w="100%" justify="space-between" align="center">
                    <HStack gap={2}>
                        <Box w="6px" h="6px" borderRadius="50%" bg={NAVY.textDim} />
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="10px"
                            color={NAVY.textDim}
                            letterSpacing="0.1em"
                        >
                            Session active
                        </Text>
                    </HStack>
                    <NavalButton
                        variant="danger"
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/login");
                        }}
                    >
                        ⏻ &nbsp;Déconnexion
                    </NavalButton>
                </HStack>
            </VStack>
        </Center>
    );
};

export default Hub;