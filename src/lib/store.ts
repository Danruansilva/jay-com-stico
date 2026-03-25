export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  whatsapp: string;
}

const STORAGE_KEY = "cosmeticos-products";

export function getProducts(): Product[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return getDefaultProducts();
  try {
    const products = JSON.parse(data);
    return products.length ? products : getDefaultProducts();
  } catch {
    return getDefaultProducts();
  }
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function addProduct(product: Omit<Product, "id">): Product {
  const products = getProducts();
  const newProduct: Product = { ...product, id: crypto.randomUUID() };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

export function updateProduct(updated: Product): Product {
  const products = getProducts().map((p) => (p.id === updated.id ? updated : p));
  saveProducts(products);
  return updated;
}

export function removeProduct(id: string) {
  const products = getProducts().filter((p) => p.id !== id);
  saveProducts(products);
}

export function generateWhatsAppLink(product: Product): string {
  const message = `Olá, tenho interesse no produto:\n\n🧴 *${product.name}*\n💰 Preço: R$ ${product.price.toFixed(2)}\n📝 ${product.description}\n🖼️ ${product.imageUrl}`;
  const phone = product.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function getDefaultProducts(): Product[] {
  return [
    {
      id: "1",
      name: "Sérum Facial Vitamina C",
      price: 89.90,
      description: "Sérum antioxidante com vitamina C pura para luminosidade e firmeza.",
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
      whatsapp: "5511999999999",
    },
    {
      id: "2",
      name: "Hidratante Corporal Nude",
      price: 49.90,
      description: "Hidratação intensa com manteiga de karité e aroma suave.",
      imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop",
      whatsapp: "5511999999999",
    },
    {
      id: "3",
      name: "Batom Matte Rosé",
      price: 39.90,
      description: "Cor intensa e longa duração com acabamento matte aveludado.",
      imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop",
      whatsapp: "5511999999999",
    },
    {
      id: "4",
      name: "Água Micelar Suave",
      price: 34.90,
      description: "Limpeza delicada que remove maquiagem sem irritar a pele.",
      imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
      whatsapp: "5511999999999",
    },
  ];
}
