import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { PlanSelection } from "./pages/PlanSelection";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { Projects } from "./pages/Projects";
import { Team } from "./pages/Team";
import { Materials } from "./pages/Materials";
import { Messages } from "./pages/Messages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas de acesso */}
        <Route path="/" element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="select-plan" element={<PlanSelection />} />

        {/* Rotas do sistema interno */}
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
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
