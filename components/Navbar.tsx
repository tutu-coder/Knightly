import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '../lib/useUser';
import LogoutButton from './LogoutButton';

export default function Navbar() {
  const { user, loading } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  // Handle scroll to hide/show navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        // Scrolling down and past 50px - hide navbar
        setShowNav(false);
      } else {
        // Scrolling up - show navbar
        setShowNav(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu and hide navbar when a link is clicked
  const onLinkClick = () => {
    setMenuOpen(false);
    setShowNav(true); // Optional: show navbar on navigation
  };

  return (
    <nav
      className={`bg-gray-900 text-white shadow-md fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
        showNav ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold whitespace-nowrap" onClick={onLinkClick}>
              Knightly
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex md:items-center md:space-x-6 text-sm">
            {loading ? (
              <span className="text-gray-400">Loading...</span>
            ) : user ? (
              <>
                <span className="text-gray-300 truncate max-w-xs">Hi, {user.email}</span>
                <Link
                  href="/upload"
                  className="text-blue-400 hover:underline whitespace-nowrap"
                  onClick={onLinkClick}
                >
                  Upload
                </Link>
                <Link
                  href="/profile"
                  className="text-blue-400 hover:underline whitespace-nowrap"
                  onClick={onLinkClick}
                >
                  Profile
                </Link>
                <div onClick={onLinkClick}>
                  <LogoutButton />
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-blue-400 hover:underline whitespace-nowrap"
                  onClick={onLinkClick}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="text-blue-400 hover:underline whitespace-nowrap"
                  onClick={onLinkClick}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              className="text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 text-sm bg-gray-800">
          {loading ? (
            <span className="block text-gray-400">Loading...</span>
          ) : user ? (
            <>
              <span className="block text-gray-300 truncate max-w-xs py-1">Hi, {user.email}</span>
              <Link
                href="/upload"
                className="block text-blue-400 hover:underline py-1 whitespace-nowrap"
                onClick={onLinkClick}
              >
                Upload
              </Link>
              <Link
                href="/profile"
                className="block text-blue-400 hover:underline py-1 whitespace-nowrap"
                onClick={onLinkClick}
              >
                Profile
              </Link>
              <div onClick={onLinkClick}>
                <LogoutButton />
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="block text-blue-400 hover:underline py-1 whitespace-nowrap"
                onClick={onLinkClick}
              >
                Log In
              </Link>
              <Link
                href="/signup"
                className="block text-blue-400 hover:underline py-1 whitespace-nowrap"
                onClick={onLinkClick}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
