
import React, { useState } from 'react';
import { LayoutDashboard, Users, Landmark, Github, ClipboardList, Briefcase, Settings, FileText, HandCoins, Menu, X } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li
    className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-400 hover:bg-gray-700 hover:text-white'
    }`}
    onClick={onClick}
  >
    {icon}
    <span className="ml-4 text-sm font-medium">{label}</span>
  </li>
);

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView } = useLoanManager();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (view: any) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false); // Close menu on mobile when item is clicked
  };

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <>
      {/* Mobile Top Bar (Visible only on mobile) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white z-40 flex items-center px-4 shadow-md justify-between border-b border-gray-700">
        <div className="flex items-center">
            <button 
                onClick={toggleMenu} 
                className="p-2 -ml-2 mr-2 text-gray-300 hover:text-white focus:outline-none hover:bg-gray-800 rounded-md"
                aria-label="Toggle Menu"
            >
                <Menu size={24} />
            </button>
            <div className="flex items-center">
                 <Landmark className="h-6 w-6 text-blue-400" />
                 <span className="ml-2 text-lg font-bold tracking-tight">MLMS.AI</span>
            </div>
        </div>
      </div>

      {/* Mobile Overlay (Background dimmer) */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:inset-auto md:flex md:shadow-none
      `}>
        <div className="flex items-center justify-between px-4 h-20 border-b border-gray-700">
          <div className="flex items-center justify-center w-full md:w-auto">
              <Landmark className="h-8 w-8 text-blue-400" />
              <div className="ml-3 flex flex-col">
                  <h1 className="text-xl font-bold leading-none">MLMS.AI</h1>
                  <span className="text-[10px] text-gray-400 tracking-widest uppercase font-medium mt-0.5">Innovators</span>
              </div>
          </div>
          {/* Close button inside sidebar for mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul>
            <NavItem
              icon={<LayoutDashboard size={20} />}
              label="Dashboard"
              isActive={currentView === 'dashboard'}
              onClick={() => handleNavClick('dashboard')}
            />
            <NavItem
              icon={<Users size={20} />}
              label="Clients"
              isActive={currentView === 'clients'}
              onClick={() => handleNavClick('clients')}
            />
            <NavItem
              icon={<Landmark size={20} />}
              label="Loans"
              isActive={currentView === 'loans'}
              onClick={() => handleNavClick('loans')}
            />
            <NavItem
              icon={<ClipboardList size={20} />}
              label="Loan Requests"
              isActive={currentView === 'loanRequests'}
              onClick={() => handleNavClick('loanRequests')}
            />
            <NavItem
              icon={<HandCoins size={20} />}
              label="Collections"
              isActive={currentView === 'collections'}
              onClick={() => handleNavClick('collections')}
            />
            <NavItem
              icon={<FileText size={20} />}
              label="Reports"
              isActive={currentView === 'reports'}
              onClick={() => handleNavClick('reports')}
            />
             <NavItem
              icon={<Briefcase size={20} />}
              label="Loan Products"
              isActive={currentView === 'loanProducts' || currentView === 'addLoanProduct'}
              onClick={() => handleNavClick('loanProducts')}
            />
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700">
            <button 
              onClick={() => handleNavClick('settings')}
              className={`flex items-center w-full mb-4 transition-colors ${currentView === 'settings' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
            >
                <Settings size={20} />
                <span className="ml-3 text-sm">Settings</span>
            </button>
            <a href="https://github.com/Azratalib123" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-400 hover:text-white transition-colors">
                <Github size={20} />
                <span className="ml-3 text-sm">View on GitHub</span>
            </a>
        </div>
      </div>
    </>
  );
};
