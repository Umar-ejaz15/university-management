import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const f = createUploadthing();

async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) throw new Error('Unauthorized');
  const payload = await verifyToken(token);
  if (!payload) throw new Error('Unauthorized');
  return payload;
}

export const ourFileRouter = {
  profileImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
    .middleware(async () => {
      const user = await auth();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, userId: metadata.userId };
    }),

  contentImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(async () => {
      const user = await auth();
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.ufsUrl, userId: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
