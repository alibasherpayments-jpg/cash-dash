import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 text-center">
      <div>
        <p className="text-8xl font-black text-primary/20">404</p>
        <h1 className="mt-2 text-2xl font-bold">Page Not Found</h1>
        <p className="mt-2 text-muted-foreground">The page you are looking for does not exist.</p>
      </div>
      <Button asChild>
        <Link href="/">Go Home</Link>
      </Button>
    </div>
  );
}
