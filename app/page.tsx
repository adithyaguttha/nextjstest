import SearchBox from './components/SearchBox';
import FeaturedProperty from './components/FeaturedProperty';
import DeveloperCard from './components/DeveloperCard';
import Footer from './components/Footer';

// Sample data for featured properties
const featuredProperties = [
  {
    id: '1',
    title: 'Luxury Villa in Bandra',
    location: 'Bandra West, Mumbai',
    price: 25000000,
    bedrooms: 4,
    bathrooms: 4,
    area: 2500,
    imageUrl: '/sample-property.jpg'
  },
  {
    id: '2',
    title: 'Modern Apartment in Powai',
    location: 'Powai, Mumbai',
    price: 15000000,
    bedrooms: 3,
    bathrooms: 2,
    area: 1800,
    imageUrl: '/sample-property.jpg'
  },
  {
    id: '3',
    title: 'Sea View Penthouse',
    location: 'Worli, Mumbai',
    price: 45000000,
    bedrooms: 5,
    bathrooms: 5,
    area: 4000,
    imageUrl: '/sample-property.jpg'
  }
];

// Sample data for developers
const developers = [
  {
    id: '1',
    name: 'Lodha Group',
    logo: '/sample-property.jpg',
    projectCount: 50,
    rating: 4.5,
    description: 'Leading real estate developer with a legacy of excellence in luxury housing.'
  },
  {
    id: '2',
    name: 'Godrej Properties',
    logo: '/sample-property.jpg',
    projectCount: 45,
    rating: 4.3,
    description: 'Trusted name in real estate, known for quality construction and innovation.'
  },
  {
    id: '3',
    name: 'Hiranandani Group',
    logo: '/sample-property.jpg',
    projectCount: 35,
    rating: 4.4,
    description: 'Pioneers in developing integrated townships and luxury residential projects.'
  }
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[360px] flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url("/assets/hero.png")',
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
            Find Your Dream Property
          </h1>
          <p className="text-lg sm:text-xl text-white mb-6 sm:mb-8 max-w-2xl mx-auto">
            Discover the perfect home across India's top cities
          </p>
          <div className="hero-search-container w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl mx-auto">
          <SearchBox />
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Featured Properties</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {featuredProperties.map((property) => (
            <FeaturedProperty key={property.id} property={property} />
          ))}
        </div>
      </section>

      {/* Popular Developers Section */}
      <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Popular Developers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {developers.map((developer) => (
              <DeveloperCard key={developer.id} developer={developer} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
