import React, { useState } from 'react';
import { LayoutList, FolderOpen } from 'lucide-react';
import FunnelBuilder from './components/FunnelBuilder';
import CategoryManagement from './components/CategoryManagement';

type Tab = 'funnels' | 'categories';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('funnels');

  const tabs = [
    { id: 'funnels' as Tab, label: 'Funnel Builder', icon: LayoutList },
    { id: 'categories' as Tab, label: 'Categories', icon: FolderOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Sales Funnel Automation</h1>
            <p className="text-sm text-gray-600 mt-1">
              Build and organize your automated sales funnels
            </p>
          </div>

          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'funnels' && <FunnelBuilder />}
        {activeTab === 'categories' && <CategoryManagement />}
      </main>

      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            Sales Funnel Automation Management System
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
