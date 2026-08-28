import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './ui/App'
import { SoundToggle } from './ui/SoundToggle'
import { HelpButton } from './ui/Help'
import './ui/styles.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /><HelpButton /><SoundToggle /></StrictMode>,
)
