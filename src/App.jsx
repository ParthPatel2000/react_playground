import './App.css'
import React from 'react'
import TicTacToe from './TicTacToe'
import TowerDefense from './TowerDefense'
import TwoZeroFourEight from './game_2048/TwoZeroFourEight'
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <Router basename='/react_playground'>
      <nav className="p-4 bg-gray-200">
        <Link className="mr-4  hover:underline" to="/">Home</Link>
        <Link className="p-2 hover:underline" to="/tictactoe">Tic Tac Toe</Link>
        <Link className="p-2 hover:underline" to="/towerdefense">Tower Defense</Link>
        <Link className="p-2 hover:underline" to="/2048">2048</Link>
      </nav>
      <Routes>
        <Route path="/" element={<h3>Welcome this is the React Playground Home</h3>} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/towerdefense" element={<TowerDefense />} />
        <Route path="/2048" element={<TwoZeroFourEight />} />
      </Routes>
    </Router>
  );
}
export default App
