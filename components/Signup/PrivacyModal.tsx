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
      <div className="bg-paper border border-ink/10 max-w-lg w-full max-h-[80vh] flex flex-col rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-ink/10 flex justify-between items-center bg-white">
          <h3 className="font-display font-bold text-lg text-ink">Terms of Service &amp; Privacy Policy</h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto text-sm text-ink/70 space-y-5 leading-relaxed bg-paper">
          <p className="text-ink/50">
            Please review how Manipu handles your information before continuing. By accepting, you
            agree to the terms below.
          </p>

          <div>
            <p className="font-display font-semibold text-ink text-sm mb-1">1. Information we collect</p>
            <p>
              We collect your name, email address, and business details when you create a seller
              account, along with information you provide when setting up your store, such as your
              pickup address and payout details.
            </p>
          </div>

          <div>
            <p className="font-display font-semibold text-ink text-sm mb-1">2. How we use your information</p>
            <p>
              Your information is used to operate your storefront, process orders, coordinate
              shipping with courier partners such as J&amp;T and Flash, and process your payouts. We
              do not sell your personal information to third parties.
            </p>
          </div>

          <div>
            <p className="font-display font-semibold text-ink text-sm mb-1">3. Your responsibilities as a merchant</p>
            <p>
              You are responsible for the accuracy of your product listings and for fulfilling
              customer orders in a timely manner, including coordinating pickup and delivery with
              your chosen courier.
            </p>
          </div>

          <div>
            <p className="font-display font-semibold text-ink text-sm mb-1">4. Payments and payouts</p>
            <p>
              Funds from completed orders are held securely and released to your linked payout
              account after standard verification checks. Processing times may vary by payout
              method.
            </p>
          </div>

          <div>
            <p className="font-display font-semibold text-ink text-sm mb-1">5. Signing in with Google or Facebook</p>
            <p>
              If you choose to continue with Google or Facebook, we only receive your name, email
              address, and profile photo from that provider to create and secure your account. We
              never receive or store your Google or Facebook password.
            </p>
          </div>

          <p className="text-xs text-ink/40 pt-2 border-t border-ink/10">
            For the full Terms of Service and Privacy Policy, visit{' '}
            <span className="font-medium text-ink/60">manipu.com/terms</span> and{' '}
            <span className="font-medium text-ink/60">manipu.com/privacy</span>.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-ink/10 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-ink/15 text-sm font-semibold rounded-full hover:bg-ink/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="px-5 py-2 bg-ink text-paper text-sm font-semibold rounded-full hover:bg-ink/90 transition-colors"
          >
            I Accept &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}