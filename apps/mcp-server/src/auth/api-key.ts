import bcrypt from "bcryptjs";
import { prisma } from "@sportshire/db";

export async function validateApiKey(apiKey: string | undefined): Promise<boolean> {
  if (!apiKey?.startsWith("sh_")) return false;

  const prefix = apiKey.slice(0, 8);
  const keys = await prisma.apiKey.findMany({
    where: { keyPrefix: prefix },
    take: 5,
  });

  for (const key of keys) {
    if (await bcrypt.compare(apiKey, key.keyHash)) {
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      });
      return true;
    }
  }

  return false;
}
