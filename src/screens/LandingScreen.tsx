import { Sprout, ArrowRight, Wheat, Users, Shield, Clock, Ticket, Banknote, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useRouter } from '@/store/Router';
import { useApp } from '@/store/AppContext';

export function LandingScreen() {
  const { navigate } = useRouter();
  const { centres, bookings } = useApp();

  const totalProcessed = centres.reduce((s, c) => s + c.totalProcessedToday, 0);
  const totalPayment = centres.reduce((s, c) => s + c.totalPaymentToday, 0);
  const activeCentres = centres.filter((c) => c.status === 'open').length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 lg:px-8 h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <Sprout size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-neutral-800 text-lg block leading-none">KisanSetu</span>
              <span className="text-xs text-neutral-400">Smart Procurement</span>
            </div>
          </div>
          <button
            onClick={() => navigate('login')}
            className="btn-base bg-primary-600 text-white hover:bg-primary-700 px-5 py-2.5 text-sm"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-amber-50/30" />
        <div className="relative max-w-6xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-4">
                <Wheat size={16} />
                Government of Rajasthan Initiative
              </div>
              <h1 className="text-3xl lg:text-5xl font-extrabold text-neutral-800 leading-tight">
                Smart Procurement{' '}
                <span className="text-primary-600">Made Simple</span> for Every Farmer
              </h1>
              <p className="mt-4 text-lg text-neutral-600 max-w-lg">
                Book your procurement slot online, get a digital token, track your queue in real-time,
                and receive payments directly to your bank account. No more waiting in long lines.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('register')}
                  className="btn-base bg-primary-600 text-white hover:bg-primary-700 px-6 py-3.5 text-base shadow-md"
                >
                  Register as Farmer
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => navigate('login')}
                  className="btn-base bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 px-6 py-3.5 text-base"
                >
                  Sign In
                </button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
                {['No more waiting', 'Digital tokens', 'Direct DBT payment', 'Real-time tracking'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5 text-sm text-neutral-600">
                    <CheckCircle2 size={16} className="text-primary-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats card */}
            <div className="animate-scale-in">
              <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-6 lg:p-8">
                <h3 className="text-lg font-bold text-neutral-800 mb-1">Today's Procurement</h3>
                <p className="text-sm text-neutral-400 mb-6">Live data across all centres</p>
                <div className="grid grid-cols-2 gap-4">
                  <StatCard icon={<TrendingUp size={20} />} label="Active Centres" value={String(activeCentres)} color="primary" />
                  <StatCard icon={<Users size={20} />} label="Farmers Processed" value={String(totalProcessed)} color="blue" />
                  <StatCard icon={<Clock size={20} />} label="Active Bookings" value={String(bookings.filter((b) => !['paid', 'cancelled'].includes(b.status)).length)} color="amber" />
                  <StatCard icon={<Banknote size={20} />} label="Payment Today" value={`₹${(totalPayment / 100000).toFixed(1)}L`} color="green" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800">How KisanSetu Works</h2>
            <p className="mt-2 text-neutral-500">A simple 6-step journey from booking to payment</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="bg-white rounded-2xl p-6 shadow-card border border-neutral-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                    {step.icon}
                  </div>
                  <span className="text-sm font-bold text-primary-600">Step {i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-neutral-800 mb-1">{step.title}</h3>
                <p className="text-sm text-neutral-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role selection */}
      <section className="py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-neutral-800">Choose Your Role</h2>
            <p className="mt-2 text-neutral-500">Sign in to access your dashboard</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <RoleCard
              icon={<Wheat size={28} />}
              title="Farmer"
              desc="Book slots, track tokens, and receive payments"
              onClick={() => navigate('login', { role: 'farmer' })}
              color="primary"
            />
            <RoleCard
              icon={<Users size={28} />}
              title="Centre Operator"
              desc="Manage queues and process procurements"
              onClick={() => navigate('login', { role: 'operator' })}
              color="blue"
            />
            <RoleCard
              icon={<Shield size={28} />}
              title="Administrator"
              desc="Monitor centres and view district reports"
              onClick={() => navigate('login', { role: 'admin' })}
              color="amber"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-800 text-neutral-300 py-8">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sprout size={20} className="text-primary-400" />
            <span className="font-bold text-white">KisanSetu</span>
          </div>
          <p className="text-sm">Smart Procurement Management System | Government of Rajasthan</p>
          <p className="text-xs text-neutral-500 mt-2">Prototype for SIH 2026</p>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-primary-50 text-primary-600',
  };
  return (
    <div className="bg-neutral-50 rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${colorMap[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-neutral-800">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}

function RoleCard({ icon, title, desc, onClick, color }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white',
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white',
  };
  return (
    <button
      onClick={onClick}
      className="group bg-white rounded-2xl p-6 shadow-card border border-neutral-100 text-left transition-all hover:shadow-card-hover hover:border-neutral-200"
    >
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all ${colorMap[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-neutral-800 mb-1">{title}</h3>
      <p className="text-sm text-neutral-500">{desc}</p>
      <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary-600 group-hover:gap-2 transition-all">
        Sign In <ArrowRight size={16} />
      </div>
    </button>
  );
}

const steps = [
  { title: 'Register', desc: 'Create your farmer account with basic details and bank information for DBT.', icon: <Users size={20} /> },
  { title: 'Select Centre', desc: 'Choose the nearest procurement centre accepting your crop.', icon: <Wheat size={20} /> },
  { title: 'Book a Slot', desc: 'Pick a convenient time slot based on real-time availability.', icon: <Clock size={20} /> },
  { title: 'Get Digital Token', desc: 'Receive a unique token number instantly after booking.', icon: <Ticket size={20} /> },
  { title: 'Track Live Queue', desc: 'Monitor your queue position in real-time and get notified.', icon: <TrendingUp size={20} /> },
  { title: 'Receive Payment', desc: 'Get payment directly in your bank account via DBT after procurement.', icon: <Banknote size={20} /> },
];
