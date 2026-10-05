import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-1 flex-col justify-center px-5 py-24">
      <p className="text-sm font-medium text-brand">404</p>
      <h1 className="mt-2 text-3xl font-semibold">That page is not available</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        The module may be switched off, or the page does not exist.
      </p>
      <Link href="/" className="mt-6 text-sm font-medium text-brand">
        Back home
      </Link>
    </div>
  );
}
