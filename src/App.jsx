// import './App.css'
// import React from 'react'
// import TicTacToe from './TicTacToe'
// import TowerDefense from './game_tower_defense/TowerDefense'
// import TwoZeroFourEight from './game_2048/TwoZeroFourEight'
// import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom'

// function App() {
//   return (
//     <Router>
//       <nav className="p-4 bg-gray-200">
//         <Link className="mr-4  hover:underline" to="/">Home</Link>
//         <Link className="p-2 hover:underline" to="/tictactoe">Tic Tac Toe</Link>
//         <Link className="p-2 hover:underline" to="/towerdefense">Tower Defense</Link>
//         <Link className="p-2 hover:underline" to="/2048">2048</Link>
//       </nav>
//       <Routes>
//         <Route path="/" element={<h3>Welcome this is the React Playground Home</h3>} />
//         <Route path="/tictactoe" element={<TicTacToe />} />
//         <Route path="/towerdefense" element={<TowerDefense />} />
//         <Route path="/2048" element={<TwoZeroFourEight />} />
//       </Routes>
//     </Router>
//   );
// }
// export default App
import './App.css'
import React, { useState, useEffect } from 'react';
import { ChevronDown, Github, Linkedin, Mail, Code, Gamepad2, Cpu, Sparkles, Home } from 'lucide-react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import TicTacToe from './TicTacToe'
import TowerDefense from './game_tower_defense/TowerDefense'
import TwoZeroFourEight from './game_2048/TwoZeroFourEight'

