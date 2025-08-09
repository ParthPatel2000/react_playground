import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="text-blue-500">Test Tailwind is working</div>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">My Simple Grid</h1>

        {/* Grid container */}
        <div className="grid grid-cols-3 gap-4">
          {/* Grid items */}
          <div className="bg-blue-500 text-white p-4 rounded">1</div>
          <div className="bg-blue-500 text-white p-4 rounded">2</div>
          <div className="bg-blue-500 text-white p-4 rounded">3</div>
          <div className="bg-blue-500 text-white p-4 rounded">4</div>
          <div className="bg-blue-500 text-white p-4 rounded">5</div>
          <div className="bg-blue-500 text-white p-4 rounded">6</div>
        </div>
      </div>
    </>
  )
}

export default App
