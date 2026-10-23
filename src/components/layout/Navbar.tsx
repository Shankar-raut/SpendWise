import { useState } from 'react';
import { LayoutDashboard, Receipt, Users, LogOut, IndianRupee } from 'lucide-react';

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
    <header className="navbar">
      <div className="nav-brand">
        <IndianRupee size={22} />
        <span>SpendWise</span>
      </div>

      <nav className="nav-tabs" aria-label="Main navigation">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={16} />
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
          >
            {netBalance >= 0 ? '+' : ''}{formatCurrency(Math.abs(netBalance))}
            {netBalance >= 0 ? ' to receive' : ' to pay'}
          </button>
        )}

        {user && (
          <>
            <div style={{ textAlign: 'right', display: 'none' }} className="hidden sm:block">
              <div className="user-name">{user.name}</div>
              <div className="user-email">{user.email}</div>
            </div>
            <button className="icon-btn" onClick={onLogout} aria-label="Sign out">
              <LogOut size={18} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}