import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Projects } from './pages/Projects';
import { Team } from './pages/Team';
import { Materials } from './pages/Materials';
import { Investors } from './pages/Investors';
import { Messages } from './pages/Messages';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="team" element={<Team />} />
          <Route path="materials" element={<Materials />} />
          <Route path="investors" element={<Investors />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
