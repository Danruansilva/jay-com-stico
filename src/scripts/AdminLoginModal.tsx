import { useState } from "react";
import bcrypt from "bcryptjs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Lidos em build-time pelo Vite — o hash é seguro de expor, a senha não.
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER as string;
const ADMIN_HASH = import.meta.env.VITE_ADMIN_HASH as string;

if (!ADMIN_USER || !ADMIN_HASH) {
  console.error(
    "[AdminLoginModal] VITE_ADMIN_USER ou VITE_ADMIN_HASH não definidos no .env"
  );
}

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const AdminLoginModal = ({ open, onClose, onLogin }: AdminLoginModalProps) => {
  const [user, setUser]       = useState("");
  const [pass, setPass]       = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Pequeno delay artificial — dificulta ataques de timing/força-bruta
      await new Promise((r) => setTimeout(r, 400));

      const userMatch = user === ADMIN_USER;
      // bcrypt.compare sempre roda mesmo se usuário estiver errado,
      // evitando que o tempo de resposta revele qual campo falhou.
      const passMatch = await bcrypt.compare(pass, ADMIN_HASH ?? "");

      if (userMatch && passMatch) {
        setUser("");
        setPass("");
        onLogin();
      } else {
        setError("Usuário ou senha inválidos.");
      }
    } catch {
      setError("Erro ao verificar credenciais. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Acesso Admin</DialogTitle>
          <DialogDescription>
            Entre com suas credenciais para gerenciar produtos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-user">Usuário</Label>
            <Input
              id="admin-user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              placeholder="Usuário"
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-pass">Senha</Label>
            <Input
              id="admin-pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="Senha"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verificando…" : "Entrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginModal;
