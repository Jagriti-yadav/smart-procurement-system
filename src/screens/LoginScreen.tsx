import { useState } from 'react';
import { Sprout, ArrowLeft, Wheat, Users, Shield, Phone, ArrowRight } from 'lucide-react';
import { useRouter } from '@/store/Router';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { UserRole } from '@/types';
import { cn } from '@/utils/cn';

export function LoginScreen() {
  const { params, navigate, goBack } = useRouter();
  const { login, registerFarmer } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    (params.role as UserRole) ?? null
  );
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roles: { role: UserRole; label: string; desc: string; icon: React.ReactNode; demoPhone: string }[] = [
    { role: 'farmer', label: 'Farmer', desc: 'Book slots & track tokens', icon: <Wheat size={24} />, demoPhone: '+91 98765 43210' },
    { role: 'operator', label: 'Operator', desc: 'Manage centre queue', icon: <Users size={24} />, demoPhone: '+91 98290 12345' },
    { role: 'admin', label: 'Admin', desc: 'Monitor all centres', icon: <Shield size={24} />, demoPhone: '+91 90000 00000' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = login(selectedRole, phone.trim());
      if (!success) {
        setError('Phone number not found. Try the demo number shown above.');
        setLoading(false);
      } else {
        if (selectedRole === 'farmer') navigate('farmer-dashboard');
        else if (selectedRole === 'operator') navigate('operator-dashboard');
        else navigate('admin-dashboard');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50/30 flex flex-col">
      <header className="px-4 h-16 flex items-center">
        <button onClick={() => (selectedRole ? setSelectedRole(null) : goBack())} className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900">
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 mb-4">
              <Sprout size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800">Welcome to KisanSetu</h1>
            <p className="text-neutral-500 mt-1">Smart Procurement Management System</p>
          </div>

          {!selectedRole ? (
            <div className="space-y-3 animate-slide-up">
              <p className="text-center text-neutral-600 font-medium mb-4">Select your role to continue</p>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    setSelectedRole(r.role);
                    setPhone(r.demoPhone);
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-card border border-neutral-100 text-left transition-all hover:shadow-card-hover hover:border-primary-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                    {r.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-800">{r.label}</p>
                    <p className="text-sm text-neutral-500">{r.desc}</p>
                  </div>
                  <ArrowRight size={20} className="text-neutral-300 group-hover:text-primary-500" />
                </button>
              ))}
              <div className="pt-4 text-center">
                <p className="text-sm text-neutral-500">
                  New farmer?{' '}
                  <button onClick={() => navigate('register')} className="font-semibold text-primary-600 hover:underline">
                    Register here
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  {roles.find((r) => r.role === selectedRole)?.icon}
                </div>
                <div>
                  <p className="font-bold text-neutral-800">{roles.find((r) => r.role === selectedRole)?.label} Login</p>
                  <p className="text-sm text-neutral-500">Enter your registered phone number</p>
                </div>
              </div>

              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={error}
                icon={<Phone size={18} />}
                required
              />

              <div className="mt-3 bg-primary-50 rounded-xl p-3 text-sm text-primary-700">
                <p className="font-semibold mb-0.5">Demo Phone (click to fill):</p>
                <button
                  type="button"
                  onClick={() => setPhone(roles.find((r) => r.role === selectedRole)!.demoPhone)}
                  className="text-primary-700 font-bold hover:underline"
                >
                  {roles.find((r) => r.role === selectedRole)?.demoPhone}
                </button>
              </div>

              <Button type="submit" fullWidth size="lg" className="mt-5" disabled={loading || !phone.trim()}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>

              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="w-full mt-3 text-sm text-neutral-500 hover:text-neutral-700 font-medium"
              >
                Choose different role
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
