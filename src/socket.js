import { io } from 'socket.io-client';

const URL = "https://vercel-backend-test-five.vercel.app"; // Your backend URL
export const socket = io(URL, {
    autoConnect: false // We will connect manually
});