import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Provider } from "@/components/ui/provider"
import ShipsPage from "@/components/TP/ShipsPage.tsx";
import LoginPage from "@/components/TP/LoginPage.tsx";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/ships/" element={<ShipsPage />} />
            <Route path="/login/" element={<LoginPage />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>
,
)
