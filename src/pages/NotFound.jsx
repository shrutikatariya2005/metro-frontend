import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1600px] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-10 3xl:px-16">
      <p className="font-display text-hero font-800 text-ink/15">404</p>
      <h1 className="mt-2 font-display text-h1 font-800 text-ink">
        This station doesn't exist on our line.
      </h1>
      <p className="mt-3 max-w-md text-body text-slate">
        The page you're looking for isn't part of the Metro Booking System.
      </p>
      <Link
        to="/"
        className="mt-8 rounded-sm bg-ink px-6 py-3 font-semibold text-platform hover:bg-ink-soft"
      >
        Back to home
      </Link>
    </section>
  );
}