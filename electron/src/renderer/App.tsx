import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { MainPage } from './src/pages/Main.page';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
      </Routes>
    </Router>
  );
}
