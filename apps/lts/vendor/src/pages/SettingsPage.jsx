import React, { useState } from 'react';
import { Header } from '@/components/ui/Header';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { User, Lock, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [savedMessage, setSavedMessage] = useState('');

  const [profile, setProfile] = useState({
    name: 'Shruti Verma',
    email: 'shruti.admin@localtradestreet.com',
    phone: '+91 98765 12345',
    role: 'Super Administrator'
  });

  const [password, setPassword] = useState({
    current: '',
    newPass: '',
    confirmPass: ''
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    vendorRegisterAlert: true,
    lowStockNotice: true,
    dailyReportSummary: false
  });

  const [system, setSystem] = useState({
    platformName: 'Local Trade Street (LTS)',
    currency: 'INR (₹)',
    commissionRate: '5.0',
    maintenanceMode: false
  });

  const handleSave = (msg) => {
    setSavedMessage(msg);
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      <Header title="Settings & Platform Configuration" subtitle="Manage your profile credentials, security, notifications, and system variables" />

      {savedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" /> {savedMessage}
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        {[
          { id: 'profile', label: 'Admin Profile', icon: User },
          { id: 'password', label: 'Change Password', icon: Lock },
          { id: 'notifications', label: 'Notification Settings', icon: Bell },
          { id: 'system', label: 'System Settings', icon: Shield }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Admin Profile */}
      {activeTab === 'profile' && (
        <Card className="max-w-2xl">
          <CardHeader title="Admin Profile Information" subtitle="Update your admin contact information" />
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                alt="Avatar"
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500/20"
              />
              <div>
                <Button variant="ghost" size="sm">Change Avatar</Button>
                <p className="text-[11px] text-slate-400 mt-1">Allowed formats: JPG, PNG (Max 2MB)</p>
              </div>
            </div>

            <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            <Input label="Email Address" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            <Input label="Contact Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <Input label="System Role" value={profile.role} disabled className="bg-slate-100 font-semibold" />

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => handleSave('Profile updated successfully!')}>
                <Save className="w-4 h-4" /> Save Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 2: Change Password */}
      {activeTab === 'password' && (
        <Card className="max-w-2xl">
          <CardHeader title="Security & Password" subtitle="Ensure your account uses a strong, safe password" />
          <CardContent className="space-y-4">
            <Input label="Current Password" type="password" placeholder="••••••••" value={password.current} onChange={(e) => setPassword({ ...password, current: e.target.value })} />
            <Input label="New Password" type="password" placeholder="••••••••" value={password.newPass} onChange={(e) => setPassword({ ...password, newPass: e.target.value })} />
            <Input label="Confirm New Password" type="password" placeholder="••••••••" value={password.confirmPass} onChange={(e) => setPassword({ ...password, confirmPass: e.target.value })} />

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => handleSave('Password updated successfully!')}>
                <Save className="w-4 h-4" /> Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Notification Settings */}
      {activeTab === 'notifications' && (
        <Card className="max-w-2xl">
          <CardHeader title="Notification Preferences" subtitle="Control which system triggers alert your admin email" />
          <CardContent className="space-y-4">
            {[
              { key: 'emailAlerts', title: 'Email Digest', desc: 'Receive periodic platform emails' },
              { key: 'vendorRegisterAlert', title: 'New Vendor Alert', desc: 'Notify when a new vendor submits registration' },
              { key: 'lowStockNotice', title: 'Low Stock Warnings', desc: 'Alert when product inventory falls below 10 units' },
              { key: 'dailyReportSummary', title: 'Daily Automated Reports', desc: 'Receive daily PDF sales summaries' }
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-800 text-xs">{item.title}</p>
                  <p className="text-[11px] text-slate-500">{item.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key]}
                  onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            ))}

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => handleSave('Notification preferences saved!')}>
                <Save className="w-4 h-4" /> Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: System Settings */}
      {activeTab === 'system' && (
        <Card className="max-w-2xl">
          <CardHeader title="System Variables & Governance" subtitle="Global configurations for Local Trade Street platform" />
          <CardContent className="space-y-4">
            <Input label="Application Title" value={system.platformName} onChange={(e) => setSystem({ ...system, platformName: e.target.value })} />
            <Input label="Default Currency" value={system.currency} disabled className="bg-slate-100 font-semibold" />
            <Input label="Platform Commission Rate (%)" type="number" value={system.commissionRate} onChange={(e) => setSystem({ ...system, commissionRate: e.target.value })} />

            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div>
                <p className="font-bold text-amber-900 text-xs">Maintenance Mode</p>
                <p className="text-[11px] text-amber-700">Disable vendor catalog edits & public store purchases</p>
              </div>
              <input
                type="checkbox"
                checked={system.maintenanceMode}
                onChange={(e) => setSystem({ ...system, maintenanceMode: e.target.checked })}
                className="w-5 h-5 text-amber-600 rounded cursor-pointer"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" onClick={() => handleSave('System configurations saved!')}>
                <Save className="w-4 h-4" /> Save System Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
