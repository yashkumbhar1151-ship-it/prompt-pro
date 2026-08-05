import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">User Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to view your profile information.</p>
        <Button onClick={() => startLogin()} className="mt-4">Sign in</Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-semibold">User Profile</h1>
        <div className="mt-4 rounded-2xl bg-secondary p-4">
          <p className="text-sm text-muted-foreground">Name</p>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="mt-3 text-sm text-muted-foreground">Email</p>
          <p className="text-lg font-semibold">{user.email}</p>
        </div>
        <Button onClick={() => logout()} variant="outline" className="mt-4">
          Sign out
        </Button>
      </Card>
    </div>
  );
}
