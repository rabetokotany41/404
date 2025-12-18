const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:5000/api';

async function manualTest() {
    try {
        console.log('🧪 TEST MANUEL DE L\'API');
        console.log('='.repeat(60));
        
        // 1. Tester les headers
        console.log('\n1. Test des headers...');
        const headersRes = await axios.get(`${API_URL}/messages/debug-headers`);
        console.log('✅ Route debug accessible');
        
        // 2. Se connecter
        console.log('\n2. Test de connexion...');
        const loginData = {
            email: 'rabetokotanyenzo@gmail.com',
            password: '41329758@#Enzo'
        };
        
        const loginRes = await axios.post(`${API_URL}/auth/login`, loginData);
        console.log('✅ Connexion réussie');
        
        const token = loginRes.data.token;
        console.log('🔑 Token reçu:', token.substring(0, 50) + '...');
        console.log('📏 Longueur:', token.length);
        
        // Sauvegarder le token pour inspection
        fs.writeFileSync('token-debug.txt', token);
        console.log('💾 Token sauvegardé dans token-debug.txt');
        
        // 3. Tester avec le token
        console.log('\n3. Test avec token...');
        const config = {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        };
        
        // Tester la route protégée
        try {
            const convRes = await axios.get(`${API_URL}/messages/conversations`, config);
            console.log('✅ Conversations récupérées avec succès!');
            console.log('Nombre de conversations:', convRes.data.conversations?.length || 0);
        } catch (convError) {
            console.error('❌ Erreur avec token:');
            console.error('Status:', convError.response?.status);
            console.error('Message:', convError.response?.data?.message);
            console.error('Headers envoyés:', config.headers);
            
            // Essayer sans "Bearer"
            console.log('\n4. Test sans "Bearer"...');
            const config2 = {
                headers: {
                    'Authorization': token, // Sans "Bearer"
                    'Content-Type': 'application/json'
                }
            };
            
            try {
                const convRes2 = await axios.get(`${API_URL}/messages/conversations`, config2);
                console.log('✅ Succès sans "Bearer" !');
            } catch (convError2) {
                console.error('❌ Échec sans "Bearer" aussi');
            }
        }
        
        // 5. Tester le profil
        console.log('\n5. Test du profil...');
        const profileRes = await axios.get(`${API_URL}/auth/profile`, config);
        console.log('✅ Profil récupéré:', profileRes.data.user?.email);
        
        console.log('\n🎉 TEST COMPLETÉ AVEC SUCCÈS !');
        
    } catch (error) {
        console.error('\n❌ ERREUR GÉNÉRALE:');
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

manualTest();