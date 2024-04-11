
export const gun = Gun(
  //{ peers: ['https://gun-relay.valiantlynx.com/gun', 'http://localhost:8765/gun']}
  { peers: [
    'https://gun-relay.valiantlynx.com/gun',
    'http://localhost:8765/gun',
    'https://gun-relay1.valiantlynx.com/gun',
    'https://gun-relay2.valiantlynx.com/gun'
  ] }
);
