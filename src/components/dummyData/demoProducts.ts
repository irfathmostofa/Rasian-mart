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
    name: "Free Range Eggs (12 pcs)",
    description:
      "LOREM ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",

    category: "groceries",
    price: 150,
    oldPrice: 180,
    discount: 17,
    stock: 25,
    rating: 4.8,
    image: "https://picsum.photos/300/200?random=15",
    badge: "Organic",
  },
];
export const reviews = [
  {
    id: 1,
    customerName: "Sabbir Ahmed",
    rating: 5,
    title: "Excellent Quality!",
    comment:
      "Absolutely loved this product. The fabric feels premium and the color is exactly as shown in the picture.",
    imageUrls: [
      "https://picsum.photos/100/100?random=5001",
      "https://picsum.photos/100/100?random=5002",
    ],
    helpful: 12,
    createdAt: "2 days ago",
  },
  {
    id: 2,
    customerName: "Nusrat Jahan",
    rating: 4,
    title: "Worth the price",
    comment:
      "The product arrived on time and matches the description. Could be a bit softer, but overall great value.",
    imageUrls: [],
    helpful: 7,
    createdAt: "5 days ago",
  },
];
