"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  // Don't show navigation on auth pages except for branding
  const isAuthPage = pathname === "/signin" || pathname === "/signup" || 
                     pathname === "/forgot-password" || pathname === "/reset-password";

  if (isAuthPage) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary-600">BrokerwellAI</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">BrokerwellAI</span>
          </Link>
          
          <div className="flex gap-4 items-center">
            {loading ? (
              <div className="animate-pulse flex gap-4">
                <div className="h-10 w-20 bg-gray-200 rounded"></div>
                <div className="h-10 w-20 bg-gray-200 rounded"></div>
              </div>
            ) : user ? (
              <>
                <button 
                  onClick={signOut}
                  className="px-6 py-2 text-gray-600 font-semibold hover:text-gray-700 transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin">
                  <button className="px-6 py-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                    Sign In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                    Create Account
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
