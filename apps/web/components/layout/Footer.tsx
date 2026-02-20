import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white/80">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <h3 className="text-base font-semibold text-ink-900">Escape Review</h3>
          <p className="mt-2 text-sm text-ink-500">
            지역별 방탈출 매장 탐색, 테마 후기, 북마크를 한 곳에서 관리하세요.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-900">바로가기</h4>
          <ul className="mt-2 space-y-2 text-sm text-ink-600">
            <li>
              <Link href="/explore" className="hover:text-brand-600">
                매장 탐색
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-brand-600">
                검색
              </Link>
            </li>
            <li>
              <Link href="/profile/bookmarks" className="hover:text-brand-600">
                내 북마크
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-ink-900">문의</h4>
          <p className="mt-2 text-sm text-ink-600">support@escape-review.local</p>
          <p className="text-sm text-ink-400">© {new Date().getFullYear()} Escape Review</p>
        </div>
      </div>
    </footer>
  );
}
