import { supabase } from "./supabaseClient";

export type Category = "cosmeticos" | "roupas";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  whatsapp: string;
  category: Category;
}

function fromDb(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    price: Number(row.price),
    description: (row.description as string) ?? "",
    imageUrl: (row.image_url as string) ?? "",
    whatsapp: (row.whatsapp as string) ?? "",
    category: ((row.category as string) ?? "cosmeticos") as Category,
  };
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map(fromDb);
}

export async function addProduct(product: Omit<Product, "id">): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      name: product.name,
      price: product.price,
      description: product.description,
      image_url: product.imageUrl,
      whatsapp: product.whatsapp,
      category: product.category,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return fromDb(data);
}

export async function updateProduct(product: Product): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({
      name: product.name,
      price: product.price,
      description: product.description,
      image_url: product.imageUrl,
      whatsapp: product.whatsapp,
      category: product.category,
    })
    .eq("id", product.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return fromDb(data);
}

export async function removeProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function generateWhatsAppLink(product: Product): string {
  const message = `Olá, tenho interesse no produto:\n\n🧴 *${product.name}*\n💰 Preço: R$ ${product.price.toFixed(2)}\n📝 ${product.description}\n🖼️ ${product.imageUrl}`;
  const phone = product.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
