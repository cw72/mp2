import { Navigate, Route, Routes } from 'react-router-dom'
import DetailView from './components/DetailView'
import GalleryView from './components/GalleryView'
import ListView from './components/ListView'
import Masthead from './components/Masthead'
import { HeroProvider } from './context/HeroProvider'

function App() {
  return (
    <HeroProvider>
      <Masthead />
      <main className="page">
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/hero/:id" element={<DetailView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="footer">
        <p>
          Data &amp; images from the <a href="https://github.com/akabab/superhero-api">Superhero API</a>. Unofficial
          CS 409 project; characters belong to their respective owners.
        </p>
      </footer>
    </HeroProvider>
  )
}

export default App
