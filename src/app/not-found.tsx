import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col flex-1 justify-center items-center gap-12">
      <h2 className="text-8xl font-bold">404</h2>
      <p className="text-2xl font-medium">
        The requested resource could not be found or does not exist.
      </p>
      <Link className="text-xl text-sky-600 hover:underline" href="/">
        Return Home
      </Link>
    </div>
  );
}
