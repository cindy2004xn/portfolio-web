import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import HomePage from './pages/HomePage.jsx';
import WorkDetailPage from './pages/WorkDetailPage.jsx';

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/work/:id" element={<WorkDetailPage />} />
      </Routes>
    </>
  );
}
