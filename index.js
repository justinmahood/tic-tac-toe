
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

let players = [];
let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';

wss.on('connection', (ws) => {
  players.push(ws);
  ws.send(JSON.stringify({ type: 'init', board, player: players.length === 1 ? 'X' : 'O' }));

  if (players.length === 2) {
    players.forEach(player => player.send(JSON.stringify({ type: 'start' })));
  }

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'move') {
      board[data.index] = data.player;
      currentPlayer = data.player === 'X' ? 'O' : 'X';
      players.forEach(player => player.send(JSON.stringify({ type: 'update', board, currentPlayer })));
      checkWin();
    }
  });

  ws.on('close', () => {
    players = players.filter(player => player !== ws);
    if (players.length < 2) {
      board = ['', '', '', '', '', '', '', '', ''];
      players.forEach(player => player.send(JSON.stringify({ type: 'reset' })));
    }
  });
});

function checkWin() {
  const winConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let condition of winConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      players.forEach(player => player.send(JSON.stringify({ type: 'win', winner: board[a] })));
      return;
    }
  }

  if (board.every(cell => cell !== '')) {
    players.forEach(player => player.send(JSON.stringify({ type: 'draw' })));
  }
}

server.listen(process.env.PORT || 8080, () => {
  console.log('Server is listening on port', server.address().port);
});
