export function EmptyOffersIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="30" y="30" width="140" height="100" rx="12" fill="#1A1A24" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="6 3" />
      <circle cx="100" cy="65" r="20" fill="#6366F1" fillOpacity="0.15" />
      <path d="M92 65l5 5 11-11" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
      <rect x="55" y="95" width="90" height="8" rx="4" fill="#2A2A38" />
      <rect x="70" y="108" width="60" height="6" rx="3" fill="#2A2A38" />
      <circle cx="160" cy="35" r="15" fill="#F59E0B" fillOpacity="0.2" />
      <path d="M155 35h10M160 30v10" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    </svg>
  );
}

export { EmptyOffersIllustration as EmptyOffers };
