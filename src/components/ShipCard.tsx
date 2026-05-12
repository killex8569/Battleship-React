import {Box, Heading, Text, Stack} from '@chakra-ui/react';
import { type Ship } from'../types';
interface ShipCardProps {
    key: number,
    ship: Ship;
}

const ShipCard = ({ ship }: ShipCardProps) => {
    return (
        <Box
            p={4}
            borderRadius="xl"
            bg="linear-gradient(135deg, #0f172a, #1e293b)"
            color="white"
            boxShadow="lg"
            transition="0.2s"
            _hover={{
                transform: "translateY(-4px) scale(1.02)",
                boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
        >
            <Stack spacing={2}>
                <Heading size="md">🚢 {ship.name}</Heading>
                <Text>
                    Taille : <b>{ship.lenght}</b> cases
                </Text>
                <Text>
                    <b>{ship.tacticalName}</b>
                </Text>
            </Stack>
        </Box>
    );
};

export default ShipCard;