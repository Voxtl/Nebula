// Load NPM modules
import { config } from 'dotenv';
import chalk from 'chalk';
import WebSocket from 'ws';
import axios, { AxiosError, AxiosResponse } from 'axios';

// Initalise .env
config();

import Redis from './helpers/Redis';
import User from './classes/user';
import { NebulaData } from './helpers/interfaces';

// Welcome message
console.log('.__   __.  _______ .______    __    __   __          ___      ');
console.log('|  \\ |  | |   ____||   _  \\  |  |  |  | |  |        /   \\     ');
console.log('|   \\|  | |  |__   |  |_)  | |  |  |  | |  |       /  ^  \\    ');
console.log('|  . `  | |   __|  |   _  <  |  |  |  | |  |      /  /_\\  \   ');
console.log('|  |\\   | |  |____ |  |_)  | |  `--\'  | |  `----./  _____  \\  ');
console.log('|__| \\__| |_______||______/   \\______/  |_______/__/     \\__\\ ');
console.log('');

// Setup websocket server
const wss = new WebSocket.Server({ port: 3002 }, () => {
    console.log(`${chalk.bgGreen.black.bold('STATUS')} Nebula is now listening on *:${wss.options.port}.`);
});

// Listen for connection
wss.on('connection', (ws, req) => {
    // Get joined channel
    const channel:string = req.url?.substr(1) || '';

    // Make sure channel exists
    axios({
        method: 'get',
        url: `https://api.voxtl.tv/users/${channel}/channel`,
        headers: {
            'Authorization': `Bearer ${process.env.VOXTL_API_KEY}`
        }
    }).then((res:AxiosResponse) => {
    }).catch((error:AxiosError) => {
        ws.send('No channel found.');
        return ws.terminate();
    });

    // Create new user
    let user = new User('guest');

    // Message event
    ws.on('message', async (msg:string) => {
        let data:NebulaData;

        // Convert data to json
        try {
            data = JSON.parse(msg);
        } catch(error) {
            ws.send('Invalid data sent.');
            return ws.terminate();
        }

        // Check what event
        if(data.event === 'join') {
            // Check if a non-guest user joined
            if(data.data !== 'guest') {
                // Get user profile
                await axios({
                    method: 'post',
                    url: `https://auth.voxtl.tv/token/validate`,
                    data: {
                        'access_token': data.data
                    }
                }).then((res:AxiosResponse) => {
                    user.id = res.data.result.user_id;
                }).catch((error:AxiosError) => {
                    ws.send('No user found.');
                    return ws.terminate();
                });

                ws.send(JSON.stringify({
                    'event': 'ready',
                    'data': user.toJson()
                }));

                Redis.sadd(`channel:${channel}:viewers`, user.id);
            }
        } else if(data.event === 'message') {
            ws.send(JSON.stringify({
                'event': 'message',
                'data': {
                    'channel': channel,
                    'user': user.id,
                    'message': data.data
                }
            }));
        } else {
            ws.send('Invalid event sent.');
            return ws.terminate();
        }

    });
});