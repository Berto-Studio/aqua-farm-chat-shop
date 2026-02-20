import { Product } from "@/types/product";

export const getProductPrimaryImageUrl = (product: Partial<Product>): string => {
  if (Array.isArray(product.image_urls) && product.image_urls.length > 0) {
    return product.image_urls[0];
  }

  if (typeof product.image_url === "string" && product.image_url.length > 0) {
    return product.image_url;
  }

  if (typeof product.image === "string" && product.image.length > 0) {
    return product.image;
  }

  return "";
};

export const getProductImageUrls = (product: Partial<Product>): string[] => {
  const media = [
    ...(Array.isArray(product.image_urls) ? product.image_urls : []),
    ...(typeof product.image_url === "string" && product.image_url.length > 0
      ? [product.image_url]
      : []),
  ];

  return [...new Set(media)];
};

export const getProductVideoUrls = (product: Partial<Product>): string[] => {
  if (!Array.isArray(product.video_urls)) return [];
  return [...new Set(product.video_urls.filter(Boolean))];
};
