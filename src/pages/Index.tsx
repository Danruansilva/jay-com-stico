import { useState, useCallback, useMemo } from "react";
import { Search, X } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";
import StoreHeader from "@/components/StoreHeader";
import AdminLoginModal from "@/components/AdminLoginModal";
import AdminPanel from "@/components/AdminPanel";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getProducts, addProduct, updateProduct, removeProduct } from "@/lib/store";
import type { Product } from "@/lib/store";

const PRICE_RANGES = [
  { label: "Todos", min: 0, max: Infinity },
  { label: "Até R$ 30", min: 0, max: 30 },
  { label: "R$ 30 – R$ 60", min: 30, max: 60 },
  { label: "R$ 60 – R$ 100", min: 60, max: 100 },
  { label: "Acima de R$ 100", min: 100, max: Infinity },
];

const Index = () => {
  const [products, setProducts] = useState<Product[]>(getProducts);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [search, setSearch] = useState("");
  const [priceRange, setPriceRange] = useState(0);

  const handleAdminClick = () => {
    if (isAdmin) return;
    setShowLogin(true);
  };

  const handleLogin = () => {
    setIsAdmin(true);
    setShowLogin(false);
  };

  const handleAdd = useCallback((data: Omit<Product, "id">) => {
    const newProduct = addProduct(data);
    setProducts((prev) => [...prev, newProduct]);
  }, []);

  const handleUpdate = useCallback((updated: Product) => {
    updateProduct(updated);
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const handleRemove = useCallback((id: string) => {
    removeProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const { min, max } = PRICE_RANGES[priceRange];
    return products.filter((p) => {
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term);
      const matchesPrice = p.price >= min && p.price < max;
      return matchesSearch && matchesPrice;
    });
  }, [products, search, priceRange]);

  const hasActiveFilter = search.trim() !== "" || priceRange !== 0;

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

      {/* Catálogo */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="mb-6 text-center font-display text-2xl font-semibold text-foreground">
          Nossos Produtos
        </h2>

        {/* Busca + filtro */}
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
              onClick={() => { setSearch(""); setPriceRange(0); }}
              className="gap-1 text-muted-foreground"
            >
              <X className="h-3 w-3" /> Limpar
            </Button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
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

      {/* Footer */}
      <footer className="border-t bg-card py-6 text-center text-sm text-muted-foreground">
        <p>© 2026 Jay Cosméticos — Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default Index;
