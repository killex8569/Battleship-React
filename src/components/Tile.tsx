import React from 'react';
import { Box } from '@chakra-ui/react';
import type {TileState} from '@/types.ts';

const NAVY = {
    border: "#1a3a5c",
    accent: "#00c896",
    empty: "rgba(13, 21, 38, 0.8)",
    ship: "rgba(70, 110, 160, 0.5)",
    hit: "#c0392b",
    miss: "rgba(40, 80, 120, 0.6)",
    sunk: "#8b0000",
    hoverAttack: "rgba(0, 200, 150, 0.2)",
};

const STATE_STYLES: Record<TileState, object> = {
    empty: { bg: NAVY.empty },
    ship: { bg: NAVY.ship },
    hit: { bg: NAVY.hit, boxShadow: "inset 0 0 6px rgba(255,80,80,0.4)" },
    miss: { bg: NAVY.miss },
    sunk: { bg: NAVY.sunk, boxShadow: "inset 0 0 8px rgba(180,0,0,0.6)" },
};

interface TileProps {
    row: number;
    col: number;
    state: TileState;
    isAttackBoard: boolean;
    isMyTurn: boolean;
    onClick?: (row: number, col: number) => void;
}

const TileComponent: React.FC<TileProps> = ({ row, col, state, isAttackBoard, isMyTurn, onClick }) => {
    const isClickable = isAttackBoard && isMyTurn && state === 'empty';
    const styles = STATE_STYLES[state];

    const renderContent = () => {
        if (state === 'hit' || state === 'sunk') {
            return (
                <Box
                    position="absolute"
                    inset={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="10px"
                    fontWeight="700"
                >
                    ✕
                </Box>
            );
        }
        if (state === 'miss') {
            return (
                <Box
                    position="absolute"
                    inset={0}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="rgba(180,220,255,0.4)"
                    fontSize="8px"
                >
                    •
                </Box>
            );
        }
        return null;
    };

    return (
        <Box
            position="relative"
            w="100%"
            paddingBottom="100%"
            border={`1px solid ${NAVY.border}`}
            borderRadius="1px"
            cursor={isClickable ? 'crosshair' : 'default'}
            transition="all 0.1s ease"
            onClick={() => isClickable && onClick?.(row, col)}
            _hover={isClickable ? { bg: NAVY.hoverAttack, borderColor: NAVY.accent } : {}}
            {...styles}
        >
            {renderContent()}
        </Box>
    );
};

export default TileComponent;
