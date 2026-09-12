import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateDiceBearUrl, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AvatarWithFallbackProps {
  src?: string | null;
  avatarUrl?: string | null;
  username: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-12 w-12 text-base", xl: "h-16 w-16 text-lg" };

export function AvatarWithFallback({ src, avatarUrl, username, size = "md", className }: AvatarWithFallbackProps) {
  const imageSource = src ?? avatarUrl;
  const diceBearUrl = generateDiceBearUrl(username);
  return (
    <Avatar className={cn(sizeMap[size], className)}>
      <AvatarImage src={imageSource ?? diceBearUrl} alt={username} />
      <AvatarFallback className="bg-primary/20 text-primary font-semibold">
        {getInitials(username)}
      </AvatarFallback>
    </Avatar>
  );
}
