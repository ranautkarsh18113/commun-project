import { io } from 'socket.io-client';

export const connectSocket = (token) => {
    return io('https://commun-project.onrender.com', {
        auth: { token }
    });
};