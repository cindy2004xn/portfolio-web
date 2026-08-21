import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import LandingPage from './pages/LandingPage.jsx';
import HomePage from './pages/HomePage.jsx';
import WorkDetailPage from './pages/WorkDetailPage.jsx';
import NoteDetailPage from './pages/NoteDetailPage.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/works" element={<HomePage />} />
        <Route path="/work/:id" element={<WorkDetailPage />} />
        <Route path="/note/:id" element={<NoteDetailPage />} />
      </Routes>
    </>
  );
}
