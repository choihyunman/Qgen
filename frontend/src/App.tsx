import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center items-center">
      <div className="flex gap-8 mb-8">
        <a 
          href="https://vite.dev" 
          target="_blank"
          className="hover:scale-110 transition-transform"
        >
          <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
        </a>
        <a 
          href="https://react.dev" 
          target="_blank"
          className="hover:scale-110 transition-transform"
        >
          <img src={reactLogo} className="h-16 w-16 motion-safe:animate-spin-slow" alt="React logo" />
        </a>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Vite + React</h1>
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-4"
        >
          count is {count}
        </button>
        <p className="text-gray-600 text-center">
          Edit <code className="bg-gray-100 rounded px-2 py-1 font-mono text-sm">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="mt-8 text-gray-500 text-sm">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
