export default function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-8 text-small text-slate sm:px-6 lg:px-10 3xl:px-16">
        <p>© {new Date().getFullYear()} Metro Booking System — academic project.</p>
      </div>
    </footer>
  );
}