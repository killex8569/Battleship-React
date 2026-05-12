import { Text,  Center, Button} from '@chakra-ui/react';
import React from "react";
import {useNavigate} from "react-router";

const LandingPage : React.FC = () => {
    const navigate = useNavigate();
    return (
        <Center minH="100vh"  minWidth="100vw" bg="beige">
            <Text color="darkgreen" fontSize="xl">
                Je suis la landing page
            </Text>

            <Button
                bg="whitesmoke"
                colorScheme="red"
                onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                }}
            >
                Déconnexion
            </Button>
        </Center>
    )
}

export default LandingPage;