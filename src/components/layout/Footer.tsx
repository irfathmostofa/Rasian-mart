import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-8">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Shop */}
        <div>
          <h3 className="text-white font-semibold mb-2">Shop</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/">Groceries</Link>
            </li>
            <li>
              <Link href="/">Electronics</Link>
            </li>
            <li>
              <Link href="/">Fashion</Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-white font-semibold mb-2">Support</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/">Contact Us</Link>
            </li>
            <li>
              <Link href="/">FAQs</Link>
            </li>
            <li>
              <Link href="/">Returns</Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white font-semibold mb-2">Company</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/">About Us</Link>
            </li>
            <li>
              <Link href="/">Careers</Link>
            </li>
            <li>
              <Link href="/">Privacy Policy</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm"
            />
            <button className="bg-primary text-white rounded-lg px-3 py-2 text-sm hover:bg-primary/90">
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Rasian Mart. All rights reserved.
      </div>
    </footer>
  );
}
