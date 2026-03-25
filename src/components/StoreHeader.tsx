import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StoreHeaderProps {
  onAdminClick: () => void;
  isAdmin: boolean;
}

const StoreHeader = ({ onAdminClick, isAdmin }: StoreHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          ✨ JAY <span className="text-primary">Cosméticos</span>
        </h1>
        <Button
          variant={isAdmin ? "default" : "outline"}
          size="sm"
          onClick={onAdminClick}
          className="gap-2"
        >
          <Lock className="h-4 w-4" />
          {isAdmin ? "Painel Admin" : "Admin"}
        </Button>
      </div>
    </header>
  );
};

export default StoreHeader;
