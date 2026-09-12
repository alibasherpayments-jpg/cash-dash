export function HeroIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} width="480" height="360" viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main dashboard card */}
      <rect x="60" y="40" width="360" height="280" rx="20" fill="#1A1A24" stroke="#6366F1" strokeWidth="1.5"/>
      {/* Header */}
      <rect x="60" y="40" width="360" height="60" rx="20" fill="#6366F1" fillOpacity="0.15"/>
      <rect x="80" y="60" width="80" height="8" rx="4" fill="#6366F1" fillOpacity="0.6"/>
      <rect x="80" y="75" width="50" height="6" rx="3" fill="#6366F1" fillOpacity="0.3"/>
      {/* Balance */}
      <rect x="80" y="120" width="140" height="14" rx="7" fill="#F59E0B" fillOpacity="0.8"/>
      <rect x="80" y="142" width="100" height="10" rx="5" fill="#6366F1" fillOpacity="0.4"/>
      {/* Stats row */}
      <rect x="80" y="175" width="70" height="55" rx="10" fill="#6366F1" fillOpacity="0.1" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.4"/>
      <rect x="165" y="175" width="70" height="55" rx="10" fill="#6366F1" fillOpacity="0.1" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.4"/>
      <rect x="250" y="175" width="70" height="55" rx="10" fill="#6366F1" fillOpacity="0.1" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.4"/>
      <rect x="335" y="175" width="70" height="55" rx="10" fill="#6366F1" fillOpacity="0.1" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.4"/>
      {/* Offers row */}
      <rect x="80" y="250" width="100" height="45" rx="8" fill="#2A2A38"/>
      <rect x="195" y="250" width="100" height="45" rx="8" fill="#2A2A38"/>
      <rect x="310" y="250" width="95" height="45" rx="8" fill="#2A2A38"/>
      {/* Floating badges */}
      <rect x="340" y="20" width="110" height="36" rx="10" fill="#10B981" fillOpacity="0.9"/>
      <circle cx="358" cy="38" r="8" fill="white" fillOpacity="0.3"/>
      <rect x="370" y="30" width="65" height="6" rx="3" fill="white" fillOpacity="0.8"/>
      <rect x="370" y="40" width="45" height="5" rx="2.5" fill="white" fillOpacity="0.5"/>
      <rect x="20" y="200" width="100" height="36" rx="10" fill="#F59E0B" fillOpacity="0.9"/>
      <rect x="32" y="210" width="75" height="6" rx="3" fill="white" fillOpacity="0.8"/>
      <rect x="32" y="220" width="55" height="5" rx="2.5" fill="white" fillOpacity="0.5"/>
    </svg>
  );
}
