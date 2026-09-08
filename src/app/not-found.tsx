import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-start justify-center px-5 py-16 sm:px-10 lg:px-14">
      <p className="font-mono text-xs tracking-[0.18em] text-studio">404</p>
      <h1 className="mt-3 font-serif text-4xl font-medium">
        講義が見つかりません
      </h1>
      <Link href="/" className="btn btn-primary mt-8">
        講座一覧へ戻る
      </Link>
    </div>
  );
}
