import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Honeytokens from './pages/Honeytokens'
import Alerts from './pages/Alerts'
import AgentsPage from './pages/Agents'

function App() {
  return (
    <>
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/honeytokens" element={<Honeytokens />}></Route>
          <Route path="/alerts" element={<Alerts />}></Route>
          <Route path="/agents" element={<AgentsPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
