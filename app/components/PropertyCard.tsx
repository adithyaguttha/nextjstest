'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface PropertyCardProps {
  id: string;
  title: string;
  price: number;
  location: string;
  imageUrl: string;
  description: string;
  developer_name: string;
  property_type: string;
  status: string;
}

export default function PropertyCard({
  id,
  title,
  price,
  location,
  imageUrl,
  description,
  developer_name,
  property_type,
  status,
}: PropertyCardProps) {
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);

  const handleWhatsAppClick = () => {
    const message = `Hi, I'm interested in ${title} at ${location}. Can you provide more information?`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="relative md:w-1/3 h-64 md:h-auto group">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-sm font-medium">
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-600 text-sm mb-2">{location}</p>
                <p className="text-sm text-gray-500 mb-2">By {developer_name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{formattedPrice}</p>
                <p className="text-sm text-gray-500 capitalize">{property_type}</p>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-6 line-clamp-2">{description}</p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`/project/${id}`}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Details
              </Link>
              <button
                onClick={handleWhatsAppClick}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
              <Link
                href={`/contact?project=${id}`}
                className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}