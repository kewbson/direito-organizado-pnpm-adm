import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toaster } from "@/components/ui/sonner";

// Importando nossas páginas
import { DashboardPage } from './pages/Dashboard';
import { VadeUploadPage } from './pages/VadeUpload';
import { QuestoesUploadPage } from './pages/QuestoesUpload';
import { SettingsPage } from './pages/Settings';

function App() {
  // Estado para controlar qual seção está ativa
  const [activeSection, setActiveSection] = useState('dashboard');

  // Função para renderizar a página correta
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
      
      <main className="flex-1 px-4 py-8">
        {renderSection()}
      </main>
    </div>
  );
return (
    <div className="flex bg-gray-950 text-gray-50 min-h-screen">
      <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      
      <main className="flex-1 px-4 py-8">

        {renderSection()}
      </main>

      <Toaster richColors /> {/* <-- 2. ADICIONE AQUI */}
    </div>
  );
}

export default App;