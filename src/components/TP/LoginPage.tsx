import React, { useState } from'react';
import BattleshipService from'../../services/battleshipService';
import {
    Box,
    Button,
    Input,
    Heading,
    VStack,
    Field
} from'@chakra-ui/react';
const LoginPage: React.FC = () => {
// État pour stocker la valeur du nom d'utilisateur
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
// Fonction pour gérer la soumission du formulaire
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const data = await BattleshipService.login(name, password);
            console.log("Login OK:", data);

            // ex: stocker token, redirect, etc.
        } catch (error) {
            console.error("Login failed:", error);
        }
    };
    return (
        <Box maxW=
                 "md" mx=
                 "auto" mt={8} p={6} borderWidth=
                 "1px"
             borderRadius=
                 "lg">
            <Heading mb={6} textAlign=
                "center">Connexion</Heading>
            <form onSubmit={handleSubmit}>
                <VStack gap={4}>
                    <Field.Root>
                        <Field.Label>Nom</Field.Label>
                        <Input
                            type=
                                "text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Field.Label>Password</Field.Label>
                        <Input
                            type=
                                "text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Field.Root>
                    <Button
                        type=
                            "submit"
                        width=
                            "full"
                        mt={4}
                        variant={'outline'}
                    >
                        Se connecter
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};
export default LoginPage;