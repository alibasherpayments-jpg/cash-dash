export function SuccessIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#10B981" fillOpacity="0.12" />
      <circle cx="60" cy="60" r="38" fill="#10B981" fillOpacity="0.2" />
      <circle cx="60" cy="60" r="28" fill="#10B981" />
      <path d="M44 60l12 12 20-24" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
