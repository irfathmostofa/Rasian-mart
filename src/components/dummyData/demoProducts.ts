// data/demoProducts.ts

export interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  stock: number;
  rating: number;
  image: string;
  badge?: string;
}

export const demoProducts: Product[] = [
  // 🛒 Groceries (8 products)
  {
    id: 1,
    name: "Organic Apples (1kg)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "groceries",
    price: 120,
    oldPrice: 150,
    discount: 20,
    stock: 30,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=11",
    badge: "Fresh",
  },
  {
    id: 2,
    name: "Premium Basmati Rice (5kg)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "groceries",
    price: 899,
    oldPrice: 999,
    discount: 10,
    stock: 12,
    rating: 4.7,
    image: "https://picsum.photos/300/200?random=12",
    badge: "Best Seller",
  },
  {
    id: 3,
    name: "Olive Oil Extra Virgin (1L)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "groceries",
    price: 499,
    oldPrice: 550,
    discount: 9,
    stock: 20,
    rating: 4.6,
    image: "https://picsum.photos/300/200?random=13",
    badge: "Healthy",
  },
  {
    id: 4,
    name: "Brown Bread (400g)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    category: "groceries",
    price: 70,
    oldPrice: 85,
    discount: 18,
    stock: 15,
    rating: 4.2,
    image: "https://picsum.photos/300/200?random=14",
  },
  {
    id: 5,
    name: "Almonds Pack (250g)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "groceries",
    price: 350,
    oldPrice: 400,
    discount: 12,
    stock: 8,
    rating: 4.8,
    image: "https://picsum.photos/300/200?random=15",
    badge: "New",
  },
  {
    id: 31,
    name: "Fresh Milk (1L)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "groceries",
    price: 60,
    oldPrice: 70,
    discount: 14,
    stock: 25,
    rating: 4.3,
    image: "https://picsum.photos/300/200?random=16",
  },
  {
    id: 32,
    name: "Honey Jar (500g)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "groceries",
    price: 250,
    oldPrice: 300,
    discount: 17,
    stock: 15,
    rating: 4.6,
    image: "https://picsum.photos/300/200?random=17",
    badge: "Natural",
  },
  {
    id: 33,
    name: "Pasta Pack (500g)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "groceries",
    price: 80,
    oldPrice: 95,
    discount: 16,
    stock: 20,
    rating: 4.4,
    image: "https://picsum.photos/300/200?random=18",
  },

  // 📱 Electronics (8 products)
  {
    id: 6,
    name: "Smartphone Pro X",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "electronics",
    price: 899,
    oldPrice: 999,
    discount: 10,
    stock: 20,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=21",
    badge: "Hot",
  },
  {
    id: 7,
    name: "Wireless Earbuds",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "electronics",
    price: 199,
    oldPrice: 249,
    discount: 20,
    stock: 12,
    rating: 4,
    image: "https://picsum.photos/300/200?random=22",
    badge: "New",
  },
  {
    id: 8,
    name: "Smartwatch Series 5",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "electronics",
    price: 299,
    oldPrice: 350,
    discount: 15,
    stock: 18,
    rating: 4.3,
    image: "https://picsum.photos/300/200?random=23",
  },
  {
    id: 9,
    name: "Gaming Laptop",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "electronics",
    price: 1500,
    oldPrice: 1700,
    discount: 12,
    stock: 7,
    rating: 4.6,
    image: "https://picsum.photos/300/200?random=24",
  },
  {
    id: 10,
    name: "4K Smart TV 55”",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "electronics",
    price: 999,
    oldPrice: 1200,
    discount: 17,
    stock: 10,
    rating: 4.4,
    image: "https://picsum.photos/300/200?random=25",
    badge: "Best Seller",
  },
  {
    id: 34,
    name: "Bluetooth Speaker",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "electronics",
    price: 120,
    oldPrice: 150,
    discount: 20,
    stock: 15,
    rating: 4.2,
    image: "https://picsum.photos/300/200?random=26",
  },
  {
    id: 35,
    name: "Digital Camera",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "electronics",
    price: 450,
    oldPrice: 550,
    discount: 18,
    stock: 8,
    rating: 4.7,
    image: "https://picsum.photos/300/200?random=27",
    badge: "Sale",
  },
  {
    id: 36,
    name: "Tablet 10 inch",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "electronics",
    price: 350,
    oldPrice: 420,
    discount: 17,
    stock: 12,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=28",
  },

  // 👕 Fashion (8 products)
  {
    id: 11,
    name: "Men's Casual Shirt",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "fashion",
    price: 49,
    oldPrice: 60,
    discount: 18,
    stock: 25,
    rating: 4.2,
    image: "https://picsum.photos/300/200?random=31",
  },
  {
    id: 12,
    name: "Women's Summer Dress",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "fashion",
    price: 79,
    oldPrice: 99,
    discount: 20,
    stock: 18,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=32",
    badge: "Trending",
  },
  {
    id: 13,
    name: "Men's Leather Jacket",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "fashion",
    price: 150,
    oldPrice: 180,
    discount: 17,
    stock: 12,
    rating: 4.7,
    image: "https://picsum.photos/300/200?random=33",
  },
  {
    id: 14,
    name: "Sneakers (Unisex)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "fashion",
    price: 99,
    oldPrice: 120,
    discount: 15,
    stock: 20,
    rating: 4.6,
    image: "https://picsum.photos/300/200?random=34",
    badge: "Hot",
  },
  {
    id: 15,
    name: "Women's Handbag",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "fashion",
    price: 110,
    oldPrice: 140,
    discount: 21,
    stock: 8,
    rating: 4.4,
    image: "https://picsum.photos/300/200?random=35",
  },
  {
    id: 37,
    name: "Denim Jeans",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "fashion",
    price: 65,
    oldPrice: 80,
    discount: 19,
    stock: 22,
    rating: 4.3,
    image: "https://picsum.photos/300/200?random=36",
  },
  {
    id: 38,
    name: "Winter Scarf",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "fashion",
    price: 25,
    oldPrice: 35,
    discount: 29,
    stock: 30,
    rating: 4.1,
    image: "https://picsum.photos/300/200?random=37",
    badge: "Cozy",
  },
  {
    id: 39,
    name: "Formal Shoes",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "fashion",
    price: 85,
    oldPrice: 110,
    discount: 23,
    stock: 15,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=38",
  },

  // 🏠 Home (8 products)
  {
    id: 16,
    name: "Ceramic Dinner Set (12 pcs)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "home",
    price: 85,
    oldPrice: 100,
    discount: 15,
    stock: 10,
    rating: 4.3,
    image: "https://picsum.photos/300/200?random=41",
  },
  {
    id: 17,
    name: "LED Table Lamp",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "home",
    price: 40,
    oldPrice: 50,
    discount: 20,
    stock: 15,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=42",
    badge: "New",
  },
  {
    id: 18,
    name: "Soft Cotton Bedsheet",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "home",
    price: 70,
    oldPrice: 90,
    discount: 22,
    stock: 12,
    rating: 4.6,
    image: "https://picsum.photos/300/200?random=43",
  },
  {
    id: 19,
    name: "Wall Art Painting",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "home",
    price: 120,
    oldPrice: 150,
    discount: 20,
    stock: 7,
    rating: 4.4,
    image: "https://picsum.photos/300/200?random=44",
  },
  {
    id: 20,
    name: "Luxury Sofa Cover",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "home",
    price: 60,
    oldPrice: 75,
    discount: 15,
    stock: 20,
    rating: 4.2,
    image: "https://picsum.photos/300/200?random=45",
  },
  {
    id: 40,
    name: "Kitchen Knife Set",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "home",
    price: 95,
    oldPrice: 120,
    discount: 21,
    stock: 12,
    rating: 4.7,
    image: "https://picsum.photos/300/200?random=46",
    badge: "Sharp",
  },
  {
    id: 41,
    name: "Decorative Vase",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "home",
    price: 45,
    oldPrice: 60,
    discount: 25,
    stock: 18,
    rating: 4.3,
    image: "https://picsum.photos/300/200?random=47",
  },
  {
    id: 42,
    name: "Coffee Maker",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "home",
    price: 180,
    oldPrice: 220,
    discount: 18,
    stock: 9,
    rating: 4.6,
    image: "https://picsum.photos/300/200?random=48",
  },

  // 💄 Beauty (8 products)
  {
    id: 21,
    name: "Matte Lipstick Set",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "beauty",
    price: 35,
    oldPrice: 50,
    discount: 30,
    stock: 25,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=51",
    badge: "Hot",
  },
  {
    id: 22,
    name: "Face Serum (30ml)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "beauty",
    price: 60,
    oldPrice: 75,
    discount: 20,
    stock: 15,
    rating: 4.7,
    image: "https://picsum.photos/300/200?random=52",
  },
  {
    id: 23,
    name: "Moisturizing Cream",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "beauty",
    price: 55,
    oldPrice: 70,
    discount: 21,
    stock: 18,
    rating: 4.4,
    image: "https://picsum.photos/300/200?random=53",
  },
  {
    id: 24,
    name: "Eyeliner Pen",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "beauty",
    price: 25,
    oldPrice: 35,
    discount: 28,
    stock: 22,
    rating: 4.3,
    image: "https://picsum.photos/300/200?random=54",
  },
  {
    id: 25,
    name: "Perfume Spray (50ml)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "beauty",
    price: 75,
    oldPrice: 95,
    discount: 21,
    stock: 10,
    rating: 4.6,
    image: "https://picsum.photos/300/200?random=55",
  },
  {
    id: 43,
    name: "Nail Polish Set",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "beauty",
    price: 30,
    oldPrice: 40,
    discount: 25,
    stock: 20,
    rating: 4.2,
    image: "https://picsum.photos/300/200?random=56",
  },
  {
    id: 44,
    name: "Face Mask Pack (5 pcs)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "beauty",
    price: 20,
    oldPrice: 30,
    discount: 33,
    stock: 25,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=57",
    badge: "Relaxing",
  },
  {
    id: 45,
    name: "Hair Dryer",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "beauty",
    price: 65,
    oldPrice: 85,
    discount: 24,
    stock: 14,
    rating: 4.4,
    image: "https://picsum.photos/300/200?random=58",
  },

  // ⚽ Sports (8 products)
  {
    id: 26,
    name: "Football Size 5",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "sports",
    price: 40,
    oldPrice: 50,
    discount: 20,
    stock: 15,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=61",
  },
  {
    id: 27,
    name: "Cricket Bat",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "sports",
    price: 90,
    oldPrice: 110,
    discount: 18,
    stock: 10,
    rating: 4.4,
    image: "https://picsum.photos/300/200?random=62",
  },
  {
    id: 28,
    name: "Tennis Racket",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "sports",
    price: 120,
    oldPrice: 150,
    discount: 20,
    stock: 12,
    rating: 4.6,
    image: "https://picsum.photos/300/200?random=63",
  },
  {
    id: 29,
    name: "Yoga Mat",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "sports",
    price: 35,
    oldPrice: 45,
    discount: 22,
    stock: 20,
    rating: 4.7,
    image: "https://picsum.photos/300/200?random=64",
    badge: "Best Seller",
  },
  {
    id: 30,
    name: "Basketball",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "sports",
    price: 50,
    oldPrice: 65,
    discount: 23,
    stock: 18,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=65",
  },
  {
    id: 46,
    name: "Running Shoes",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "sports",
    price: 85,
    oldPrice: 110,
    discount: 23,
    stock: 16,
    rating: 4.6,
    image: "https://picsum.photos/300/200?random=66",
  },
  {
    id: 47,
    name: "Dumbbell Set (10kg)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "sports",
    price: 70,
    oldPrice: 90,
    discount: 22,
    stock: 12,
    rating: 4.4,
    image: "https://picsum.photos/300/200?random=67",
  },
  {
    id: 48,
    name: "Cycling Helmet",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "sports",
    price: 40,
    oldPrice: 55,
    discount: 27,
    stock: 20,
    rating: 4.5,
    image: "https://picsum.photos/300/200?random=68",
    badge: "Safety",
  },
];
