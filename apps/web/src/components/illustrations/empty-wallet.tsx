export function EmptyWalletIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="45" width="150" height="90" rx="12" fill="#1A1A24" stroke="#6366F1" strokeWidth="1.5" />
      <rect x="25" y="45" width="150" height="30" rx="12" fill="#6366F1" fillOpacity="0.2" />
      <rect x="130" y="80" width="35" height="25" rx="8" fill="#F59E0B" fillOpacity="0.2" stroke="#F59E0B" strokeWidth="1" />
      <circle cx="147" cy="92" r="6" fill="#F59E0B" fillOpacity="0.4" />
      <rect x="40" y="85" width="70" height="7" rx="3.5" fill="#2A2A38" />
      <rect x="40" y="98" width="50" height="6" rx="3" fill="#2A2A38" />
    </svg>
  );
}

export { EmptyWalletIllustration as EmptyWallet };
