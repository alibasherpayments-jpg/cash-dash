export function LeaderboardIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="70" y="60" width="60" height="80" rx="6" fill="#6366F1" fillOpacity="0.2" stroke="#6366F1" strokeWidth="1.5"/>
      <rect x="20" y="80" width="50" height="60" rx="6" fill="#6366F1" fillOpacity="0.1" stroke="#6366F1" strokeOpacity="0.5" strokeWidth="1"/>
      <rect x="130" y="90" width="50" height="50" rx="6" fill="#6366F1" fillOpacity="0.1" stroke="#6366F1" strokeOpacity="0.5" strokeWidth="1"/>
      <circle cx="100" cy="45" r="14" fill="#F59E0B"/>
      <path d="M95 45l4 4 8-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="45" cy="65" r="11" fill="#6B7280"/>
      <circle cx="155" cy="75" r="11" fill="#92400E"/>
      <text x="98" y="50" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">1</text>
    </svg>
  );
}
