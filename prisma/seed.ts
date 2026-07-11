import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.itemVariant.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();

  // 1. Create 23 Categories
  const cats = await Promise.all([
    prisma.category.create({ data: { name: "Veg Kebab Collection", icon: "🥬", description: "Royal vegetarian kebabs", displayOrder: 1 } }),
    prisma.category.create({ data: { name: "Mutton Kebab Specials", icon: "🐑", description: "Premium mutton kebabs", displayOrder: 2 } }),
    prisma.category.create({ data: { name: "Chicken Tikka & Kebabs", icon: "🍗", description: "Tandoori chicken specialties", displayOrder: 3 } }),
    prisma.category.create({ data: { name: "Seafood Starters", icon: "🐟", description: "Fish and prawn appetizers", displayOrder: 4 } }),
    prisma.category.create({ data: { name: "Shahi Daal-e-Darbar", icon: "🍲", description: "Traditional lentil dishes", displayOrder: 5 } }),
    prisma.category.create({ data: { name: "Paneer Specialities", icon: "🧀", description: "Rich paneer curries", displayOrder: 6 } }),
    prisma.category.create({ data: { name: "Veg Curries", icon: "🥘", description: "Garden fresh vegetables", displayOrder: 7 } }),
    prisma.category.create({ data: { name: "Veg Kofta Curries", icon: "🧆", description: "Stuffed vegetable dumplings", displayOrder: 8 } }),
    prisma.category.create({ data: { name: "Chicken Main Course", icon: "🍛", description: "Awadhi chicken curries", displayOrder: 9 } }),
    prisma.category.create({ data: { name: "Egg Delicacies", icon: "🥚", description: "Classic egg preparations", displayOrder: 10 } }),
    prisma.category.create({ data: { name: "Mutton Main Course", icon: "🐐", description: "Royal mutton curries", displayOrder: 11 } }),
    prisma.category.create({ data: { name: "Fish & Prawns Curry", icon: "🦐", description: "Coastal seafood curries", displayOrder: 12 } }),
    prisma.category.create({ data: { name: "Rice & Biryani", icon: "🍚", description: "Aromatic rice delicacies", displayOrder: 13 } }),
    prisma.category.create({ data: { name: "Raitas", icon: "🥣", description: "Cool yogurt sides", displayOrder: 14 } }),
    prisma.category.create({ data: { name: "Desserts", icon: "🍨", description: "Sweet endings", displayOrder: 15 } }),
    prisma.category.create({ data: { name: "Awadhi Breads", icon: "🫓", description: "Tandoori breads", displayOrder: 16 } }),
    prisma.category.create({ data: { name: "Chinese Veg Starters", icon: "🥡", description: "Indo-Chinese veg appetizers", displayOrder: 17 } }),
    prisma.category.create({ data: { name: "Chinese Chicken Starters", icon: "🐉", description: "Indo-Chinese chicken appetizers", displayOrder: 18 } }),
    prisma.category.create({ data: { name: "Chinese Seafood", icon: "🦞", description: "Indo-Chinese seafood", displayOrder: 19 } }),
    prisma.category.create({ data: { name: "Veg Noodles", icon: "🍜", description: "Vegetarian noodles", displayOrder: 20 } }),
    prisma.category.create({ data: { name: "Chicken Noodles", icon: "🍝", description: "Chicken noodles", displayOrder: 21 } }),
    prisma.category.create({ data: { name: "Artisan Pasta", icon: "🫕", description: "Continental pasta", displayOrder: 22 } }),
    prisma.category.create({ data: { name: "Signature Food Park", icon: "👑", description: "Chef's signature dishes", displayOrder: 23 } }),
  ]);

  // Helper to add items fast
  const add = async (c: number, n: string, u1: string, p1: number, u2: string | null, p2: number | null, v = false, b = false) => {
    const item = await prisma.item.create({
      data: {
        categoryId: cats[c].id, name: n,
        description: `Authentic ${n} crafted with traditional recipes and premium ingredients.`,
        photoUrl: `/images/menu/${n.toLowerCase().replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}.jpg`,
        vegFlag: v, spiceLevel: v ? 0 : 2, isBestseller: b,
      },
    });
    const vars = [{ itemId: item.id, unit: u1, price: p1 }];
    if (u2 && p2) vars.push({ itemId: item.id, unit: u2, price: p2 });
    await prisma.itemVariant.createMany({ data: vars });
  };

  // 2. Add 5 Items Per Category (115 Total)

  // 0: Veg Kebab Collection
  await add(0, "Anar-e-Nawab Seekh", "1kg", 500, "500g", 300, true);
  await add(0, "Shahi Afghani Malai Chaap", "1kg", 600, "500g", 350, true);
  await add(0, "Nawabi Dahi Nazakat Kebab", "1kg", 700, "500g", 400, true);
  await add(0, "Mirch-e-Khaas Paneer Tikka", "1kg", 600, "500g", 350, true);
  await add(0, "Galawat-e-Awadh Kebab", "1kg", 500, "500g", 300, true, true);

  // 1: Mutton Kebab Specials
  await add(1, "Nawabi Mutton Seekh", "1kg", 1399, "500g", 749, false, true);
  await add(1, "Kakori-e-Awadh", "1kg", 1399, "500g", 749);
  await add(1, "Peshawari Chapli Kebab", "1kg", 1399, "500g", 749);
  await add(1, "Sikandari Mutton Burrah", "1kg", 1499, "500g", 749, false, true);
  await add(1, "Galawat-e-Khaas", "1kg", 1399, "500g", 749);

  // 2: Chicken Tikka & Kebabs
  await add(2, "Murgh Seekh-e-Sultan", "1kg", 999, "500g", 549, false, true);
  await add(2, "Afghani Malai-e-Taj Tikka", "1kg", 799, "500g", 449);
  await add(2, "Darbari Khada Masala Tikka", "1kg", 799, "500g", 449);
  await add(2, "Tandoori Chicken", "1kg", 799, "500g", 449, false, true);
  await add(2, "Tangdi Kebab", "1kg", 999, "500g", 549);

  // 3: Seafood Starters
  await add(3, "Amritsari Machhli-e-Khaas", "1kg", 899, "500g", 499);
  await add(3, "Ajwaini Fish Tikka", "1kg", 899, "500g", 499);
  await add(3, "Dhungar-e-Machhli Tikka", "1kg", 2399, "500g", 1299, false, true);
  await add(3, "Jhinga Angara-e-Shahi", "1kg", 2399, "500g", 1299);
  await add(3, "Jhinga Koliwada Nawabi", "1kg", 2399, "500g", 1299);

  // 4: Shahi Daal-e-Darbar
  await add(4, "Rajasthani Panchmel Dal", "1kg", 599, "500g", 349, true);
  await add(4, "Signature Dal Makhani", "1kg", 599, "500g", 349, true, true);
  await add(4, "Shahi Dal Maharani", "1kg", 599, "500g", 349, true);
  await add(4, "Desi Ghee Dal Tadka", "1kg", 599, "500g", 349, true);
  await add(4, "Amritsari Chole Masala", "1kg", 599, "500g", 349, true);

  // 5: Paneer Specialities
  await add(5, "Zafrani Paneer Makhani", "1kg", 899, "500g", 549, true, true);
  await add(5, "Nawabi Butter Paneer", "1kg", 899, "500g", 549, true);
  await add(5, "Paneer Do Pyaza-e-Darbar", "1kg", 899, "500g", 549, true);
  await add(5, "Lazeez Paneer Khurchan", "1kg", 899, "500g", 549, true);
  await add(5, "Angara Paneer Tikka Masala", "1kg", 899, "500g", 549, true);

  // 6: Veg Curries
  await add(6, "Mix Veg Handi", "1kg", 599, "500g", 349, true);
  await add(6, "Nizami Veg Handi", "1kg", 599, "500g", 349, true);
  await add(6, "Tandoori Mushroom Boti Masala", "1kg", 899, "500g", 499, true, true);
  await add(6, "Lahsuni Palak Saag", "1kg", 749, "500g", 499, true);
  await add(6, "Royal Kaju Matar Malai", "1kg", 899, "500g", 549, true);

  // 7: Veg Kofta Curries
  await add(7, "Shahi Malai Kofta", "1kg", 749, "500g", 399, true, true);
  await add(7, "Palak Anjeer Kofta-e-Khaas", "1kg", 749, "500g", 399, true);
  await add(7, "Nawabi Veg Malai Kofta", "1kg", 749, "500g", 399, true);
  await add(7, "Shahi Nargisi Kofta", "1kg", 749, "500g", 399, true);
  await add(7, "Sham Savera Royale", "1kg", 749, "500g", 399, true);

  // 8: Chicken Main Course
  await add(8, "Murgh Makhan-e-Khaas", "1kg", 999, "500g", 549, false, true);
  await add(8, "Kadhai Murgh", "1kg", 999, "500g", 549);
  await add(8, "Tandoori Chicken Tikka Masala", "1kg", 999, "500g", 549);
  await add(8, "Murgh Changezi", "1kg", 999, "500g", 549);
  await add(8, "Shahi Murgh Korma", "1kg", 999, "500g", 549);

  // 9: Egg Delicacies
  await add(9, "Aaloo Ande Ka Salan", "1kg", 599, "500g", 399);
  await add(9, "Anda Masala", "1kg", 599, "500g", 399);
  await add(9, "Anda Curry", "1kg", 599, "500g", 399);
  await add(9, "Anda Ghotala", "1kg", 599, "500g", 399, false, true);
  await add(9, "Roast Egg Masala", "1kg", 599, "500g", 399);

  // 10: Mutton Main Course
  await add(10, "Awadhi Nalli Nihari", "1kg", 1599, "500g", 849, false, true);
  await add(10, "Dum Bandh Gosht", "1kg", 1599, "500g", 849);
  await add(10, "Kashmiri Rogan Josh", "1kg", 1599, "500g", 849, false, true);
  await add(10, "Kadhai Gosht", "1kg", 1599, "500g", 849);
  await add(10, "Rajwadi Laal Maas", "1kg", 1599, "500g", 849);

  // 11: Fish & Prawns Curry
  await add(11, "Nawabi Awadhi Fish Curry", "1kg", 999, "500g", 549, false, true);
  await add(11, "Raw Mango Fish Curry", "1kg", 999, "500g", 549);
  await add(11, "Authentic Goan Fish Curry", "1kg", 999, "500g", 549);
  await add(11, "Tawa Pomfret Masala", "1kg", 1699, "500g", 899, false, true);
  await add(11, "Kolkata Macher Jhol", "1kg", 1299, "500g", 699);

  // 12: Rice & Biryani
  await add(12, "Shahi Subz Pulao", "1kg", 699, "500g", 399, true);
  await add(12, "Subz Chaman Dum Biryani", "1kg", 749, "500g", 399, true);
  await add(12, "Nawabi Murgh Dum Biryani", "1kg", 1049, "500g", 599, false, true);
  await add(12, "Arabian Mutton Mandi", "1kg", 1799, "500g", 999, false, true);
  await add(12, "Nawabi Gosht Dum Biryani", "1kg", 1699, "500g", 899);

  // 13: Raitas
  await add(13, "Burani Raita-e-Khaas", "500ml", 249, "250ml", 149, true);
  await add(13, "Kheera Pudina Raita", "500ml", 249, "250ml", 149, true);
  await add(13, "Fresh Pudina Raita", "500ml", 249, "250ml", 149, true);
  await add(13, "Garden Fresh Veg Raita", "500ml", 300, "250ml", 179, true);
  await add(13, "Pineapple Raita", "500ml", 549, "250ml", 349, true);

  // 14: Desserts
  await add(14, "Zauq-e-Shahi", "1kg", 899, "500g", 499, true, true);
  await add(14, "Mawa Kheer-e-Khaas", "1kg", 1200, "500g", 649, true, true);
  await add(14, "Zafrani Rice Phirni", "1kg", 899, "500g", 499, true);
  await add(14, "Classic Cream Kunafa", "1 pc", 449, "2 pcs", 899, true);
  await add(14, "Belgian Chocolate Kunafa", "1 pc", 449, "2 pcs", 899, true);

  // 15: Awadhi Breads
  await add(15, "Tandoori Roti", "1 pc", 25, "4 pcs", 100, true);
  await add(15, "Butter Tandoori Roti", "1 pc", 35, "4 pcs", 140, true);
  await add(15, "Lachha Paratha", "1 pc", 70, "4 pcs", 280, true, true);
  await add(15, "Garlic Naan", "1 pc", 70, "4 pcs", 280, true, true);
  await add(15, "Cheese Garlic Naan", "1 pc", 80, "4 pcs", 320, true);

  // 16: Chinese Veg Starters
  await add(16, "Honey Chilli Potato", "1kg", 849, "500g", 449, true, true);
  await add(16, "Veg Spring Rolls", "1kg", 849, "500g", 449, true);
  await add(16, "Crispy Corn Pepper Salt", "1kg", 849, "500g", 449, true);
  await add(16, "Kung Pao Paneer", "1kg", 849, "500g", 449, true);
  await add(16, "Mushroom Pepper Salt", "1kg", 849, "500g", 449, true);

  // 17: Chinese Chicken Starters
  await add(17, "Chicken Lollipop", "1kg", 899, "500g", 499, false, true);
  await add(17, "Crispy Fried Chicken", "1kg", 899, "500g", 499);
  await add(17, "Dragon Chicken", "1kg", 899, "500g", 499);
  await add(17, "Chicken Schezwan", "1kg", 899, "500g", 499);
  await add(17, "Crispy Honey Chicken", "1kg", 899, "500g", 499);

  // 18: Chinese Seafood
  await add(18, "Chilli Fish", "1kg", 1199, "500g", 699, false, true);
  await add(18, "Fish Fingers", "1kg", 1199, "500g", 699);
  await add(18, "Dragon Fish", "1kg", 1199, "500g", 699);
  await add(18, "Golden Fried Prawns", "1kg", 2399, "500g", 1499, false, true);
  await add(18, "Salt & Pepper Prawns", "1kg", 2399, "500g", 1499);

  // 19: Veg Noodles
  await add(19, "Veg Hakka Noodles", "1kg", 699, "500g", 399, true, true);
  await add(19, "Veg Schezwan Noodles", "1kg", 699, "500g", 399, true);
  await add(19, "Veg Chilli Garlic Noodles", "1kg", 699, "500g", 399, true);
  await add(19, "Veg Burnt Garlic Noodles", "1kg", 699, "500g", 399, true);
  await add(19, "Veg Singapore Noodles", "1kg", 699, "500g", 399, true);

  // 20: Chicken Noodles
  await add(20, "Chicken Hakka Noodles", "1kg", 799, "500g", 449, false, true);
  await add(20, "Chicken Schezwan Noodles", "1kg", 799, "500g", 449);
  await add(20, "Chicken Chilli Garlic Noodles", "1kg", 799, "500g", 449);
  await add(20, "Chicken Burnt Garlic Noodles", "1kg", 799, "500g", 449);
  await add(20, "Chicken Singapore Noodles", "1kg", 799, "500g", 449);

  // 21: Artisan Pasta
  await add(21, "Arrabbiata Pasta", "1kg", 899, "500g", 499, true, true);
  await add(21, "Creamy Alfredo Pasta", "1kg", 899, "500g", 499, true);
  await add(21, "Pink Sauce Pasta", "1kg", 899, "500g", 499, true);
  await add(21, "Pesto Basil Pasta", "1kg", 899, "500g", 499, true);
  await add(21, "Four Cheese Pasta", "1kg", 899, "500g", 499, true);

  // 22: Signature Food Park
  await add(22, "Shahi Sikandari Raan", "Full Portion", 2499, null, null, false, true);
  await add(22, "Dum Raan Khade Masalon Ki", "Full Portion", 2499, null, null, false, true);
  await add(22, "Nawabi Tandoori Murgh", "Full Portion", 999, null, null, false);
  await add(22, "Dum Haleem-e-Shahi", "1kg", 1899, "500g", 999, false, true);
  await add(22, "Lucknowi Bheja Masala", "1kg", 2299, "500g", 1299, false);

  console.log(`✅ Seeded ${cats.length} categories and 115 items`);
}

main().catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); }).finally(() => prisma.$disconnect());