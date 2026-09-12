export function EmptyWithdrawalsIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="40" y="40" width="120" height="80" rx="10" fill="#1A1A24" stroke="#6366F1" strokeWidth="1.5"/>
      <rect x="40" y="40" width="120" height="25" rx="10" fill="#6366F1" fillOpacity="0.2"/>
      <path d="M100 80v25M88 93l12 12 12-12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="55" y="108" width="90" height="6" rx="3" fill="#2A2A38"/>
    </svg>
  );
}

export { EmptyWithdrawalsIllustration as EmptyWithdrawals };
