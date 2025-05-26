import Image from 'next/image';

type Developer = {
  id: string;
  name: string;
  logo_url: string | null;
  description: string;
};

type DeveloperCardProps = {
  developer: Developer;
};

export default function DeveloperCard({ developer }: DeveloperCardProps) {
  const logoUrl = developer.logo_url
    ? developer.logo_url
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(developer.name)}&background=044ca3&color=fff&size=256`;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow p-4 sm:p-6">
      <div className="flex items-center">
        <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden">
          <Image
            src={logoUrl}
            alt={developer.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="ml-3 sm:ml-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{developer.name}</h3>
        </div>
      </div>
      <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 line-clamp-2">{developer.description}</p>
    </div>
  );
}