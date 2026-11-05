import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import BottomNav from './components/common/BottomNav';
import Breadcrumbs from './components/common/Breadcrumbs';
import ToastContainer from './components/common/ToastContainer';
import FloatingMentor from './components/common/FloatingMentor';
import ServerStatusBanner from './components/common/ServerStatusBanner';

// The Four Primary Consolidated Modules
import DiscoverPage from './pages/DiscoverPage';
import AssessPage from './pages/AssessPage';
import JourneyPage from './pages/JourneyPage';
import GrowthPage from './pages/GrowthPage';

// Standard Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import MyCareerPage from './pages/MyCareerPage';
import SettingsPage from './pages/SettingsPage';
import ResourceLibraryPage from './pages/ResourceLibraryPage';
import ProjectRecommendationsPage from './pages/ProjectRecommendationsPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import CareerArenaPage from './pages/CareerArenaPage';
import BossBattlesPage from './pages/BossBattlesPage';
import LearningAssistantPage from './pages/LearningAssistantPage';

function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { activeTheme } = useApp();

  return (
    <div
      className="min-h-screen text-slate-100 flex flex-col transition-colors duration-500"
      style={{
        backgroundColor: activeTheme?.palette?.baseBg || '#060a12',
        backgroundImage: activeTheme?.palette?.pageGradient || 'radial-gradient(ellipse at 50% 0%, #101c3d 0%, #060a12 60%, #03060d 100%)',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Top Navigation */}
      <Navbar
        onMobileMenuToggle={() => setIsMobileMenuOpen((prev) => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Free Tier Cold-Start & Connectivity Alert Banner */}
      <ServerStatusBanner />

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Navigation Sidebar: 4 Primary Modules */}
        <Sidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 min-w-0 overflow-y-auto pb-24 md:pb-8">
          {/* Progressive Hierarchical Breadcrumb Navigation */}
          <Breadcrumbs />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* THE FOUR PRIMARY MODULES */}
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/assess" element={<AssessPage />} />
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="/growth" element={<GrowthPage />} />

            {/* Account & Career Info */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/my-career" element={<MyCareerPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Backward-Compatible Route Aliases for Module 1: Discover */}
            <Route path="/discovery" element={<DiscoverPage />} />
            <Route path="/careers" element={<DiscoverPage />} />
            <Route path="/explore" element={<DiscoverPage />} />
            <Route path="/compare" element={<DiscoverPage />} />

            {/* Backward-Compatible Route Aliases for Module 2: Assess */}
            <Route path="/assessment" element={<AssessPage />} />
            <Route path="/skill-gap" element={<AssessPage />} />
            <Route path="/skill-analysis" element={<AssessPage />} />
            <Route path="/reassessment" element={<AssessPage />} />

            {/* Backward-Compatible Route Aliases for Module 3: My Journey */}
            <Route path="/roadmap" element={<JourneyPage />} />
            <Route path="/planner" element={<JourneyPage />} />
            <Route path="/preparation" element={<JourneyPage />} />
            <Route path="/weekly-review" element={<JourneyPage />} />

            {/* Backward-Compatible Route Aliases for Module 4: My Growth */}
            <Route path="/progress" element={<GrowthPage />} />
            <Route path="/skill-tree" element={<GrowthPage />} />
            <Route path="/portfolio" element={<GrowthPage />} />
            <Route path="/leaderboard" element={<GrowthPage />} />

            {/* Specialized Features */}
            <Route path="/resources" element={<ResourceLibraryPage />} />
            <Route path="/projects" element={<ProjectRecommendationsPage />} />
            <Route path="/interview" element={<InterviewPrepPage />} />
            <Route path="/assistant" element={<LearningAssistantPage />} />
            <Route path="/arena" element={<CareerArenaPage />} />
            <Route path="/bosses" element={<BossBattlesPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Navigation (Phones & Small Tablets) */}
      <BottomNav />

      {/* Global AI Career Mentor */}
      <FloatingMentor />

      {/* Global Notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
