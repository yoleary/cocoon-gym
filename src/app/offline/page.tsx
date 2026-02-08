import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <WifiOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">You&apos;re Offline</h1>
      <p className="max-w-sm text-muted-foreground">
        It looks like you&apos;ve lost your internet connection. Some features
        may be unavailable until you reconnect.
      </p>
      <Button
        variant="outline"
        onClick={() => window.location.reload()}
        className="mt-2"
      >
        Try Again
      </Button>
    </div>
  );
}
