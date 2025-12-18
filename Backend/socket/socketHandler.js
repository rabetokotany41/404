module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('Nouveau client connecté :', socket.id);

        // Rejoindre une conversation
        socket.on('joinConversation', (conversationId) => {
            socket.join(`conversation_${conversationId}`);
            console.log(`Client ${socket.id} a rejoint conversation_${conversationId}`);
        });

        // Quitter une conversation
        socket.on('leaveConversation', (conversationId) => {
            socket.leave(`conversation_${conversationId}`);
            console.log(`Client ${socket.id} a quitté conversation_${conversationId}`);
        });

        // Envoyer un message
        socket.on('sendMessage', (data) => {
            console.log('Message reçu :', data);
            
            // Diffuser à tous les clients dans la conversation
            io.to(`conversation_${data.conversationId}`).emit('receiveMessage', data.message);
        });

        // Indiquer que l'utilisateur est en train d'écrire
        socket.on('typing', (data) => {
            socket.to(`conversation_${data.conversationId}`).emit('userTyping', {
                conversationId: data.conversationId,
                userId: data.userId,
                typing: true
            });
        });

        // Déconnexion
        socket.on('disconnect', () => {
            console.log('Client déconnecté :', socket.id);
        });
    });
};