import './App.css'
import React, { useRef, useState, useEffect } from 'react'
import TicTacToe from './TicTacToe'
import TowerDefense from './game_tower_defense/TowerDefense'
import TwoZeroFourEight from './game_2048/TwoZeroFourEight'
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'
import LandingPage from './landing_page/LandingPage'
import Layout from './Layout'

function App() {
  return (
    <Router>
      <Layout>
        <nav className="p-4 text-white flex gap-4 justify-center md:justify-start">
          <Link className="hover:underline font-semibold" to="/">Home</Link>
          <Link className="hover:underline font-semibold" to="/tictactoe">Tic Tac Toe</Link>
          <Link className="hover:underline font-semibold" to="/towerdefense">Tower Defense</Link>
          <Link className="hover:underline font-semibold" to="/2048">2048</Link>
        </nav>

        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/tictactoe" element={<TicTacToe />} />
          <Route path="/towerdefense" element={<TowerDefense />} />
          <Route path="/2048" element={<TwoZeroFourEight />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App


