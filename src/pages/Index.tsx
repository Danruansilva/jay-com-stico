import { useState, useCallback, useMemo, useEffect } from "react";
import { Search, X, Loader2, Sparkles, Shirt } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import StoreHeader from "@/components/StoreHeader";
import AdminLoginModal from "@/components/AdminLoginModal";
import AdminPanel from "@/components/AdminPanel";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProducts, addProduct, updateProduct, removeProduct } from "@/lib/store";
import type { Product, Category } from "@/lib/store";

const PRICE_RANGES = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "Até R$ 30", min: 0, max: 30 },
  { label: "R$ 30 – R$ 60", min: 30, max: 60 },
  { label: "R$ 60 – R$ 100", min: 60, max: 100 },
  { label: "Acima de R$ 100", min: 100, max: Infinity },
];

const CATEGORIES: { value: Category | "todos"; label: string; icon: React.ReactNode }[] = [
  { value: "todos", label: "Todos", icon: null },
  { value: "cosmeticos", label: "Cosméticos", icon: <Sparkles className="h-4 w-4" /> },
  { value: "roupas", label: "Roupas", icon: <Shirt className="h-4 w-4" /> },
];

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState(0);
  const [activeCategory, setActiveCategory] = useState<Category | "todos">("todos");

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAdminClick = () => {
    if (isAdmin) return;
    setShowLogin(true);
  };

  const handleLogin = () => {
    setIsAdmin(true);
    setShowLogin(false);
  };

  const handleAdd = useCallback(async (data: Omit<Product, "id">) => {
    const newProduct = await addProduct(data);
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const handleUpdate = useCallback(async (updated: Product) => {
    const saved = await updateProduct(updated);
    setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
  }, []);

  const handleRemove = useCallback(async (id: string) => {
    await removeProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const { min, max } = PRICE_RANGES[priceRange];
    return products.filter((p) => {
      const matchesCategory = activeCategory === "todos" || p.category === activeCategory;
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term);
      const matchesPrice = p.price >= min && p.price < max;
      return matchesCategory && matchesSearch && matchesPrice;
    });
  }, [products, search, priceRange, activeCategory]);

  const hasActiveFilter = search.trim() !== "" || priceRange !== 0 || activeCategory !== "todos";

  const clearFilters = () => {
    setSearch("");
    setPriceRange(0);
    setActiveCategory("todos");
  };

  // Título dinâmico da seção
  const sectionTitle =
    activeCategory === "cosmeticos"
      ? "Cosméticos"
      : activeCategory === "roupas"
      ? "Roupas"
      : "Nossos Produtos";

  return (
    <div className="min-h-screen bg-background">
      <StoreHeader onAdminClick={handleAdminClick} isAdmin={isAdmin} />

      {isAdmin && (
        <AdminPanel
          products={products}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onRemove={handleRemove}
          onLogout={() => setIsAdmin(false)}
        />
      )}

      <AdminLoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onLogin={handleLogin}
      />

      {/* Hero */}
      <section className="relative h-48 overflow-hidden sm:h-64 lg:h-80">
        <img
          src={heroBanner}
          alt="Jay Cosméticos"
          className="h-full w-full object-cover"
          width={1920}
          height={640}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/30">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-primary-foreground drop-shadow-lg sm:text-4xl lg:text-5xl">
              Beleza que encanta
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/90 drop-shadow sm:text-base">
              Produtos selecionados para cuidar de você
            </p>
          </div>
        </div>
      </section>

      {/* Botões de categoria */}
      <div className="border-b bg-card">
        <div className="container mx-auto flex gap-1 overflow-x-auto px-4 py-3 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {cat.icon}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Catálogo */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-center font-display text-2xl font-semibold text-foreground">
          {sectionTitle}
        </h2>

        {/* Busca + filtro de preço */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto..."
              className="pl-9 pr-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {PRICE_RANGES.map((range, i) => (
              <button
                key={range.label}
                onClick={() => setPriceRange(i)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  priceRange === i
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          {hasActiveFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-muted-foreground"
            >
              <X className="h-3 w-3" /> Limpar
            </Button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="py-20 text-center text-destructive">
            Erro ao carregar produtos: {error}
          </p>
        ) : filtered.length > 0 ? (
          <>
            {hasActiveFilter && (
              <p className="mb-4 text-sm text-muted-foreground">
                {filtered.length} produto{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <p className="py-20 text-center text-muted-foreground">
            {hasActiveFilter
              ? "Nenhum produto encontrado para essa busca."
              : "Nenhum produto cadastrado ainda."}
          </p>
        )}
      </main>

      {/* Footer com botões de categoria */}
      <footer className="border-t bg-card py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4 font-display text-lg font-semibold text-foreground">
            Explore nossas categorias
          </p>
          <div className="mb-6 flex justify-center gap-3">
            <button
              onClick={() => { setActiveCategory("cosmeticos"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <Sparkles className="h-4 w-4" />
              Cosméticos
            </button>
            <button
              onClick={() => { setActiveCategory("roupas"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center gap-2 rounded-full bg-secondary px-6 py-2.5 text-sm font-medium text-secondary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <Shirt className="h-4 w-4" />
              Roupas
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 Jay Cosméticos — Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
