 /**
 * Ligtas na kukuha ng Cloudinary public_id mula sa isang buong URL string,
 * kahit pa ito ay may nested folders (hal. products/plzbsf54mxih6lypvubl).
 */
export function getCloudinaryPublicId(url: string): string | null {
  if (!url) return null;

  try {
    // Siguraduhing malinis ang string kung sakaling may kasamang quotes o brackets mula sa array string serialization
    const cleanUrl = url.replace(/["'[\]]/g, "").trim();
    if (!cleanUrl.includes("res.cloudinary.com")) return null;

    // Gamitin ang standard URL framework para makuha ang pathname part (e.g., /nm0mejoe/image/upload/v1234/products/file.png)
    const parsedUrl = new URL(cleanUrl);
    const pathParts = parsedUrl.pathname.split("/");

    // Hahanapin natin kung nasaan ang '/upload/' segment sa URL pathname structure
    const uploadIndex = pathParts.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex === pathParts.length - 1) return null;

    // Kunin ang lahat ng parts pagkatapos ng 'upload/' segment
    let remainingParts = pathParts.slice(uploadIndex + 1);

    // Kung ang unang kasunod na segment ay isang version string (nagsisimula sa 'v' at sinusundan ng mga numero, e.g., v1791116388)
    if (remainingParts[0] && /^v\d+$/.test(remainingParts[0])) {
      remainingParts = remainingParts.slice(1); // Alisin ang version segment
    }

    // Pagsamahin ulit ang mga natitirang folder paths at file name
    const fullPathWithExtension = remainingParts.join("/");

    // Tanggalin ang file extension sa pinaka-dulo (e.g., .png, .jpg)
    const lastDotIndex = fullPathWithExtension.lastIndexOf(".");
    if (lastDotIndex === -1) return fullPathWithExtension;

    return fullPathWithExtension.substring(0, lastDotIndex);
  } catch (error) {
    console.error("[CLOUDINARY_URL_PARSING_ERROR]", error);
    return null;
  }
}
