import { useState } from 'react';
import { LayoutDashboard, Upload, FileText, Settings, LogOut, Menu, X } from 'lucide-react';

// Itens do menu do nosso painel de administração
const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'vade-upload', label: 'Upload Vade Mecum', icon: FileText },
  { id: 'questoes-upload', label: 'Upload Questões', icon: Upload },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export function Sidebar({ activeSection, onSectionChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSectionChange = (sectionId) => {
    onSectionChange(sectionId);
    setIsOpen(false); // Fecha a sidebar no mobile após a seleção
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 text-gray-200 border-r border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 text-center">
        <h2 className="text-xl font-mono font-bold">[ Admin Panel ]</h2>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleSectionChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 ${
                    isActive 
                      ? 'bg-green-400/20 text-green-300' 
                      : 'hover:bg-gray-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          // onClick={logout} // Adicionaremos a função de logout depois
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors duration-200 hover:bg-red-500/20 text-red-400"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Botão do Menu Mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md bg-gray-800 text-white">
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay para fechar no mobile */}
      {isOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar para Desktop */}
      <aside className="hidden md:block w-64 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Sidebar para Mobile (deslizante) */}
      <aside className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  );
}