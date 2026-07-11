// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
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
  const desserts = await prisma.category.create({
    data: { name: "Desserts", icon: "🍨", description: "Traditional sweets", displayOrder: 6 },
  });

  // Helper function
  async function createItem(data: {
    categoryId: string;
    name: string;
    description: string;
    photoUrl: string;
    vegFlag?: boolean;
    spiceLevel?: number;
    isBestseller?: boolean;
    isNew?: boolean;
    isTodaysDeal?: boolean;
    variants: { unit: string; price: number }[];
  }) {
    const item = await prisma.item.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        photoUrl: data.photoUrl,
        vegFlag: data.vegFlag ?? false,
        spiceLevel: data.spiceLevel ?? 2,
        isBestseller: data.isBestseller ?? false,
        isNew: data.isNew ?? false,
        isTodaysDeal: data.isTodaysDeal ?? false,
      },
    });

    for (const v of data.variants) {
      await prisma.itemVariant.create({
        data: { itemId: item.id, unit: v.unit, price: v.price },
      });
    }
    return item;
  }

  // --- EXISTING 15 ITEMS (Now with Images) ---
  
  await createItem({
    categoryId: biryani.id, name: "Chicken Biryani", spiceLevel: 2, isBestseller: true,
    description: "Aromatic basmati rice cooked with tender chicken pieces, saffron, and traditional spices.",
    photoUrl: "/images/menu/chicken-biryani.jpg",
    variants: [{ unit: "1kg", price: 450 }, { unit: "2kg", price: 800 }],
  });

  await createItem({
    categoryId: biryani.id, name: "Mutton Biryani", spiceLevel: 2, isBestseller: true,
    description: "Premium mutton slow-cooked with fragrant basmati rice and secret blend of spices.",
    photoUrl: "/images/menu/mutton-biryani.jpg",
    variants: [{ unit: "1kg", price: 650 }, { unit: "2kg", price: 1200 }],
  });

  await createItem({
    categoryId: biryani.id, name: "Family Biryani Box", spiceLevel: 1, isTodaysDeal: true,
    description: "A complete biryani feast for the whole family with raita and salad.",
    photoUrl: "/images/menu/family-biryani.jpg",
    variants: [{ unit: "3kg", price: 1600 }],
  });

  await createItem({
    categoryId: karahi.id, name: "Chicken Karahi", spiceLevel: 3, isBestseller: true,
    description: "Fresh chicken cooked in tomato-based gravy with green chilies and ginger.",
    photoUrl: "/images/menu/chicken-karahi.jpg",
    variants: [{ unit: "1kg", price: 850 }, { unit: "1.5kg", price: 1200 }],
  });

  await createItem({
    categoryId: karahi.id, name: "Mutton Karahi", spiceLevel: 3,
    description: "Tender mutton pieces cooked in authentic karahi style with aromatic spices.",
    photoUrl: "/images/menu/mutton-karahi.jpg",
    variants: [{ unit: "1kg", price: 1200 }, { unit: "1.5kg", price: 1700 }],
  });

  await createItem({
    categoryId: bbq.id, name: "Seekh Kebab", spiceLevel: 2, isBestseller: true,
    description: "Minced meat kebabs grilled to perfection with traditional spices.",
    photoUrl: "/images/menu/seekh-kebab.jpg",
    variants: [{ unit: "4 pcs", price: 350 }, { unit: "8 pcs", price: 650 }],
  });

  await createItem({
    categoryId: bbq.id, name: "Chicken Tikka", spiceLevel: 2, isBestseller: true,
    description: "Boneless chicken marinated in yogurt and spices, grilled in tandoor.",
    photoUrl: "/images/menu/chicken-tikka.jpg",
    variants: [{ unit: "6 pcs", price: 400 }, { unit: "12 pcs", price: 750 }],
  });

  await createItem({
    categoryId: bbq.id, name: "Malai Boti", spiceLevel: 1, isNew: true,
    description: "Creamy and tender chicken pieces marinated in cream and mild spices.",
    photoUrl: "/images/menu/malai-boti.jpg",
    variants: [{ unit: "6 pcs", price: 450 }, { unit: "12 pcs", price: 850 }],
  });

  await createItem({
    categoryId: bbq.id, name: "Full Chicken BBQ Platter", spiceLevel: 2, isTodaysDeal: true,
    description: "A mix of tikka, seekh kebab, and malai boti — perfect for sharing.",
    photoUrl: "/images/menu/bbq-platter.jpg",
    variants: [{ unit: "1 platter", price: 1500 }],
  });

  await createItem({
    categoryId: appetizers.id, name: "Samosa", spiceLevel: 2, vegFlag: true,
    description: "Crispy pastry filled with spiced potatoes and peas.",
    photoUrl: "/images/menu/samosa.jpg",
    variants: [{ unit: "2 pcs", price: 100 }, { unit: "6 pcs", price: 250 }],
  });

  await createItem({
    categoryId: appetizers.id, name: "Chicken Spring Rolls", spiceLevel: 1, isNew: true,
    description: "Crispy rolls stuffed with seasoned chicken and vegetables.",
    photoUrl: "/images/menu/spring-rolls.jpg",
    variants: [{ unit: "4 pcs", price: 200 }, { unit: "8 pcs", price: 380 }],
  });

  await createItem({
    categoryId: appetizers.id, name: "Garlic Naan", spiceLevel: 0, vegFlag: true,
    description: "Soft naan bread topped with garlic and butter.",
    photoUrl: "/images/menu/garlic-naan.jpg",
    variants: [{ unit: "1 pc", price: 60 }, { unit: "4 pcs", price: 200 }],
  });

  await createItem({
    categoryId: drinks.id, name: "Coca Cola", spiceLevel: 0, vegFlag: true,
    description: "Classic cold drink.", photoUrl: "/images/menu/cola.jpg",
    variants: [{ unit: "500ml", price: 80 }, { unit: "1.5L", price: 150 }],
  });

  await createItem({
    categoryId: drinks.id, name: "Fresh Lime Soda", spiceLevel: 0, vegFlag: true,
    description: "Refreshing lime soda with mint.", photoUrl: "/images/menu/lime-soda.jpg",
    variants: [{ unit: "1 glass", price: 120 }],
  });

  await createItem({
    categoryId: drinks.id, name: "Lassi", spiceLevel: 0, vegFlag: true, isNew: true,
    description: "Traditional creamy yogurt drink.", photoUrl: "/images/menu/lassi.jpg",
    variants: [{ unit: "1 glass", price: 150 }],
  });


  // --- 15 NEW ITEMS ---

  await createItem({
    categoryId: biryani.id, name: "Beef Biryani", spiceLevel: 3, isNew: true,
    description: "Slow-cooked beef chunks layered with fragrant basmati rice and aromatic spices.",
    photoUrl: "/images/menu/beef-biryani.jpg",
    variants: [{ unit: "1kg", price: 550 }, { unit: "2kg", price: 1000 }],
  });

  await createItem({
    categoryId: biryani.id, name: "Prawn Biryani", spiceLevel: 2,
    description: "Juicy prawns cooked with lightly spiced basmati rice and fresh herbs.",
    photoUrl: "/images/menu/prawn-biryani.jpg",
    variants: [{ unit: "1kg", price: 900 }],
  });

  await createItem({
    categoryId: karahi.id, name: "Fish Karahi", spiceLevel: 2, isNew: true,
    description: "Fresh fish pieces cooked in rich tomato and yogurt gravy with traditional spices.",
    photoUrl: "/images/menu/fish-karahi.jpg",
    variants: [{ unit: "1kg", price: 1100 }, { unit: "1.5kg", price: 1500 }],
  });

  await createItem({
    categoryId: karahi.id, name: "Prawns Karahi", spiceLevel: 2,
    description: "Jumbo prawns tossed in a spicy, tangy karahi sauce with green chilies.",
    photoUrl: "/images/menu/prawns-karahi.jpg",
    variants: [{ unit: "500g", price: 1200 }],
  });

  await createItem({
    categoryId: bbq.id, name: "Reshmi Kebab", spiceLevel: 1, isBestseller: true,
    description: "Silky smooth minced chicken kebabs wrapped around skewers and grilled.",
    photoUrl: "/images/menu/reshmi-kebab.jpg",
    variants: [{ unit: "4 pcs", price: 400 }, { unit: "8 pcs", price: 750 }],
  });

  await createItem({
    categoryId: bbq.id, name: "Chapli Kebab", spiceLevel: 3,
    description: "Spicy minced meat patties with pomegranate seeds, pan-fried to perfection.",
    photoUrl: "/images/menu/chapli-kebab.jpg",
    variants: [{ unit: "2 pcs", price: 300 }, { unit: "4 pcs", price: 550 }],
  });

  await createItem({
    categoryId: bbq.id, name: "Fish Tikka", spiceLevel: 2, isNew: true,
    description: "Marinated fish fillets grilled in the tandoor until flaky and smoky.",
    photoUrl: "/images/menu/fish-tikka.jpg",
    variants: [{ unit: "6 pcs", price: 600 }],
  });

  await createItem({
    categoryId: bbq.id, name: "Beef Boti", spiceLevel: 3,
    description: "Cubed beef marinated in robust spices and grilled over charcoal.",
    photoUrl: "/images/menu/beef-boti.jpg",
    variants: [{ unit: "6 pcs", price: 500 }, { unit: "12 pcs", price: 900 }],
  });

  await createItem({
    categoryId: appetizers.id, name: "Chicken Pakora", spiceLevel: 2,
    description: "Crispy deep-fried chicken fritters coated in spiced gram flour batter.",
    photoUrl: "/images/menu/chicken-pakora.jpg",
    variants: [{ unit: "4 pcs", price: 150 }, { unit: "8 pcs", price: 280 }],
  });

  await createItem({
    categoryId: appetizers.id, name: "Dahi Bhalla", spiceLevel: 0, vegFlag: true,
    description: "Soft lentil dumplings drowned in creamy yogurt topped with sweet and spicy chutneys.",
    photoUrl: "/images/menu/dahi-bhalla.jpg",
    variants: [{ unit: "2 pcs", price: 150 }, { unit: "4 pcs", price: 280 }],
  });

  await createItem({
    categoryId: appetizers.id, name: "Paneer Tikka", spiceLevel: 2, vegFlag: true, isNew: true,
    description: "Cubes of Indian cottage cheese marinated in spices and grilled in a tandoor.",
    photoUrl: "/images/menu/paneer-tikka.jpg",
    variants: [{ unit: "6 pcs", price: 350 }, { unit: "12 pcs", price: 650 }],
  });

  await createItem({
    categoryId: drinks.id, name: "Mango Lassi", spiceLevel: 0, vegFlag: true, isBestseller: true,
    description: "Sweet and refreshing yogurt drink blended with fresh mango pulp.",
    photoUrl: "/images/menu/mango-lassi.jpg",
    variants: [{ unit: "1 glass", price: 180 }],
  });

  await createItem({
    categoryId: drinks.id, name: "Mint Margarita", spiceLevel: 0, vegFlag: true, isNew: true,
    description: "A refreshing blend of fresh mint, lime, soda, and a hint of sugar.",
    photoUrl: "/images/menu/mint-margarita.jpg",
    variants: [{ unit: "1 glass", price: 150 }],
  });

  await createItem({
    categoryId: desserts.id, name: "Gulab Jamun", spiceLevel: 0, vegFlag: true, isBestseller: true,
    description: "Deep-fried milk dumplings soaked in rose-flavored sugar syrup.",
    photoUrl: "/images/menu/gulab-jamun.jpg",
    variants: [{ unit: "2 pcs", price: 100 }, { unit: "6 pcs", price: 250 }],
  });

  await createItem({
    categoryId: desserts.id, name: "Kheer", spiceLevel: 0, vegFlag: true, isNew: true,
    description: "Traditional rice pudding slow-cooked with milk, sugar, cardamom, and topped with nuts.",
    photoUrl: "/images/menu/kheer.jpg",
    variants: [{ unit: "1 bowl", price: 200 }],
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