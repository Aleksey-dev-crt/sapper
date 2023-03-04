import { useState, useEffect } from 'react';
import AppStyles from './App.module.css';
import {
	PLAY,
	SHOCK,
	LOSE,
	WIN,
	BOMB,
	FLAG,
	BOMBS,
	QUESTION,
} from '../utils/constants';
import {
	createBoard,
	createMask,
	openEmtyCells,
	stopTimer,
	startTimer,
} from '../utils';

const App = () => {
	const [timer, setTimer] = useState({ timerRun: false, time: 0 });
	const [smile, setSmile] = useState(PLAY);
	const [board, setBoard] = useState(() => createBoard());
	const [mask, setMask] = useState(() => createMask(null));
	const [lose, setLose] = useState({ x: null, y: null });
	const [bombsCounter, setBombsCounter] = useState(BOMBS);
	const [win, setWin] = useState(false);

	useEffect(() => {
		const flags = mask.flat().filter((el) => el === FLAG).length;
		setBombsCounter(flags <= BOMBS ? BOMBS - flags : 0);
	}, [mask]);

	useEffect(() => {
		const openedCells = mask
			.flat()
			.filter((el) => el && el !== QUESTION && el !== FLAG).length;
		if (!bombsCounter && openedCells === mask.flat().length - BOMBS) {
			setSmile(WIN);
			setWin(true);
			stopTimer(setTimer);
		}
	}, [mask, bombsCounter]);

	const bombsCounterArr = `${bombsCounter}`.padStart(3, '0').split('');
	const timerArr = `${timer.time}`.padStart(4, '0').split('');

	const onResetClick = () => {
		stopTimer(setTimer);
		setTimer((prev) => ({ ...prev, time: 0 }));
		setSmile(PLAY);
		setBoard(() => createBoard());
		setMask(() => createMask(null));
		setLose({ x: null, y: null });
		setWin(false);
	};

	const onMouseUpHandler = (e, x, y) => {
		if (e.button === 0 && !mask[x][y] && !lose.x && !win) setSmile(PLAY);
	};

	const onMouseDownHandler = (e, x, y) => {
		if (e.button === 0 && !mask[x][y] && !lose.x && !win) setSmile(SHOCK);
	};

	const clickCellHandler = (x, y) => {
		if ((lose.x && lose.y) || win) return;
		if (board[x][y] === BOMB && mask.flat().every((el) => !el)) return;
		if (board[x][y] !== ' ' && board[x][y] !== BOMB) mask[x][y] = board[x][y];
		if (board[x][y] === BOMB) {
			setLose({ x, y });
			setSmile(LOSE);
			stopTimer(setTimer);
			board.forEach((row, i) =>
				row.forEach((cell, j) => {
					if (cell === BOMB && mask[i][j] !== FLAG) mask[i][j] = cell;
					if (cell === BOMB && mask[i][j] === FLAG) mask[i][j] = 'minored';
				})
			);
		}
		if (!timer.timerRun) startTimer(setTimer);
		openEmtyCells(board, mask, x, y);
		setMask((mask) => [...mask]);
	};

	const rightClickHandler = (e, x, y) => {
		e.preventDefault();
		if ((lose.x && lose.y) || win) return;
		if (mask[x][y] && mask[x][y] !== FLAG && mask[x][y] !== QUESTION) return;
		if (!mask[x][y] && bombsCounter) {
			mask[x][y] = FLAG;
		} else if (mask[x][y] === FLAG) {
			mask[x][y] = QUESTION;
		} else mask[x][y] = null;
		setMask((mask) => [...mask]);
	};

	const generateCellClasses = (x, y) => {
		const numbers = [
			'one',
			'two',
			'three',
			'four',
			'five',
			'six',
			'seven',
			'eight',
		];
		const classes = [AppStyles.cell];
		if (x === lose.x && y === lose.y) classes.push(AppStyles.lose);
		if (mask[x][y] && mask[x][y] !== FLAG && mask[x][y] !== QUESTION)
			classes.push(AppStyles.opened);
		if (mask[x][y] === 'minored') classes.push(AppStyles.cross);
		if (typeof board[x][y] === 'number')
			classes.push(AppStyles[numbers[board[x][y] - 1]]);
		return classes.join(' ');
	};

	const generateCellContent = (cell, x, y) => {
		if (mask[x][y] && mask[x][y] !== FLAG && mask[x][y] !== QUESTION)
			return cell;
		if (mask[x][y] === FLAG || mask[x][y] === QUESTION) return mask[x][y];
	};

	return (
		<main className={AppStyles.container}>
			<section className={AppStyles.panel}>
				<div className={AppStyles.counterContainer}>
					{bombsCounterArr.map((el, i) => (
						<p className={AppStyles.indicator} key={i}>
							{el}
						</p>
					))}
				</div>
				<button className={AppStyles.button} onClick={onResetClick}>
					{smile}
				</button>
				<div className={AppStyles.timerContainer}>
					{timerArr.map((el, i) => (
						<p key={i} className={AppStyles.indicator}>
							{el}
						</p>
					))}
				</div>
			</section>

			<section className={AppStyles.board}>
				{board.map((row, x) => (
					<div key={x} className={AppStyles.row}>
						{row.map((cell, y) => (
							<div
								key={y}
								className={generateCellClasses(x, y)}
								onClick={() => clickCellHandler(x, y)}
								onMouseUp={(e) => onMouseUpHandler(e, x, y)}
								onMouseDown={(e) => onMouseDownHandler(e, x, y)}
								onContextMenu={(e) => rightClickHandler(e, x, y)}>
								{generateCellContent(cell, x, y)}
							</div>
						))}
					</div>
				))}
			</section>
		</main>
	);
};

export default App;
