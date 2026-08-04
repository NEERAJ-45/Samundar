import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: '32MB' } })
    .onUploadComplete(async ({ file }) => ({ url: file.url, key: file.key })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
