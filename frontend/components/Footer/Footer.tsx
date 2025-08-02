export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className=" text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} SimuPOS - 0702629361. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
