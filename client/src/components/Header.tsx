import { Search, User, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="text-2xl font-bold text-heritage-primary tracking-tight">
          HERITAGE
        </a>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            Life insurance <ChevronDown className="w-4 h-4" />
          </button>
          <a href="/risk-strategy" className="text-gray-700 hover:text-gray-900">
            Risk Strategy
          </a>
          <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            Wills & Trusts <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            About us <ChevronDown className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-1 text-gray-700 hover:text-gray-900">
            Resources <ChevronDown className="w-4 h-4" />
          </button>
        </nav>

        {/* Right side icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <User className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
}
