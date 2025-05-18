'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface FeaturedProjectCardProps {
  id: string;
  name: string;
  city: string;
  locality: string;
  starting_price: number;
  image_url: string;
  status: string;
  formattedPrice?: string;
}

const getStatusColor = (status: string | undefined) => {
  if (!status) return 'bg-gray-500';
  
  switch (status.toLowerCase()) {
    case 'upcoming':
      return 'bg-yellow-500';
    case 'ongoing':
      return 'bg-green-500';
    case 'completed':
      return 'bg-blue-500';
    default:
      return 'bg-gray-500';
  }
};

export default function FeaturedProjectCard({
  id,
  name,
  city,
  locality,
  starting_price,
  image_url,
  status,
  formattedPrice
}: FeaturedProjectCardProps) {
  return (
    <Link href={`/project/${id}`} className="block group">
      <div className="relative h-64 rounded-lg overflow-hidden">
        <Image
          src={image_url || '/placeholder-project.jpg'}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className={`absolute top-2 right-2 ${getStatusColor(status)} text-white px-2 py-1 rounded text-xs font-medium`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
      <div className="mt-3">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">{locality}, {city}</p>
        <p className="text-blue-600 font-semibold mt-2">
          {formattedPrice || `₹${(starting_price / 100000).toFixed(2)} L`}
        </p>
      </div>
    </Link>
  );
} 