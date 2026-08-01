import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { FreelancersPage } from './pages/FreelancersPage';
import { FreelancerProfilePage } from './pages/FreelancerProfilePage';
import { DashboardPage } from './pages/DashboardPage';
import { MessagesPage } from './pages/MessagesPage';
import { EscrowPage } from './pages/EscrowPage';

const AppRoutes: React.FC = () => {
  const { isConnected, login } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#090D16] text-slate-100 selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage onConnectWallet={login} isConnected={isConnected} />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailsPage />} />
          <Route path="/create-project" element={<CreateProjectPage />} />
          <Route path="/freelancers" element={<FreelancersPage />} />
          <Route path="/freelancers/:walletAddress" element={<FreelancerProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/escrow" element={<EscrowPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
