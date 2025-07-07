import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from './contexts/AuthContext';

// Importando nossas páginas
import { DashboardPage } from './pages/Dashboard';
import { VadeUploadPage } from './pages/VadeUpload';
import { QuestoesUploadPage } from './pages/QuestoesUpload';
import { SettingsPage } from './pages/Settings';
import { LoginPage } from './pages/LoginPage';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { isAuthenticated, isLoading } = useAuth();

  // Aplicar tema escuro fixo
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster richColors />
      </>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardPage />;
      case 'vade-upload':
        return <VadeUploadPage />;
      case 'questoes-upload':
        return <QuestoesUploadPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex bg-gray-950 text-gray-50 min-h-screen">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 overflow-auto">
        <div className="md:ml-0 pt-16 md:pt-0">
          {renderSection()}
        </div>
      </main>
      
      <Toaster richColors />
    </div>
  );
}

export default App;

