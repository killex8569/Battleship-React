import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Provider } from "@/components/ui/provider"
import ShipsPage from "./components/ShipsPage.tsx";
import LoginPage from "./components/LoginPage.tsx";
import Hub from "./components/Hub.tsx";
import Lobby from "@/components/Lobby.tsx";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
            <Route path="/hub" element={<Hub />} />
          <Route path="/ships/" element={<ShipsPage />} />
            <Route path="/login/" element={<LoginPage />} />
            <Route path="/lobby" element={<Lobby />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
,
)
