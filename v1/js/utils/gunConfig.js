import { Gun } from './gun-wrapper.js';

// Now you can use `Gun` as if it was imported directly
export const gun = Gun(
    { peers: [
        'https://gun-relay.valiantlynx.com/gun', 
        'http://localhost:8765/gun',
        'https://gun-relay1.valiantlynx.com/gun', 
        'https://gun-relay2.valiantlynx.com/gun'
    ] }
);
