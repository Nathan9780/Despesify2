import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import { Investors } from "./pages/Investors";
import { Vitrine } from "./pages/Vitrine";
import { Tasks } from "./pages/Tasks";
import { Suppliers } from "./pages/Suppliers";
import { Monetary } from "./pages/Monetary";
import { ProjectDetails } from "./pages/ProjectDetails";
import { WithPlan } from "./components/layout/WithPlan";
import { Toaster } from "react-hot-toast";

import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
        {/* Rotas públicas de acesso */}
        <Route path="/" element={<Landing />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="select-plan" element={<PlanSelection />} />

        {/* Rotas do sistema interno */}
        <Route element={<AppLayout />}>
          <Route path="dashboard" element={
            <WithPlan allowedPlans={["citizen", "enterprise", "investor"]}>
              <Dashboard />
            </WithPlan>
          } />
          <Route path="projects" element={
            <WithPlan allowedPlans={["citizen", "enterprise"]}>
              <Projects />
            </WithPlan>
          } />
          <Route path="projects/:id" element={
            <WithPlan allowedPlans={["citizen", "enterprise"]}>
              <ProjectDetails />
            </WithPlan>
          } />
          <Route path="team" element={
            <WithPlan allowedPlans={["citizen", "enterprise"]}>
              <Team />
            </WithPlan>
          } />
          <Route path="materials" element={
            <WithPlan allowedPlans={["citizen", "enterprise"]}>
              <Materials />
            </WithPlan>
          } />
          <Route path="investors" element={
            <WithPlan allowedPlans={["citizen", "enterprise"]}>
              <Investors />
            </WithPlan>
          } />
          <Route path="monetary" element={
            <WithPlan allowedPlans={["investor"]}>
              <Monetary />
            </WithPlan>
          } />
          <Route path="vitrine" element={
            <WithPlan allowedPlans={["investor", "enterprise"]}>
              <Vitrine />
            </WithPlan>
          } />
          <Route path="tasks" element={
            <WithPlan allowedPlans={["enterprise"]}>
              <Tasks />
            </WithPlan>
          } />
          <Route path="suppliers" element={
            <WithPlan allowedPlans={["enterprise"]}>
              <Suppliers />
            </WithPlan>
          } />
          <Route path="messages" element={
            <WithPlan allowedPlans={["citizen", "enterprise", "investor"]}>
              <Messages />
            </WithPlan>
          } />
          <Route path="settings" element={<Settings />} />
        </Route>
        
        {/* Rota fallback (404) para evitar tela branca em URLs inválidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
