import React from 'react';
import Image from 'next/image';

interface DeveloperCardProps {
  developer: {
    id: string;
    name: string;
    logo_url: string | null;
    description: string | null;
    phone?: string | null;
  };
}

export default function DeveloperCard({ developer }: DeveloperCardProps) {
  const logoUrl = developer.logo_url
    ? developer.logo_url
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(developer.name)}&background=044ca3&color=fff&size=256`;

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center text-center">
      <div className="relative w-20 h-20 mb-4">
        <Image
          src={logoUrl}
          alt={developer.name}
          fill
          className="rounded-full object-cover border border-gray-200 bg-gray-100"
          loading="lazy"
        />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">{developer.name}</h3>
      {developer.description && (
        <div className="text-sm text-gray-700 mb-4 line-clamp-3">{developer.description}</div>
      )}
      {developer.phone && (
        <a
          href={`tel:${developer.phone}`}
          className="px-4 py-2 bg-[#044ca3] text-white rounded-md hover:bg-[#033b7d] transition-colors text-xs font-semibold shadow mt-2"
        >
          Contact
        </a>
      )}
    </div>
  );
} 