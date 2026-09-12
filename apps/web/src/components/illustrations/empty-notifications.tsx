export function EmptyNotificationsIllustration({ className }: { className?: string }) {
  return (
    <svg className={className} width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="75" r="45" fill="#6366F1" fillOpacity="0.08" />
      <path d="M100 45c-16.569 0-30 13.431-30 30v15l-5 10h70l-5-10V75c0-16.569-13.431-30-30-30z" fill="#1A1A24" stroke="#6366F1" strokeWidth="1.5"/>
      <rect x="92" y="100" width="16" height="4" rx="2" fill="#10B981" />
      <circle cx="100" cy="48" r="5" fill="#10B981" />
      <path d="M85 60l-8-8M115 60l8-8" stroke="#6366F1" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export { EmptyNotificationsIllustration as EmptyNotifications };
