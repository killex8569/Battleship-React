import React from 'react';
import { Box, Grid, HStack, VStack, Text } from '@chakra-ui/react';
import TileComponent from './Tile';
import type {Tile} from '@/types.ts';

const NAVY = {
    border: "#1a3a5c",
    accent: "#00c896",
    textDim: "#4a7a99",
    danger: "#e05c5c",
    white: "#e8f4ff",
};

const COL_LABELS = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'];

interface GameBoardProps {
    title: string;
    icon: string;
    tiles: Tile[][];
    isAttackBoard: boolean;
    isMyTurn: boolean;
    onTileClick?: (row: number, col: number) => void;
    legend: { label: string; color: string }[];
}

const GameBoard: React.FC<GameBoardProps> = ({
    title,
    icon,
    tiles,
    isAttackBoard,
    isMyTurn,
    onTileClick,
    legend,
}) => {
    const gridSize = tiles.length;

    return (
        <VStack gap={3} align="stretch" flex={1}>
            {/* Title */}
            <HStack gap={2}>
                <Text
                    fontFamily="'Courier New', monospace"
                    fontSize="10px"
                    color={isAttackBoard ? NAVY.danger : NAVY.accent}
                >
                    {icon}
                </Text>
                <Text
                    fontFamily="'Courier New', monospace"
                    fontSize="xs"
                    fontWeight="700"
                    color={isAttackBoard ? NAVY.danger : NAVY.accent}
                    letterSpacing="0.2em"
                    textTransform="uppercase"
                >
                    {title}
                </Text>
            </HStack>

            {/* Legend */}
            <HStack gap={4}>
                {legend.map((l) => (
                    <HStack key={l.label} gap={1}>
                        <Box w="10px" h="10px" borderRadius="1px" bg={l.color} />
                        <Text
                            fontFamily="'Courier New', monospace"
                            fontSize="9px"
                            color={NAVY.textDim}
                            letterSpacing="0.1em"
                        >
                            {l.label}
                        </Text>
                    </HStack>
                ))}
            </HStack>

            {/* Column headers */}
            <Box>
                <HStack gap={0} ml="20px" mb="2px">
                    {COL_LABELS.slice(0, gridSize).map((l) => (
                        <Box key={l} flex={1} textAlign="center">
                            <Text
                                fontFamily="'Courier New', monospace"
                                fontSize="9px"
                                color={NAVY.textDim}
                                letterSpacing="0.05em"
                            >
                                {l}
                            </Text>
                        </Box>
                    ))}
                </HStack>

                {/* Grid rows */}
                <VStack gap={0}>
                    {tiles.map((row, rowIdx) => (
                        <HStack key={rowIdx} gap={0} w="100%">
                            {/* Row label */}
                            <Box w="20px" flexShrink={0} textAlign="center">
                                <Text
                                    fontFamily="'Courier New', monospace"
                                    fontSize="9px"
                                    color={NAVY.textDim}
                                >
                                    {rowIdx + 1}
                                </Text>
                            </Box>
                            {/* Tiles */}
                            <Grid
                                templateColumns={`repeat(${gridSize}, 1fr)`}
                                gap={0}
                                flex={1}
                            >
                                {row.map((tile) => (
                                    <TileComponent
                                        key={`${tile.row}-${tile.col}`}
                                        row={tile.row}
                                        col={tile.col}
                                        state={tile.state}
                                        isAttackBoard={isAttackBoard}
                                        isMyTurn={isMyTurn}
                                        onClick={onTileClick}
                                    />
                                ))}
                            </Grid>
                        </HStack>
                    ))}
                </VStack>
            </Box>
        </VStack>
    );
};

export default GameBoard;
