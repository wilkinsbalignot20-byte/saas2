// components/dashboard/marketing/campaign/utils.ts

/** Pang-hiwalay ng pangalan at image URL na nakasave sa iisang `name` field */
export const IMAGE_SEPARATOR = "||IMAGE||";

export const bucket = (status: string) => {
  const u = (status || "").toUpperCase();
  return u === "ACTIVE" || u === "UPCOMING" ? u : "ENDED";
};

export const splitCampaignName = (raw: string) => {
  const [name, imageUrl] = raw.split(IMAGE_SEPARATOR);
  return { name, imageUrl: imageUrl as string | undefined };
};

export const joinCampaignName = (name: string, imageUrl?: string) =>
  imageUrl ? `${name}${IMAGE_SEPARATOR}${imageUrl}` : name;