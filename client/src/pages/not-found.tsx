import { Link } from "wouter";
import { Home, ArrowLeft, Phone, Mail, Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fffaf3] flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          {/* 404 Graphic */}
          <div className="mb-8">
            <h1 className="text-8xl md:text-9xl font-bold text-primary/20">404</h1>
          </div>

          {/* Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Page not found
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Sorry, we couldn't find the page you're looking for. It may have been moved or no longer exists.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              <Home className="w-5 h-5" />
              Go to Homepage
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-primary hover:text-primary text-gray-700 px-8 py-4 rounded-xl font-semibold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Go Back
            </button>
          </div>

          {/* Helpful Links */}
          <div className="bg-[#f5f0e8] rounded-2xl p-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Maybe you were looking for:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <Link
                href="/quote"
                className="p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900">Get a Quote</p>
                <p className="text-sm text-gray-500">Free instant estimate</p>
              </Link>
              <Link
                href="/products"
                className="p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900">Products</p>
                <p className="text-sm text-gray-500">Insurance options</p>
              </Link>
              <Link
                href="/about"
                className="p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900">About Us</p>
                <p className="text-sm text-gray-500">Our story</p>
              </Link>
              <Link
                href="/contact"
                className="p-4 bg-white rounded-xl hover:shadow-md transition-shadow"
              >
                <p className="font-semibold text-gray-900">Contact</p>
                <p className="text-sm text-gray-500">Get in touch</p>
              </Link>
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">Still need help? Contact us:</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="tel:+16307780800"
                className="inline-flex items-center justify-center gap-2 text-primary hover:text-violet-500 transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="font-medium">(630) 778-0800</span>
              </a>
              <a
                href="mailto:contact@heritagels.org"
                className="inline-flex items-center justify-center gap-2 text-primary hover:text-violet-500 transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span className="font-medium">contact@heritagels.org</span>
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
