import { useState } from "react";
import { Plus, LogOut, Trash2, Pencil, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Product, Category } from "@/lib/store";

interface AdminPanelProps {
  products: Product[];
  onAdd: (product: Omit<Product, "id">) => Promise<void>;
  onUpdate: (product: Product) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onLogout: () => void;
}

interface FormState {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  whatsapp: string;
  category: Category;
}

interface FormErrors {
  name?: string;
  price?: string;
  imageUrl?: string;
  whatsapp?: string;
}

function validateImageUrl(url: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol))
      return "A URL deve começar com http:// ou https://";
    const ext = parsed.pathname.split(".").pop()?.toLowerCase();
    const validExts = ["jpg", "jpeg", "png", "webp", "gif", "avif", "svg"];
    if (ext && !validExts.includes(ext) && !parsed.pathname.endsWith("/"))
      return "Use uma URL de imagem válida (.jpg, .png, .webp, etc.)";
    return undefined;
  } catch {
    return "URL inválida. Exemplo: https://exemplo.com/imagem.jpg";
  }
}

function validateWhatsApp(value: string): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15)
    return "Digite o número com DDD e código do país. Ex: 5511999999999";
  return undefined;
}

function validate(data: FormState): FormErrors {
  const errs: FormErrors = {};
  if (!data.name.trim()) errs.name = "Nome do produto é obrigatório.";
  const priceNum = parseFloat(data.price);
  if (!data.price) errs.price = "Preço é obrigatório.";
  else if (isNaN(priceNum) || priceNum <= 0) errs.price = "Preço deve ser maior que zero.";
  else if (priceNum > 99999) errs.price = "Preço não pode ultrapassar R$ 99.999.";
  const urlErr = validateImageUrl(data.imageUrl);
  if (urlErr) errs.imageUrl = urlErr;
  const waErr = validateWhatsApp(data.whatsapp);
  if (waErr) errs.whatsapp = waErr;
  return errs;
}

const emptyForm: FormState = {
  name: "", price: "", description: "", imageUrl: "", whatsapp: "", category: "cosmeticos",
};

const CATEGORY_LABELS: Record<Category, string> = {
  cosmeticos: "Cosméticos",
  roupas: "Roupas",
};

