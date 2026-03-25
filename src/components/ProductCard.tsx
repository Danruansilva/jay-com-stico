import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Product } from "@/lib/store";
import { generateWhatsAppLink } from "@/lib/store";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="flex flex-col gap-2 p-3 sm:p-4">
        <h3 className="font-display text-sm font-semibold leading-tight text-foreground sm:text-base">
          {product.name}
        </h3>
        <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
          {product.description}
        </p>
        <p className="font-display text-lg font-bold text-primary">
          R$ {product.price.toFixed(2)}
        </p>
        <Button
          asChild
          className="mt-1 w-full gap-2 bg-whatsapp text-whatsapp-foreground hover:bg-whatsapp/90"
        >
          <a href={generateWhatsAppLink(product)} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs sm:text-sm">WhatsApp</span>
          </a>
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
