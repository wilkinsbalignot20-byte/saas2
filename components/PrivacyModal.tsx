// components/PrivacyModal.tsx
import { X } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export default function PrivacyModal({ isOpen, onClose, onAccept }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-paper border border-ink/10 max-w-lg w-full max-h-[75vh] flex flex-col rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-ink/10 flex justify-between items-center bg-paper">
          <h3 className="font-display font-bold text-lg text-ink">Terms &amp; Privacy Policy</h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-xs text-ink/70 space-y-4 font-mono leading-relaxed bg-paper">
          <p className="font-bold text-ink text-sm font-sans mb-2">Welcome to Manipu Storefront Ecosystem</p>
          <p>1. Data Transparency: We securely handle your full name and registration email.</p>
          <p>2. Merchant Control: You agree to fulfill all customer delivery logs responsibly via J&amp;T or Flash.</p>
          <p>3. Payout Processing: Funds withdrawn undergo immediate operational validation checks.</p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-ink/10 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-ink/10 text-xs font-semibold rounded-full hover:bg-ink/5 transition">
            Close
          </button>
          <button onClick={onAccept} className="px-5 py-2 bg-ink text-paper text-xs font-semibold rounded-full hover:bg-ink/90 transition">
            I Accept Policies
          </button>
        </div>

      </div>
    </div>
  );
}