const FuturisticClock = () => {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Calculate rotation angles
  const secondAngle = (seconds * 6) - 90; // 360/60 = 6 degrees per second
  const minuteAngle = (minutes * 6 + seconds * 0.1) - 90; // Include seconds for smooth movement
  const hourAngle = ((hours % 12) * 30 + minutes * 0.5) - 90; // 360/12 = 30 degrees per hour

  return (
    <div className="relative w-32 h-32 group">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 animate-pulse">
        <div className="absolute inset-2 rounded-full border border-purple-400/30 animate-spin" style={{ animationDuration: '20s' }}>
          <div className="absolute inset-2 rounded-full border border-pink-400/30 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
            {/* Hour markers */}
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-4 bg-gradient-to-b from-cyan-400 to-transparent rounded-full"
                style={{
                  top: '4px',
                  left: '50%',
                  transformOrigin: '50% 56px',
                  transform: `translateX(-50%) rotate(${i * 30}deg)`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main clock face */}
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-cyan-400/50 shadow-2xl shadow-cyan-500/25">
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-30 shadow-lg shadow-cyan-500/50 animate-pulse" />
        
        {/* Hour hand */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom bg-gradient-to-t from-purple-400 to-pink-400 rounded-full shadow-lg shadow-purple-500/50 z-20"
          style={{
            width: '3px',
            height: '20px',
            transform: `translate(-50%, -100%) rotate(${hourAngle}deg)`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
          }}
        />
        
        {/* Minute hand */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom bg-gradient-to-t from-cyan-400 to-blue-400 rounded-full shadow-lg shadow-cyan-500/50 z-20"
          style={{
            width: '2px',
            height: '28px',
            transform: `translate(-50%, -100%) rotate(${minuteAngle}deg)`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)'
          }}
        />
        
        {/* Second hand */}
        <div
          className="absolute top-1/2 left-1/2 origin-bottom bg-gradient-to-t from-red-400 to-pink-400 rounded-full shadow-lg shadow-red-500/50 z-20"
          style={{
            width: '1px',
            height: '32px',
            transform: `translate(-50%, -100%) rotate(${secondAngle}deg)`,
            transition: seconds === 0 ? 'none' : 'transform 0.1s ease-out'
          }}
        />

        {/* Digital time display */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm border border-cyan-400/30 rounded-lg px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-xs font-mono text-cyan-400">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </div>
        </div>
      </div>

      {/* Orbital rings */}
      <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-spin" style={{ animationDuration: '30s' }}>
        <div className="absolute top-1 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 shadow-lg shadow-cyan-500/50 animate-pulse" />
      </div>
      <div className="absolute inset-1 rounded-full border border-purple-400/20 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}>
        <div className="absolute bottom-1 left-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full transform -translate-x-1/2 shadow-lg shadow-purple-500/50 animate-pulse" />
      </div>
    </div>
  );
};

const AnimatedPortfolio = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentRole, setCurrentRole] = useState(0);

  const roles = [
    "Full Stack Developer",
    "React Specialist", 
    "Game Developer",
    "Problem Solver"
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    const roleInterval = setInterval(() => {
      setCurrentRole(prev => (prev + 1) % roles.length);
    }, 3000);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(roleInterval);
    };
  }, []);

  const projects = [
    { name: "Tic Tac Toe", icon: <Gamepad2 className="w-6 h-6" />, color: "from-purple-400 to-pink-400" },
    { name: "Tower Defense", icon: <Cpu className="w-6 h-6" />, color: "from-blue-400 to-cyan-400" },
    { name: "2048 Game", icon: <Sparkles className="w-6 h-6" />, color: "from-green-400 to-emerald-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white overflow-hidden relative">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Interactive gradient overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
        }}
      />

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 p-6 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Portfolio
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#home" className="hover:text-purple-400 transition-colors duration-300">Home</a>
            <a href="#projects" className="hover:text-purple-400 transition-colors duration-300">Projects</a>
            <a href="#contact" className="hover:text-purple-400 transition-colors duration-300">Contact</a>
          </div>
        </div>
      </nav>

      {/* Futuristic Clock */}
      <div className="fixed top-6 right-6 z-40">
        <FuturisticClock />
      </div>

      {/* Hero Section */}
      <section id="home" className="min-h-screen flex items-center justify-center relative px-6">
        <div className="text-center max-w-4xl mx-auto">
          <div className={`transition-all duration-1500 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                John Doe
              </span>
            </h1>
          </div>
          
          <div className={`transition-all duration-1500 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h2 className="text-2xl md:text-4xl mb-8 h-12">
              <span className="text-gray-300">I'm a </span>
              <span 
                key={currentRole}
                className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold inline-block"
                style={{ animation: 'slideInUp 0.5s ease-out' }}
              >
                {roles[currentRole]}
              </span>
            </h2>
          </div>

          <div className={`transition-all duration-1500 delay-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Creating immersive digital experiences through code, games, and innovative solutions. 
              Let's build something extraordinary together.
            </p>
          </div>

          <div className={`transition-all duration-1500 delay-1300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="flex justify-center space-x-6 mb-12">
              <button className="group bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25">
                <span className="flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  View Projects
                </span>
              </button>
              <button className="group border-2 border-purple-400 px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-purple-400 hover:scale-105">
                Contact Me
              </button>
            </div>
          </div>

          <div className={`transition-all duration-1500 delay-1600 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="flex justify-center space-x-6">
              <a href="#" className="p-3 border border-gray-600 rounded-full hover:border-purple-400 hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25">
                <Github className="w-6 h-6" />
              </a>
              <a href="#" className="p-3 border border-gray-600 rounded-full hover:border-blue-400 hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="p-3 border border-gray-600 rounded-full hover:border-green-400 hover:scale-110 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-2000 delay-2000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ChevronDown className="w-8 h-8 animate-bounce text-purple-400" />
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Featured Projects
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div 
                key={index}
                className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20"
                style={{ 
                  animation: `slideInUp 0.6s ease-out ${index * 0.2}s both`,
                }}
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${project.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {project.icon}
                </div>
                <h4 className="text-2xl font-bold mb-4 group-hover:text-purple-400 transition-colors duration-300">
                  {project.name}
                </h4>
                <p className="text-gray-400 mb-6">
                  An engaging interactive game built with React, featuring smooth animations and responsive design.
                </p>
                <button className="text-purple-400 font-semibold hover:text-pink-400 transition-colors duration-300">
                  View Project →
                </button>
                
                {/* Hover glow effect */}
                <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${project.color} blur-xl -z-10`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AnimatedPortfolio />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/towerdefense" element={<TowerDefense />} />
        <Route path="/2048" element={<TwoZeroFourEight />} />
      </Routes>
    </Router>
  );
};

export default App;