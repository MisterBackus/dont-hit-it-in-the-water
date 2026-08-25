import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './ui/App'
import { SoundToggle } from './ui/SoundToggle'
import './ui/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /><SoundToggle /></StrictMode>,
)
