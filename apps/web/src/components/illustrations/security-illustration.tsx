export function SecurityIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 15L25 28v22c0 20 15 38 35 43 20-5 35-23 35-43V28L60 15z" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="2"/>
      <circle cx="60" cy="55" r="12" fill="#6366F1" fillOpacity="0.3" stroke="#6366F1" strokeWidth="1.5"/>
      <rect x="53" y="62" width="14" height="14" rx="3" fill="#6366F1" fillOpacity="0.4" stroke="#6366F1" strokeWidth="1.5"/>
      <path d="M56 62v-6a4 4 0 018 0v6" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
