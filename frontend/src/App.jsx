import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Painel from './pages/Painel.jsx';

// Links
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/painel" element={<Painel />} />
    </Routes>
  );
}
