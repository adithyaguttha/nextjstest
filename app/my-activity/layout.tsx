'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Heart, Eye, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  {
    name: 'Saved Projects',
    href: '/my-activity/saved',
    icon: Heart,
  },
  {
    name: 'Seen Projects',
    href: '/my-activity/seen',
    icon: Eye,
  },
  {
    name: 'Enquiries',
    href: '/my-activity/enquiries',
    icon: MessageSquare,
  },
];

export default function MyActivityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">My Activity</h2>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        'flex items-center px-3 py-2 text-sm font-medium rounded-md',
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'mr-3 h-5 w-5',
                          isActive ? 'text-blue-700' : 'text-gray-400'
                        )}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 