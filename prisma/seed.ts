// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data (order matters due to relations)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.itemVariant.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const biryani = await prisma.category.create({
    data: { name: "Biryani", icon: "🍚", description: "Aromatic rice dishes", displayOrder: 1 },
  });
  const karahi = await prisma.category.create({
    data: { name: "Karahi", icon: "🍲", description: "Traditional karahi dishes", displayOrder: 2 },
  });
  const bbq = await prisma.category.create({
    data: { name: "BBQ & Grill", icon: "🔥", description: "Grilled meats and kebabs", displayOrder: 3 },
  });
  const appetizers = await prisma.category.create({
    data: { name: "Appetizers", icon: "🥟", description: "Starters and snacks", displayOrder: 4 },
  });
  const drinks = await prisma.category.create({
    data: { name: "Drinks", icon: "🥤", description: "Beverages", displayOrder: 5 },
  });

  // Helper to create item + variant
  async function createItem(data: {
    categoryId: string;
    name: string;
    description: string;
    vegFlag?: boolean;
    spiceLevel?: number;
    photoUrl?: string;
    isBestseller?: boolean;
    isNew?: boolean;
    isTodaysDeal?: boolean;
    variants: { unit: string; price: number; stockStatus?: string }[];
  }) {
    const item = await prisma.item.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        vegFlag: data.vegFlag ?? false,
        spiceLevel: data.spiceLevel ?? 2,
        photoUrl: data.photoUrl,
        isBestseller: data.isBestseller ?? false,
        isNew: data.isNew ?? false,
        isTodaysDeal: data.isTodaysDeal ?? false,
      },
    });

    for (const v of data.variants) {
      await prisma.itemVariant.create({
        data: {
          itemId: item.id,
          unit: v.unit,
          price: v.price,
          stockStatus: v.stockStatus ?? "in_stock",
        },
      });
    }

    return item;
  }

  // Seed items
  await createItem({
    categoryId: biryani.id,
    name: "Chicken Biryani",
    description: "Aromatic basmati rice cooked with tender chicken pieces, saffron, and traditional spices.",
    spiceLevel: 2,
    isBestseller: true,
    variants: [
      { unit: "1kg", price: 450 },
      { unit: "2kg", price: 800 },
    ],
  });

  await createItem({
    categoryId: biryani.id,
    name: "Mutton Biryani",
    description: "Premium mutton slow-cooked with fragrant basmati rice and secret blend of spices.",
    spiceLevel: 2,
    isBestseller: true,
    variants: [
      { unit: "1kg", price: 650 },
      { unit: "2kg", price: 1200 },
    ],
  });

  await createItem({
    categoryId: biryani.id,
    name: "Family Biryani Box",
    description: "A complete biryani feast for the whole family with raita and salad.",
    spiceLevel: 1,
    isTodaysDeal: true,
    variants: [
      { unit: "3kg", price: 1600 },
    ],
  });

  await createItem({
    categoryId: karahi.id,
    name: "Chicken Karahi",
    description: "Fresh chicken cooked in tomato-based gravy with green chilies and ginger.",
    spiceLevel: 3,
    isBestseller: true,
    variants: [
      { unit: "1kg", price: 850 },
      { unit: "1.5kg", price: 1200 },
    ],
  });

  await createItem({
    categoryId: karahi.id,
    name: "Mutton Karahi",
    description: "Tender mutton pieces cooked in authentic karahi style with aromatic spices.",
    spiceLevel: 3,
    variants: [
      { unit: "1kg", price: 1200 },
      { unit: "1.5kg", price: 1700 },
    ],
  });

  await createItem({
    categoryId: bbq.id,
    name: "Seekh Kebab",
    description: "Minced meat kebabs grilled to perfection with traditional spices.",
    spiceLevel: 2,
    isBestseller: true,
    variants: [
      { unit: "4 pcs", price: 350 },
      { unit: "8 pcs", price: 650 },
    ],
  });

  await createItem({
    categoryId: bbq.id,
    name: "Chicken Tikka",
    description: "Boneless chicken marinated in yogurt and spices, grilled in tandoor.",
    spiceLevel: 2,
    isBestseller: true,
    variants: [
      { unit: "6 pcs", price: 400 },
      { unit: "12 pcs", price: 750 },
    ],
  });

  await createItem({
    categoryId: bbq.id,
    name: "Malai Boti",
    description: "Creamy and tender chicken pieces marinated in cream and mild spices.",
    spiceLevel: 1,
    isNew: true,
    variants: [
      { unit: "6 pcs", price: 450 },
      { unit: "12 pcs", price: 850 },
    ],
  });

  await createItem({
    categoryId: bbq.id,
    name: "Full Chicken BBQ Platter",
    description: "A mix of tikka, seekh kebab, and malai boti — perfect for sharing.",
    spiceLevel: 2,
    isTodaysDeal: true,
    variants: [
      { unit: "1 platter", price: 1500 },
    ],
  });

  await createItem({
    categoryId: appetizers.id,
    name: "Samosa",
    description: "Crispy pastry filled with spiced potatoes and peas.",
    spiceLevel: 2,
    vegFlag: true,
    variants: [
      { unit: "2 pcs", price: 100 },
      { unit: "6 pcs", price: 250 },
    ],
  });

  await createItem({
    categoryId: appetizers.id,
    name: "Chicken Spring Rolls",
    description: "Crispy rolls stuffed with seasoned chicken and vegetables.",
    spiceLevel: 1,
    isNew: true,
    variants: [
      { unit: "4 pcs", price: 200 },
      { unit: "8 pcs", price: 380 },
    ],
  });

  await createItem({
    categoryId: appetizers.id,
    name: "Garlic Naan",
    description: "Soft naan bread topped with garlic and butter.",
    spiceLevel: 0,
    vegFlag: true,
    variants: [
      { unit: "1 pc", price: 60 },
      { unit: "4 pcs", price: 200 },
    ],
  });

  await createItem({
    categoryId: drinks.id,
    name: "Coca Cola",
    description: "Classic cold drink.",
    spiceLevel: 0,
    vegFlag: true,
    variants: [
      { unit: "500ml", price: 80 },
      { unit: "1.5L", price: 150 },
    ],
  });

  await createItem({
    categoryId: drinks.id,
    name: "Fresh Lime Soda",
    description: "Refreshing lime soda with mint.",
    spiceLevel: 0,
    vegFlag: true,
    variants: [
      { unit: "1 glass", price: 120 },
    ],
  });

  await createItem({
    categoryId: drinks.id,
    name: "Lassi",
    description: "Traditional creamy yogurt drink.",
    spiceLevel: 0,
    vegFlag: true,
    isNew: true,
    variants: [
      { unit: "1 glass", price: 150 },
    ],
  });

  // Count results
  const categoryCount = await prisma.category.count();
  const itemCount = await prisma.item.count();
  const variantCount = await prisma.itemVariant.count();

  console.log(`✅ Seeded ${categoryCount} categories, ${itemCount} items, ${variantCount} variants`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });