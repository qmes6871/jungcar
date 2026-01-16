'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import CarCard from '@/components/CarCard';

// Dummy data for cars
const allCars = [
  {
    id: 1,
    brand: 'Hyundai',
    model: 'Sonata DN8',
    year: 2023,
    mileage: 15000,
    price: 28500,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    images: ['https://images.unsplash.com/photo-1590656371803-0ae2ae004989?w=800'],
  },
  {
    id: 2,
    brand: 'Kia',
    model: 'K5 DL3',
    year: 2022,
    mileage: 28000,
    price: 24500,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    images: ['https://images.unsplash.com/photo-1688893287874-ac7fbd686c24?w=800'],
  },
  {
    id: 3,
    brand: 'Genesis',
    model: 'G80 RG3',
    year: 2023,
    mileage: 12000,
    price: 52000,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    images: ['https://images.unsplash.com/photo-1714348938045-0c74379cd4d9?w=800'],
  },
  {
    id: 4,
    brand: 'Hyundai',
    model: 'Tucson NX4',
    year: 2022,
    mileage: 32000,
    price: 31000,
    fuel: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    images: ['https://images.unsplash.com/photo-1616627091698-50d033ce0980?w=800'],
  },
  {
    id: 5,
    brand: 'Kia',
    model: 'Sorento MQ4',
    year: 2023,
    mileage: 18000,
    price: 38000,
    fuel: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    images: ['https://images.unsplash.com/photo-1688893287848-a218df183f36?w=800'],
  },
  {
    id: 6,
    brand: 'Hyundai',
    model: 'Palisade LX2',
    year: 2022,
    mileage: 25000,
    price: 45000,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'SUV',
    images: ['https://images.unsplash.com/photo-1575764679429-57558f46f259?w=800'],
  },
  {
    id: 7,
    brand: 'Genesis',
    model: 'GV80',
    year: 2023,
    mileage: 8000,
    price: 65000,
    fuel: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'SUV',
    images: ['https://images.unsplash.com/photo-1714348938323-534552cbfad9?w=800'],
  },
  {
    id: 8,
    brand: 'Kia',
    model: 'Carnival KA4',
    year: 2022,
    mileage: 35000,
    price: 42000,
    fuel: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'Van',
    images: ['https://images.unsplash.com/photo-1592805723127-004b174a1798?w=800'],
  },
  {
    id: 9,
    brand: 'Hyundai',
    model: 'Staria',
    year: 2023,
    mileage: 12000,
    price: 48000,
    fuel: 'Diesel',
    transmission: 'Automatic',
    bodyType: 'Van',
    images: ['https://images.unsplash.com/photo-1665564593840-f20a27db050a?w=800'],
  },
  {
    id: 10,
    brand: 'Hyundai',
    model: 'Avante CN7',
    year: 2021,
    mileage: 45000,
    price: 18000,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    images: ['https://images.unsplash.com/photo-1665564591116-19a1d2cdb0cc?w=800'],
  },
  {
    id: 11,
    brand: 'Kia',
    model: 'Sportage NQ5',
    year: 2023,
    mileage: 10000,
    price: 32000,
    fuel: 'Hybrid',
    transmission: 'Automatic',
    bodyType: 'SUV',
    images: ['https://images.unsplash.com/photo-1710594022719-a37944dc12ae?w=800'],
  },
  {
    id: 12,
    brand: 'Genesis',
    model: 'G70',
    year: 2022,
    mileage: 22000,
    price: 42000,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    images: ['https://images.unsplash.com/photo-1714348938517-ebe870af89c1?w=800'],
  },
];

const brands = ['All', 'Hyundai', 'Kia', 'Genesis'];
const bodyTypes = ['All', 'Sedan', 'SUV', 'Van', 'Truck'];
const fuelTypes = ['All', 'Gasoline', 'Diesel', 'Hybrid', 'Electric'];
const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under $20,000', min: 0, max: 20000 },
  { label: '$20,000 - $30,000', min: 20000, max: 30000 },
  { label: '$30,000 - $50,000', min: 30000, max: 50000 },
  { label: 'Over $50,000', min: 50000, max: Infinity },
];
const sortOptions = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Mileage: Low to High', value: 'mileage-asc' },
];

export default function CarsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedBodyType, setSelectedBodyType] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  const filteredCars = useMemo(() => {
    let result = [...allCars];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (car) =>
          car.brand.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query)
      );
    }

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter((car) => car.brand === selectedBrand);
    }

    // Body type filter
    if (selectedBodyType !== 'All') {
      result = result.filter((car) => car.bodyType === selectedBodyType);
    }

    // Fuel filter
    if (selectedFuel !== 'All') {
      result = result.filter((car) => car.fuel === selectedFuel);
    }

    // Price range filter
    const priceRange = priceRanges[selectedPriceRange];
    result = result.filter(
      (car) => car.price >= priceRange.min && car.price < priceRange.max
    );

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'mileage-asc':
        result.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.year - a.year);
    }

    return result;
  }, [searchQuery, selectedBrand, selectedBodyType, selectedFuel, selectedPriceRange, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('All');
    setSelectedBodyType('All');
    setSelectedFuel('All');
    setSelectedPriceRange(0);
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedBrand !== 'All' ||
    selectedBodyType !== 'All' ||
    selectedFuel !== 'All' ||
    selectedPriceRange !== 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-blue-700 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              Browse Our Inventory
            </h1>
            <p className="mt-2 text-blue-100">
              {filteredCars.length} vehicles available
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="mt-8 flex justify-center">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by brand or model..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-white py-3 pl-12 pr-4 text-gray-900 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 rounded-xl sm:rounded-2xl bg-card border-2 border-primary/20 shadow-lg shadow-primary/5 p-4 sm:p-6"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-primary text-white">
              <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-foreground">Filter Vehicles</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Find your perfect car</p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 rounded-lg bg-red-100 px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium text-red-600 hover:bg-red-200 transition-colors"
              >
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                Clear
              </button>
            )}
          </div>

          {/* Filters grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {/* Brand */}
            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-foreground">
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full rounded-lg sm:rounded-xl border-2 border-border bg-background px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand === 'All' ? 'All Brands' : brand}
                  </option>
                ))}
              </select>
            </div>

            {/* Body Type */}
            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-foreground">
                Body Type
              </label>
              <select
                value={selectedBodyType}
                onChange={(e) => setSelectedBodyType(e.target.value)}
                className="w-full rounded-lg sm:rounded-xl border-2 border-border bg-background px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {bodyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'All' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>

            {/* Fuel */}
            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-foreground">
                Fuel Type
              </label>
              <select
                value={selectedFuel}
                onChange={(e) => setSelectedFuel(e.target.value)}
                className="w-full rounded-lg sm:rounded-xl border-2 border-border bg-background px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {fuelTypes.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel === 'All' ? 'All Fuels' : fuel}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-foreground">
                Price Range
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                className="w-full rounded-lg sm:rounded-xl border-2 border-border bg-background px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {priceRanges.map((range, index) => (
                  <option key={index} value={index}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="col-span-2 lg:col-span-1">
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-semibold text-foreground">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-lg sm:rounded-xl border-2 border-border bg-background px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Active:</span>
                {selectedBrand !== 'All' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-primary">
                    {selectedBrand}
                    <button onClick={() => setSelectedBrand('All')} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedBodyType !== 'All' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-primary">
                    {selectedBodyType}
                    <button onClick={() => setSelectedBodyType('All')} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedFuel !== 'All' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-primary">
                    {selectedFuel}
                    <button onClick={() => setSelectedFuel('All')} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedPriceRange !== 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-primary">
                    {priceRanges[selectedPriceRange].label}
                    <button onClick={() => setSelectedPriceRange(0)} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium text-primary">
                    "{searchQuery}"
                    <button onClick={() => setSearchQuery('')} className="hover:text-primary/70">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Results */}
        {filteredCars.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCars.map((car) => (
              <CarCard key={car.id} {...car} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-foreground">
              No vehicles found
            </p>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-xl bg-primary px-6 py-2 text-sm font-medium text-white"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
