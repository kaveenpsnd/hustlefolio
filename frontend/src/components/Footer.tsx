export default function Footer() {
  return (
    <footer className="bg-black text-white py-3 sm:py-4 w-full mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="text-center space-y-1">
          <p className="text-xs sm:text-sm text-white font-medium">
            © {new Date().getFullYear()} hustlefolio.live All Rights Reserved
          </p>
          <p className="text-xs sm:text-sm">
            <a
              href="https://github.com/kaveenpsnd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white no-underline hover:text-orange-400"
            >
              Shipped by Kaveen
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
