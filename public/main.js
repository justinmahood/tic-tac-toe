
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

const ws = new WebSocket(`wss://${window.location.host}`);

let player;
let board = ['', '', '', '', '', '', '', '', ''];

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  switch (data.type) {
    case 'init':
      board = data.board;
      player = data.player;
      renderBoard();
      break;
    case 'start':
      statusElement.textContent = 'Game started! You are ' + player;
      break;
    case 'update':
      board = data.board;
      renderBoard();
      statusElement.textContent = data.currentPlayer === player ? 'Your turn' : "Opponent's turn";
      break;
    case 'win':
      statusElement.textContent = data.winner === player ? 'You win!' : 'You lose!';
      break;
    case 'draw':
      statusElement.textContent = 'It\\'s a draw!';
      break;
    case 'reset':
      board = ['', '', '', '', '', '', '', '', ''];
      renderBoard();
      statusElement.textContent = 'Waiting for another player...';
      break;
  }
};

function renderBoard() {
  boardElement.innerHTML = '';
  board.forEach((cell, index) => {
    const cellElement = document.createElement('div');
    cellElement.classList.add('cell');
    cellElement.textContent = cell;
    cellElement.addEventListener('click', () => makeMove(index));
    boardElement.appendChild(cellElement);
  });
}

function makeMove(index) {
  if (board[index] === '') {
    ws.send(JSON.stringify({ type: 'move', index, player }));
  }
}
