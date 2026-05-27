export default function Home() {
  return (
    <div className="flex flex-col min-h-screen"> 
      <main className="flex flex-col items-center text-center px-6 pt-24 pb-20 flex-1">
        <h1>Home page </h1>
      </main>

      <footer className="border-t border-[var(--border)] py-5 text-center text-xs text-[var(--text)]">
        © {new Date().getFullYear()} Scissors. All rights reserved.
      </footer>
    </div>
  );
}