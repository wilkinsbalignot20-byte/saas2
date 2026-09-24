 // constants/media.ts
import { getCldVideoUrl } from 'next-cloudinary';

export const LOCAL_VIDEOS = {
  wear: "/wear.mp4",
  coffee: "/coffee.mp4",
  tindahan: "/tindahan.mp4",
  shoes2: "/shoes2.mp4"
};

export const CLOUDINARY_VIDEOS = {
  wear: getCldVideoUrl({ src: 'store/wear', format: 'auto', quality: 'auto', width: 400, crop: 'fill' }),
  coffee: getCldVideoUrl({ src: 'store/coffee', format: 'auto', quality: 'auto', width: 400, crop: 'fill' }),
  tindahan: getCldVideoUrl({ src: 'store/tindahan', format: 'auto', quality: 'auto', width: 400, crop: 'fill' }),
  shoes2: getCldVideoUrl({ src: 'store/Shoes2', format: 'auto', quality: 'auto' }) // Malaking 'S' gaya ng nasa dashboard mo
};

export const ACTIVE_VIDEOS = LOCAL_VIDEOS; 
