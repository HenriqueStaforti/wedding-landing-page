import yaml from "yaml";
import wishlistSource from "./wishlist.yml?raw";

export interface GiftItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  price?: string;
  priceInCents?: number;
  image?: string;
  imageAlt?: string;
  priority?: "high" | "medium" | "low";
}

export interface WishlistContent {
  eyebrow: string;
  title: string;
  description: string;
  gifts: GiftItem[];
}

export interface WishlistData {
  wishlist: WishlistContent;
}

const parsedWishlistData = yaml.parse(wishlistSource) as WishlistData;

export function getWishlistData(): WishlistContent {
  return parsedWishlistData.wishlist;
}
