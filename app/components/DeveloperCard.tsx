import Image from 'next/image';
import Link from 'next/link';

type Developer = {
  id: string;
  name: string;
  logo: string;
  projectCount: number;
  rating: number;
  description: string;
};

type DeveloperCardProps = {
  developer: Developer;
};

export default function DeveloperCard({ developer }: DeveloperCardProps) {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <svg
        key={index}
        className={`w-5 h-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4 sm:p-6">
      <div className="flex items-center">
        <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden">
          <Image
            src={developer.logo}
            alt={developer.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="ml-3 sm:ml-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{developer.name}</h3>
          <div className="flex items-center mt-1">
            {renderStars(developer.rating)}
            <span className="ml-2 text-xs sm:text-sm text-gray-600">{developer.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      
      <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 line-clamp-2">{developer.description}</p>
      
      <div className="mt-4 sm:mt-6 flex items-center justify-between">
        <div className="text-xs sm:text-sm text-gray-500">
          {developer.projectCount} Projects
        </div>
        <Link 
          href={`/developer/${developer.id}`}
          className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}