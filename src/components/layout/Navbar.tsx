import { useState } from 'react';
import { LayoutDashboard, Receipt, Users, LogOut, IndianRupee } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export type Tab = 'home' | 'expenses' | 'friends';

export interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  user: { name: string; email: string } | null;
  onLogout: () => void;
  netBalance?: number;
}

const tabs = [
  { id: 'home', icon: LayoutDashboard, label: 'Home' },
  { id: 'expenses', icon: Receipt, label: 'Expenses' },
  { id: 'friends', icon: Users, label: 'Friends' }
] as const;

export function Navbar({ activeTab, onTabChange, user, onLogout, netBalance }: NavbarProps) {
  const [showBalance, setShowBalance] = useState(false);

  return (
    <header className="navbar" role="banner">
      <div className="nav-brand" aria-label="SpendWise home">
        <IndianRupee size={22} aria-hidden="true" />
        <span>SpendWise</span>
      </div>

      <nav className="nav-tabs" aria-label="Main navigation" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${tab.id}-panel`}
              id={`${tab.id}-tab`}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="nav-user">
        {netBalance !== undefined && (
          <button
            className={`badge ${netBalance >= 0 ? 'badge-success' : 'badge-warning'} cursor-pointer`}
            onClick={() => setShowBalance(!showBalance)}
            aria-expanded={showBalance}
            aria-label={`Net balance: ${netBalance >= 0 ? '+' : ''}${formatCurrency(Math.abs(netBalance))} ${netBalance >= 0 ? 'to receive' : 'to pay'}`}
          >
            {netBalance >= 0 ? '+' : ''}{formatCurrency(Math.abs(netBalance))}
            <span className="hidden sm:inline"> {netBalance >= 0 ? 'to receive' : 'to pay'}</span>
          </button>
        )}

        {user && (
          <div className="hidden sm:flex flex-col items-end mr-3">
            <span className="user-name text-right">{user.name}</span>
            <span className="user-email text-right">{user.email}</span>
          </div>
        )}

        <button
          className="icon-btn"
          onClick={onLogout}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}