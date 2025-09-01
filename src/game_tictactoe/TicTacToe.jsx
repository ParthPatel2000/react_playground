import React, { useState, useEffect } from "react";

export default function TicTacToe() {

    const [board, setBoard] = useState(Array(9).fill(null));
    const [currentPlayer, setCurrentPlayer] = useState("X");
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        const winner = checkWinner();
        if (winner) {
            setWinner(winner);
            alert(`Player ${winner} wins!`);
            resetGame();
        }
        if (isDraw()) {
            alert("It's a draw!");
            resetGame();
        }
    }, [board]);

    const handleClick = (index) => {
        const newBoard = [...board];
        if (!newBoard[index]) {
            newBoard[index] = currentPlayer;
            setBoard(newBoard);
            setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
        }
        else {
            alert("Cell already taken!");
        }

    };

    const isDraw = () => {
        return board.every(cell => cell !== null) && checkWinner(board) === null;
    };

    const checkWinner = () => {
        const winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        for (let combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && (board[a] === board[b] && board[a] === board[c])) {
                return board[a];
            }
        }
        return null;
    };


    const resetGame = () => {
        setBoard(Array(9).fill(null));
        setCurrentPlayer("X");
    };

    return (
        <div className="mt-4">
            <div className="flex justify-left items-center ">
                <button onClick={resetGame} className="mb-4 p-2 bg-blue-500 text-white rounded">
                    Reset Game
                </button>
                <button onClick={() => alert("Tic Tac Toe is a simple two-player game where players take turns marking Xs and Os on a 3x3 grid. The first player to get three of their marks in a row (horizontally, vertically, or diagonally) wins the game. If all nine squares are filled and neither player has three in a row, the game is a draw.")} className="mb-4 ml-4 p-2 bg-green-500 text-white rounded">
                    How to Play
                </button>
            </div>
            <div className="flex justify-center items-center">
                <h3 className="p-3 text-white justify-center">Winner: {winner}</h3>
                <h3 className="p-3 text-white justify-center">Current Player: {currentPlayer}</h3>
            </div>
            <div className="inline-block glassmorphic p-5 mx-auto">
                {/* Game board will go here */}
                <div className="grid grid-cols-3 gap-4">
                    <button
                        onClick={() => handleClick(0)}
                        className="relative w-24 h-24 bg-gray-300 flex items-center justify-center text-4xl font-bold"
                        title="Cell 0"
                    >
                        {board[0]}
                    </button>
                    <button
                        onClick={() => handleClick(1)}
                        className="relative w-24 h-24 bg-gray-300 flex items-center justify-center text-4xl font-bold"
                        title="Cell 1"
                    >
                        {board[1]}
                    </button>
                    <button
                        onClick={() => handleClick(2)}
                        className="relative w-24 h-24 bg-gray-300 flex items-center justify-center text-4xl font-bold"
                        title="Cell 2"
                    >
                        {board[2]}
                    </button>
                    <button
                        onClick={() => handleClick(3)}
                        className="relative w-24 h-24 bg-gray-300 flex items-center justify-center text-4xl font-bold"
                        title="Cell 3"
                    >
                        {board[3]}
                    </button>
                    <button
                        onClick={() => handleClick(4)}
                        className="relative w-24 h-24 bg-gray-300 flex items-center justify-center text-4xl font-bold"
                        title="Cell 4"
                    >
                        {board[4]}
                    </button>
                    <button
                        onClick={() => handleClick(5)}
                        className="relative w-24 h-24 bg-gray-300 flex items-center justify-center text-4xl font-bold"
                        title="Cell 5"
                    >
                        {board[5]}
                    </button>
                    <button
                        onClick={() => handleClick(6)}
                        className="relative w-24 h-24 bg-gray-300 flex items-center justify-center text-4xl font-bold"
                        title="Cell 6"
                    >
                        {board[6]}
                    </button>
                    <button
                        onClick={() => handleClick(7)}
                        className="relative w-24 h-24 bg-gray-300 flex items-center justify-center text-4xl font-bold"
                        title="Cell 7"
                    >
                        {board[7]}
                    </button>
                    <button
                        onClick={() => handleClick(8)}
                        className="relative w-24 h-24 bg-gray-300 flex items-center justify-center text-4xl font-bold"
                        title="Cell 8"
                    >
                        {board[8]}
                    </button>
                    
                </div>
            </div>
        </div>
    );
}