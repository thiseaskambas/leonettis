'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function buildPageHref(
  searchParams: URLSearchParams,
  pageNum: number
): string {
  const next = new URLSearchParams(searchParams.toString());
  if (pageNum <= 1) next.delete('page');
  else next.set('page', String(pageNum));
  const q = next.toString();
  return q ? `/admin?${q}` : '/admin';
}

function visiblePageNumbers(
  currentPage: number,
  totalPages: number
): Array<number | 'ellipsis'> {
  if (totalPages <= 1) return [];

  const set = new Set<number>();
  set.add(1);
  set.add(totalPages);
  for (let d = -2; d <= 2; d++) {
    const p = currentPage + d;
    if (p >= 1 && p <= totalPages) set.add(p);
  }

  const sorted = [...set].sort((a, b) => a - b);
  const out: Array<number | 'ellipsis'> = [];
  for (let i = 0; i < sorted.length; i++) {
    const p = sorted[i]!;
    if (i > 0 && p - sorted[i - 1]! > 1) out.push('ellipsis');
    out.push(p);
  }
  return out;
}

export default function AdminPagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const slots = visiblePageNumbers(currentPage, totalPages);
  const linkClass =
    'inline-flex min-w-8 items-center justify-center rounded border border-gray-200 px-2 py-1 text-sm hover:bg-gray-50';
  const currentClass =
    'inline-flex min-w-8 items-center justify-center rounded border border-gray-900 bg-gray-900 px-2 py-1 text-sm text-white';

  return (
    <nav className="flex flex-wrap items-center gap-1" aria-label="Pagination">
      {slots.map((item, idx) =>
        item === 'ellipsis' ? (
          <span
            key={`e-${idx}`}
            className="px-1 text-sm text-gray-400"
            aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildPageHref(searchParams, item)}
            className={item === currentPage ? currentClass : linkClass}
            aria-current={item === currentPage ? 'page' : undefined}>
            {item}
          </Link>
        )
      )}
    </nav>
  );
}
