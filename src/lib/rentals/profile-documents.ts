import { Prisma, type PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/db";
import { deleteDocument } from "@/lib/storage/documents";

type DocumentDb = Prisma.TransactionClient | PrismaClient;

export type SavedCustomerDocument = {
  configId: string;
  typeName: string;
  fileUrl: string;
  fileKey: string;
  fileDriver: "local" | "cloudinary";
  fileResource: "image" | "raw";
  number: string;
  issueDate: string;
  expiryDate: string;
};

export type ProfileDocumentInput = {
  configId: string;
  typeName: string;
  fileUrl: string;
  fileKey: string;
  fileDriver: string;
  fileResource: string;
  number: string;
  issueDate: Date | null;
  expiryDate: Date | null;
};

export function documentDateInput(value: Date | null | undefined) {
  if (!value) return "";
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function copyBookingDocumentsToProfile(userId: string) {
  const saved = await prisma.customerDocument.findMany({
    where: { userId },
    select: { configId: true },
  });
  const have = new Set(saved.map((row) => row.configId));
  const uploaded = await prisma.rentalBookingDocument.findMany({
    where: {
      booking: { userId },
      configId: { not: null },
      fileUrl: { not: "" },
      status: { not: "rejected" },
    },
    orderBy: { createdAt: "desc" },
  });
  const fresh = [];
  for (const document of uploaded) {
    if (!document.configId || have.has(document.configId)) continue;
    have.add(document.configId);
    fresh.push(document);
  }
  if (fresh.length === 0) return;
  await prisma.customerDocument.createMany({
    data: fresh.map((document) => ({
      userId,
      configId: document.configId!,
      typeName: document.typeName,
      fileUrl: document.fileUrl,
      fileKey: document.fileKey,
      fileDriver: document.fileDriver,
      fileResource: document.fileResource,
      number: document.number,
      issueDate: document.issueDate,
      expiryDate: document.expiryDate,
    })),
  });
}

export async function listProfileDocuments(userId: string): Promise<SavedCustomerDocument[]> {
  await copyBookingDocumentsToProfile(userId);
  const rows = await prisma.customerDocument.findMany({
    where: { userId },
    orderBy: { typeName: "asc" },
  });
  return rows.map((row) => ({
    configId: row.configId,
    typeName: row.typeName,
    fileUrl: row.fileUrl,
    fileKey: row.fileKey,
    fileDriver: row.fileDriver === "cloudinary" ? "cloudinary" : "local",
    fileResource: row.fileResource === "raw" ? "raw" : "image",
    number: row.number,
    issueDate: documentDateInput(row.issueDate),
    expiryDate: documentDateInput(row.expiryDate),
  }));
}

export async function rememberCustomerDocuments(
  db: DocumentDb,
  userId: string,
  rows: ProfileDocumentInput[],
) {
  const stale: { key: string; driver: string; resourceType: string }[] = [];
  for (const row of rows) {
    if (!row.configId || !row.fileUrl || !row.fileKey) continue;
    const previous = await db.customerDocument.findUnique({
      where: { userId_configId: { userId, configId: row.configId } },
    });
    const data = {
      typeName: row.typeName,
      fileUrl: row.fileUrl,
      fileKey: row.fileKey,
      fileDriver: row.fileDriver,
      fileResource: row.fileResource,
      number: row.number,
      issueDate: row.issueDate,
      expiryDate: row.expiryDate,
    };
    await db.customerDocument.upsert({
      where: { userId_configId: { userId, configId: row.configId } },
      create: { userId, configId: row.configId, ...data },
      update: data,
    });
    if (previous?.fileKey && previous.fileKey !== row.fileKey) {
      stale.push({
        key: previous.fileKey,
        driver: previous.fileDriver,
        resourceType: previous.fileResource,
      });
    }
  }
  return stale;
}

export async function releaseUnusedDocumentFiles(
  files: { key: string; driver: string; resourceType: string }[],
) {
  for (const file of files) {
    if (!file.key) continue;
    const [profileUses, bookingUses] = await Promise.all([
      prisma.customerDocument.count({ where: { fileKey: file.key } }),
      prisma.rentalBookingDocument.count({ where: { fileKey: file.key } }),
    ]);
    if (profileUses + bookingUses === 0) await deleteDocument(file);
  }
}