const AdminPanel = ({ products, onAdd, onUpdate, onRemove, onLogout }: AdminPanelProps) => {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [editTouched, setEditTouched] = useState<Record<string, boolean>>({});
  const [editSaving, setEditSaving] = useState(false);

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(form));
  };

  const handleChange = (field: string, value: string) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (touched[field]) setErrors(validate(updated));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, price: true, imageUrl: true, whatsapp: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSaving(true);
    try {
      await onAdd({
        name: form.name.trim(),
        price: parseFloat(parseFloat(form.price).toFixed(2)),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        whatsapp: form.whatsapp.replace(/\D/g, ""),
        category: form.category,
      });
      setForm(emptyForm);
      setErrors({});
      setTouched({});
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setEditForm({
      name: p.name, price: String(p.price), description: p.description,
      imageUrl: p.imageUrl, whatsapp: p.whatsapp, category: p.category,
    });
    setEditErrors({});
    setEditTouched({});
  };

  const handleEditBlur = (field: string) => {
    setEditTouched((prev) => ({ ...prev, [field]: true }));
    setEditErrors(validate(editForm));
  };

  const handleEditChange = (field: string, value: string) => {
    const updated = { ...editForm, [field]: value };
    setEditForm(updated);
    if (editTouched[field]) setEditErrors(validate(updated));
  };

  const handleEditSave = async () => {
    setEditTouched({ name: true, price: true, imageUrl: true, whatsapp: true });
    const errs = validate(editForm);
    setEditErrors(errs);
    if (Object.keys(errs).length > 0 || !editProduct) return;
    setEditSaving(true);
    try {
      await onUpdate({
        ...editProduct,
        name: editForm.name.trim(),
        price: parseFloat(parseFloat(editForm.price).toFixed(2)),
        description: editForm.description.trim(),
        imageUrl: editForm.imageUrl.trim(),
        whatsapp: editForm.whatsapp.replace(/\D/g, ""),
        category: editForm.category,
      });
      setEditProduct(null);
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await onRemove(confirmDelete.id);
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="flex items-center gap-1 text-xs text-destructive mt-1" role="alert">
        <AlertCircle className="h-3 w-3 flex-shrink-0" />
        {msg}
      </p>
    ) : null;

  return (
    <div className="border-b bg-accent/30 py-6">
      <div className="container mx-auto px-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-foreground">Painel Administrativo</h2>
          <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2 text-muted-foreground">
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>

        <Card className="p-5">
          <h3 className="mb-3 font-display text-lg font-medium">Adicionar Produto</h3>
          <form onSubmit={handleSubmit} noValidate className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="p-name">Nome *</Label>
              <Input id="p-name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} onBlur={() => handleBlur("name")} placeholder="Nome do produto" className={errors.name && touched.name ? "border-destructive" : ""} />
              <FieldError msg={touched.name ? errors.name : undefined} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-price">Preço (R$) *</Label>
              <Input id="p-price" type="number" min="0.01" max="99999" step="0.01" value={form.price} onChange={(e) => handleChange("price", e.target.value)} onBlur={() => handleBlur("price")} placeholder="0.00" className={errors.price && touched.price ? "border-destructive" : ""} />
              <FieldError msg={touched.price ? errors.price : undefined} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-cat">Categoria *</Label>
              <Select value={form.category} onValueChange={(v) => handleChange("category", v)}>
                <SelectTrigger id="p-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cosmeticos">Cosméticos</SelectItem>
                  <SelectItem value="roupas">Roupas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-image">URL da Imagem</Label>
              <Input id="p-image" value={form.imageUrl} onChange={(e) => handleChange("imageUrl", e.target.value)} onBlur={() => handleBlur("imageUrl")} placeholder="https://..." className={errors.imageUrl && touched.imageUrl ? "border-destructive" : ""} />
              <FieldError msg={touched.imageUrl ? errors.imageUrl : undefined} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-whats">WhatsApp</Label>
              <Input id="p-whats" value={form.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} onBlur={() => handleBlur("whatsapp")} placeholder="5511999999999" className={errors.whatsapp && touched.whatsapp ? "border-destructive" : ""} />
              <FieldError msg={touched.whatsapp ? errors.whatsapp : undefined} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="p-desc">Descrição</Label>
              <Textarea id="p-desc" value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Descrição curta" rows={2} />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full gap-2" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {saving ? "Salvando..." : "Adicionar"}
              </Button>
            </div>
          </form>
        </Card>

        {products.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 font-display text-sm font-medium text-muted-foreground">
              Produtos cadastrados ({products.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {products.map((p) => (
                <span key={p.id} className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-sm text-foreground shadow-sm">
                  <span className="text-xs text-muted-foreground">[{CATEGORY_LABELS[p.category]}]</span>
                  {p.name}
                  <button onClick={() => openEdit(p)} className="ml-1 text-muted-foreground hover:text-primary" aria-label={`Editar ${p.name}`}>
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button onClick={() => setConfirmDelete(p)} className="ml-0.5 text-muted-foreground hover:text-destructive" aria-label={`Remover ${p.name}`}>
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de edição */}
      <Dialog open={!!editProduct} onOpenChange={() => setEditProduct(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Editar Produto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1">
              <Label htmlFor="e-name">Nome *</Label>
              <Input id="e-name" value={editForm.name} onChange={(e) => handleEditChange("name", e.target.value)} onBlur={() => handleEditBlur("name")} className={editErrors.name && editTouched.name ? "border-destructive" : ""} />
              <FieldError msg={editTouched.name ? editErrors.name : undefined} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="e-price">Preço (R$) *</Label>
              <Input id="e-price" type="number" min="0.01" max="99999" step="0.01" value={editForm.price} onChange={(e) => handleEditChange("price", e.target.value)} onBlur={() => handleEditBlur("price")} className={editErrors.price && editTouched.price ? "border-destructive" : ""} />
              <FieldError msg={editTouched.price ? editErrors.price : undefined} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="e-cat">Categoria *</Label>
              <Select value={editForm.category} onValueChange={(v) => handleEditChange("category", v)}>
                <SelectTrigger id="e-cat">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cosmeticos">Cosméticos</SelectItem>
                  <SelectItem value="roupas">Roupas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="e-image">URL da Imagem</Label>
              <Input id="e-image" value={editForm.imageUrl} onChange={(e) => handleEditChange("imageUrl", e.target.value)} onBlur={() => handleEditBlur("imageUrl")} placeholder="https://..." className={editErrors.imageUrl && editTouched.imageUrl ? "border-destructive" : ""} />
              <FieldError msg={editTouched.imageUrl ? editErrors.imageUrl : undefined} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="e-whats">WhatsApp</Label>
              <Input id="e-whats" value={editForm.whatsapp} onChange={(e) => handleEditChange("whatsapp", e.target.value)} onBlur={() => handleEditBlur("whatsapp")} placeholder="5511999999999" className={editErrors.whatsapp && editTouched.whatsapp ? "border-destructive" : ""} />
              <FieldError msg={editTouched.whatsapp ? editErrors.whatsapp : undefined} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="e-desc">Descrição</Label>
              <Textarea id="e-desc" value={editForm.description} onChange={(e) => handleEditChange("description", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)} disabled={editSaving}>Cancelar</Button>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Salvando...</> : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover{" "}
              <span className="font-medium text-foreground">"{confirmDelete?.name}"</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Removendo...</> : "Sim, remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminPanel;
