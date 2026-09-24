 // app/onboarding/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// 🔌 INTEGRATED IMPORTS: Tinatawag ang dalawang forms na nasa components/onboarding/ folder
import StepBusinessIdentity from '@/components/onboarding/StepBusinessIdentity';
import StepStorefront from '@/components/onboarding/StepStorefront';

const supabase = createClient();

function SellerOnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Multi-step coordinator handles
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Identity parameters
  const [ownerName, setOwnerName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Form configurations
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Single Proprietorship');
  const [contactNumber, setContactNumber] = useState('');
  const [pickupAddress, setPickupAddress] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // 🚀 SESSION ENGINE HANDSHAKE VALIDATOR
  useEffect(() => {
    const fetchOAuthData = async () => {
      try {
        const nameFromUrl = searchParams.get('name');
        if (nameFromUrl) setOwnerName(decodeURIComponent(nameFromUrl));

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push('/login?error=unauthorized');
          return;
        }
        
        setUserId(user.id);
        if (!nameFromUrl) setOwnerName(user.user_metadata?.full_name || user.user_metadata?.name || '');

        // Kung may tindahan na itong user, i-bypass ang onboarding at ipadala sa dashboard
        const { data: existingStore } = await supabase.from('stores').select('slug').eq('owner_id', user.id).maybeSingle();
        if (existingStore) {
          router.push(`/dashboard/${existingStore.slug}`);
          return;
        }
        setSessionLoading(false);
      } catch {
        setMessage('Security Handshake Matrix Error.');
        setSessionLoading(false);
      }
    };
    fetchOAuthData();
  }, [searchParams, router]);

  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    setStoreSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-\$)+/g, ''));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setLogoFile(selectedFile);
      setLogoPreview(URL.createObjectURL(selectedFile));
    }
  };

  // 💾 DATABASE COMMITER HANDLER
  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1. Suriin kung may kaparehong slug sa database
      const { data: existingStore } = await supabase.from('stores').select('slug').eq('slug', storeSlug).maybeSingle();
      if (existingStore) {
        setMessage('❌ Store URL handle/slug is already taken. Please try a different Store Name.');
        setLoading(false);
        return;
      }

      // 2. I-upload ang logo sa Supabase Storage bucket ('logos') kung may piniling file
      let uploadedLogoUrl: string | null = null;
      if (logoFile && userId) {
        const fileExtension = logoFile.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExtension}`;
        
        const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile, { cacheControl: '3600', upsert: true });
        if (uploadError) throw uploadError;

        uploadedLogoUrl = supabase.storage.from('logos').getPublicUrl(fileName).data.publicUrl;
      }

      // 3. I-save ang buong store records sa row configuration tables
      const { error: storeError } = await supabase.from('stores').insert([{
        name: storeName, slug: storeSlug, theme_color: '#E8A33D', status: 'active',
        owner_id: userId, owner_name: ownerName || 'Google Merchant', business_name: businessName,
        business_type: businessType, contact_number: contactNumber, pickup_address: pickupAddress, logo_url: uploadedLogoUrl
      }]);

      if (storeError) throw storeError;
      setLoading(false);
      setMessage('success');
    } catch (error: unknown) {
      setLoading(false);
      const message = error instanceof Error ? error.message : 'Unknown onboarding error';
      setMessage(`Onboarding Error: ${message}`);
    }
  };

  // 🎉 LAUNCH SUCCESS LAYER PANEL
  if (message === 'success') {
    return (
      <div className="min-h-screen bg-paper text-ink flex flex-col justify-center items-center p-6 antialiased">
        <div className="bg-white p-8 rounded-2xl border border-ink/10 text-center max-w-md w-full shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-ink/5 text-ink text-3xl flex items-center justify-center rounded-full mx-auto mb-6">🚀</div>
          <h2 className="font-display font-bold text-3xl mb-2">Setup Complete!</h2>
          <p className="text-sm text-ink/60 mb-6 leading-relaxed">Welcome aboard <span className="font-semibold text-ink">{ownerName}</span>! Your store is now active live at:</p>
          <div className="bg-ink/5 p-3 rounded-xl font-mono text-sm mb-8 select-all">://manipu.com{storeSlug}</div>
          <button onClick={() => router.push(`/dashboard/${storeSlug}`)} className="w-full bg-ink text-paper font-semibold py-3.5 rounded-full text-sm hover:bg-ink/90 transition shadow-sm cursor-pointer">Go to Seller Dashboard</button>
        </div>
      </div>
    );
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center text-ink"><p className="text-xs font-mono text-ink/40 animate-pulse">Verifying session keys...</p></div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Complete your profile</h1>
          <p className="text-ink/50 text-sm">Hi {ownerName}, launch your workspace storefront deployment hub.</p>
        </div>

        <form onSubmit={handleCompleteOnboarding} className="bg-white border border-ink/10 rounded-2xl shadow-sm p-8">
          {message && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-mono mb-4 border border-red-100">{message}</div>}

          {/* DYNAMIC VIEW ROUTER: Pagpapalit ng view layout base sa currentStep status */}
          {currentStep === 1 ? (
            <StepBusinessIdentity
              businessName={businessName}
              setBusinessName={setBusinessName}
              businessType={businessType}
              setBusinessType={setBusinessType}
              contactNumber={contactNumber}
              setContactNumber={setContactNumber}
              pickupAddress={pickupAddress}
              setPickupAddress={setPickupAddress}
              onNext={() => setCurrentStep(2)}
            />
          ) : (
            <StepStorefront
              storeName={storeName}
              onStoreNameChange={handleStoreNameChange}
              storeSlug={storeSlug}
              logoPreview={logoPreview}
              handleFileChange={handleFileChange}
              loading={loading}
              onBack={() => setCurrentStep(1)}
            />
          )}
        </form>
      </div>
    </div>
  );
}

// CRITICAL EXPORT SECURITY WRAPPER WITH SUSPENSE BOUNDARY
export default function SellerOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper flex items-center justify-center text-ink"><p className="text-xs font-mono">Loading active map parameters...</p></div>}>
      <SellerOnboardingPageContent />
    </Suspense>
  );
}
