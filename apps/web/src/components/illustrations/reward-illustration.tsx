export function RewardIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="50" fill="#F59E0B" fillOpacity="0.1" />
      <polygon points="60,25 70,50 97,50 75,67 83,92 60,75 37,92 45,67 23,50 50,50" fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="1.5"/>
      <polygon points="60,35 67,55 88,55 72,66 78,86 60,74 42,86 48,66 32,55 53,55" fill="#F59E0B" />
    </svg>
  );
}
