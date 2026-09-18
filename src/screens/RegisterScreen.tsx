import { useState } from 'react';
import { ArrowLeft, Sprout, CheckCircle2, User, MapPin, Banknote } from 'lucide-react';
import { useRouter } from '@/store/Router';
import { useApp } from '@/store/AppContext';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import type { CropType } from '@/types';

export function RegisterScreen() {
  const { navigate, goBack } = useRouter();
  const { registerFarmer, login } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    village: '',
    district: 'Bharatpur',
    state: 'Rajasthan',
    landHolding: '',
    primaryCrop: 'Wheat' as CropType,
    bankAccount: '',
    bankName: '',
    ifsc: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    else if (!/^\+91\s?\d{5}\s?\d{5}$/.test(form.phone.trim())) errs.phone = 'Enter phone as +91 XXXXX XXXXX';
    if (!form.village.trim()) errs.village = 'Village is required';
    if (!form.landHolding) errs.landHolding = 'Enter land area';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!form.bankAccount.trim()) errs.bankAccount = 'Bank account is required';
    if (!form.bankName.trim()) errs.bankName = 'Bank name is required';
    if (!form.ifsc.trim()) errs.ifsc = 'IFSC code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validateStep2()) return;
    const farmer = registerFarmer({
      name: form.name,
      phone: form.phone,
      village: form.village,
      district: form.district,
      state: form.state,
      landHolding: parseFloat(form.landHolding),
      bankAccount: form.bankAccount,
      bankName: form.bankName,
      ifsc: form.ifsc,
    });
    setStep(3);
    // Auto-login after a delay
    setTimeout(() => {
      login('farmer', form.phone);
      navigate('farmer-dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-amber-50/30">
      <header className="px-4 h-16 flex items-center">
        <button onClick={() => (step > 1 && step < 3 ? setStep(step - 1) : goBack())} className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900">
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-600 mb-3">
              <Sprout size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-neutral-800">Farmer Registration</h1>
            <p className="text-neutral-500 mt-1">Join KisanSetu to start booking procurement slots</p>
          </div>

          {/* Progress */}
          {step < 3 && (
            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    step >= s ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'
                  }`}>
                    {step > s ? <CheckCircle2 size={16} /> : s}
                  </div>
                  {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-600' : 'bg-neutral-200'}`} />}
                </div>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6 animate-slide-up space-y-4">
              <div className="flex items-center gap-2 text-primary-700 mb-2">
                <User size={18} />
                <span className="font-semibold">Personal Details</span>
              </div>
              <Input label="Full Name" placeholder="e.g. Rameshwar Lal" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} />
              <Input label="Phone Number" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} error={errors.phone} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Village" placeholder="e.g. Khanpur" value={form.village} onChange={(e) => update('village', e.target.value)} error={errors.village} />
                <Input label="District" value={form.district} onChange={(e) => update('district', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Land Holding (acres)" type="number" placeholder="e.g. 4.5" value={form.landHolding} onChange={(e) => update('landHolding', e.target.value)} error={errors.landHolding} />
                <Select label="Primary Crop" value={form.primaryCrop} onChange={(e) => update('primaryCrop', e.target.value)}>
                  {['Wheat', 'Rice', 'Mustard', 'Soybean', 'Maize', 'Cotton', 'Groundnut', 'Bajra'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <Button fullWidth size="lg" onClick={() => validateStep1() && setStep(2)}>
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-6 animate-slide-up space-y-4">
              <div className="flex items-center gap-2 text-primary-700 mb-2">
                <Banknote size={18} />
                <span className="font-semibold">Bank Details (for DBT Payment)</span>
              </div>
              <Input label="Bank Account Number" placeholder="e.g. 1234567890" value={form.bankAccount} onChange={(e) => update('bankAccount', e.target.value)} error={errors.bankAccount} />
              <Input label="Bank Name" placeholder="e.g. State Bank of India" value={form.bankName} onChange={(e) => update('bankName', e.target.value)} error={errors.bankName} />
              <Input label="IFSC Code" placeholder="e.g. SBIN0001234" value={form.ifsc} onChange={(e) => update('ifsc', e.target.value)} error={errors.ifsc} />
              <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-700 flex gap-2">
                <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                <span>Ensure your bank account is linked to your Aadhaar for DBT payments.</span>
              </div>
              <Button fullWidth size="lg" onClick={handleSubmit}>
                Complete Registration
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8 text-center animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-neutral-800">Registration Successful!</h2>
              <p className="text-neutral-500 mt-2">Your farmer account has been created. Redirecting to your dashboard...</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-primary-600">
                <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading dashboard...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
