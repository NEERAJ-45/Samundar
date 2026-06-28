import { notFound } from 'next/navigation';
import { getBookBySlug } from '@/data/books';
import { BookReaderClient } from './reader-client';

export default async function BookReaderPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = getBookBySlug(slug);

  if (!book) notFound();

  return <BookReaderClient book={book} />;
}
