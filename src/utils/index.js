import { SIZE, BOMB, BOMBS, TOTAL_TIME, FLAG } from './constants';

export const createMask = (el) => {
	return Array.from({ length: SIZE }, () =>
		Array.from({ length: SIZE }, () => el)
	);
};

export const createBoard = () => {
	const board = createMask(0);
	let i = 0;

	const countingNearestBombs = (x, y) => {
		if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
			return board[x][y] === BOMB ? BOMB : (board[x][y] += 1);
		}
	};

	while (i < BOMBS) {
		const x = Math.floor(Math.random() * SIZE);
		const y = Math.floor(Math.random() * SIZE);
		if (board[x][y] === BOMB) continue;
		board[x][y] = BOMB;

		countingNearestBombs(x + 1, y);
		countingNearestBombs(x - 1, y);
		countingNearestBombs(x, y + 1);
		countingNearestBombs(x, y - 1);
		countingNearestBombs(x + 1, y - 1);
		countingNearestBombs(x - 1, y - 1);
		countingNearestBombs(x + 1, y + 1);
		countingNearestBombs(x - 1, y + 1);
		i++;
	}

	return board.map((row) => row.map((cell) => (!cell ? ' ' : cell)));
};

export const openEmptyCells = (board, mask, x, y) => {
	const empty = board[x][y] === ' ' ? [[x, y]] : [];

	const addEmpty = (x, y) => {
		if (x >= 0 && x < SIZE && y >= 0 && y < SIZE) {
			if (mask[x][y] !== ' ') empty.push([x, y]);
		}
	};

	while (empty.length) {
		const [x, y] = empty.pop();
		mask[x][y] = ' ';

		if (board[x][y] !== ' ') continue;

		addEmpty(x + 1, y);
		addEmpty(x - 1, y);
		addEmpty(x, y + 1);
		addEmpty(x, y - 1);
	}
	return mask;
};

export const showBombsWhenLose = (board, mask) => {
	board.forEach((row, i) =>
		row.forEach((cell, j) => {
			if (cell === BOMB && mask[i][j] !== FLAG) mask[i][j] = cell;
			if (cell === BOMB && mask[i][j] === FLAG) mask[i][j] = 'minored';
		})
	);
};

let interval;

export const stopTimer = (setTimer) => {
	setTimer((prev) => ({ ...prev, timerRun: false }));
	clearInterval(interval);
};

export const startTimer = (setTimer, setLose) => {
	setTimer({ timerRun: true, time: 0 });
	let i = 0;
	interval = setInterval(() => {
		i++;
		setTimer((prev) => ({ ...prev, time: i }));
		if (i === TOTAL_TIME) setLose((prev) => ({ ...prev, state: true }));
	}, 1000);
};
