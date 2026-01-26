'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X, Car } from 'lucide-react';
import CarCard from '@/components/CarCard';

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
    color: 'Black',
    drivetrain: 'FWD',
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
    color: 'White',
    drivetrain: 'FWD',
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
    color: 'Black',
    drivetrain: 'AWD',
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
    color: 'Gray',
    drivetrain: 'AWD',
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
    color: 'White',
    drivetrain: 'AWD',
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
    color: 'Black',
    drivetrain: 'AWD',
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
    color: 'Silver',
    drivetrain: 'AWD',
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
    color: 'White',
    drivetrain: 'FWD',
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
    color: 'Gray',
    drivetrain: 'FWD',
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
    color: 'Blue',
    drivetrain: 'FWD',
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
    color: 'Green',
    drivetrain: 'AWD',
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
    color: 'Red',
    drivetrain: 'RWD',
    images: ['https://images.unsplash.com/photo-1714348938517-ebe870af89c1?w=800'],
  },
];

const brands = ['All', 'Hyundai', 'Kia', 'Genesis'];
const bodyTypes = ['All', 'Sedan', 'SUV', 'Van', 'Truck'];
const fuelTypes = ['All', 'Gasoline', 'Diesel', 'Hybrid', 'Electric', 'LPG'];
const transmissions = ['All', 'Automatic', 'Manual'];
const drivetrains = ['All', 'FWD', 'RWD', 'AWD'];
const colors = ['All', 'Black', 'White', 'Gray', 'Silver', 'Blue', 'Red', 'Green'];
const yearOptions = ['All', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
const mileageRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under 10,000 km', min: 0, max: 10000 },
  { label: '10,000 - 30,000 km', min: 10000, max: 30000 },
  { label: '30,000 - 50,000 km', min: 30000, max: 50000 },
  { label: '50,000 - 100,000 km', min: 50000, max: 100000 },
  { label: 'Over 100,000 km', min: 100000, max: Infinity },
];
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
  { label: 'Year: Newest', value: 'year-desc' },
  { label: 'Year: Oldest', value: 'year-asc' },
];

export default function CarsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedBodyType, setSelectedBodyType] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedTransmission, setSelectedTransmission] = useState('All');
  const [selectedDrivetrain, setSelectedDrivetrain] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMileageRange, setSelectedMileageRange] = useState(0);
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredCars = useMemo(() => {
    let result = [...allCars];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (car) =>
          car.brand.toLowerCase().includes(query) ||
          car.model.toLowerCase().includes(query)
      );
    }

    if (selectedBrand !== 'All') {
      result = result.filter((car) => car.brand === selectedBrand);
    }
    if (selectedBodyType !== 'All') {
      result = result.filter((car) => car.bodyType === selectedBodyType);
    }
    if (selectedFuel !== 'All') {
      result = result.filter((car) => car.fuel === selectedFuel);
    }
    if (selectedTransmission !== 'All') {
      result = result.filter((car) => car.transmission === selectedTransmission);
    }
    if (selectedDrivetrain !== 'All') {
      result = result.filter((car) => car.drivetrain === selectedDrivetrain);
    }
    if (selectedColor !== 'All') {
      result = result.filter((car) => car.color === selectedColor);
    }
    if (selectedYear !== 'All') {
      result = result.filter((car) => car.year === parseInt(selectedYear));
    }

    const mileageRange = mileageRanges[selectedMileageRange];
    result = result.filter(
      (car) => car.mileage >= mileageRange.min && car.mileage < mileageRange.max
    );

    const priceRange = priceRanges[selectedPriceRange];
    result = result.filter(
      (car) => car.price >= priceRange.min && car.price < priceRange.max
    );

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
      case 'year-desc':
        result.sort((a, b) => b.year - a.year);
        break;
      case 'year-asc':
        result.sort((a, b) => a.year - b.year);
        break;
      case 'newest':
      default:
        result.sort((a, b) => b.year - a.year || a.mileage - b.mileage);
    }

    return result;
  }, [
    searchQuery,
    selectedBrand,
    selectedBodyType,
    selectedFuel,
    selectedTransmission,
    selectedDrivetrain,
    selectedColor,
    selectedYear,
    selectedMileageRange,
    selectedPriceRange,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('All');
    setSelectedBodyType('All');
    setSelectedFuel('All');
    setSelectedTransmission('All');
    setSelectedDrivetrain('All');
    setSelectedColor('All');
    setSelectedYear('All');
    setSelectedMileageRange(0);
    setSelectedPriceRange(0);
    setSortBy('newest');
  };

  const hasActiveFilters =
    searchQuery ||
    selectedBrand !== 'All' ||
    selectedBodyType !== 'All' ||
    selectedFuel !== 'All' ||
    selectedTransmission !== 'All' ||
    selectedDrivetrain !== 'All' ||
    selectedColor !== 'All' ||
    selectedYear !== 'All' ||
    selectedMileageRange !== 0 ||
    selectedPriceRange !== 0;

  const activeFilterTags = [
    selectedBrand !== 'All' && { label: selectedBrand, clear: () => setSelectedBrand('All') },
    selectedBodyType !== 'All' && { label: selectedBodyType, clear: () => setSelectedBodyType('All') },
    selectedFuel !== 'All' && { label: selectedFuel, clear: () => setSelectedFuel('All') },
    selectedTransmission !== 'All' && { label: selectedTransmission, clear: () => setSelectedTransmission('All') },
    selectedDrivetrain !== 'All' && { label: selectedDrivetrain, clear: () => setSelectedDrivetrain('All') },
    selectedColor !== 'All' && { label: selectedColor, clear: () => setSelectedColor('All') },
    selectedYear !== 'All' && { label: `Year: ${selectedYear}`, clear: () => setSelectedYear('All') },
    selectedMileageRange !== 0 && { label: mileageRanges[selectedMileageRange].label, clear: () => setSelectedMileageRange(0) },
    selectedPriceRange !== 0 && { label: priceRanges[selectedPriceRange].label, clear: () => setSelectedPriceRange(0) },
    searchQuery && { label: `"${searchQuery}"`, clear: () => setSearchQuery('') },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="overflow-hidden">
      {/* ===== HERO ===== */}
      <section className="relative flex items-center justify-center py-32 sm:py-40">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Jungcar/images/hero-banner.jpg"
            alt="Browse Cars"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a4d0e]/90 via-[#0a4d0e]/75 to-[#0a4d0e]/50" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4A843]/40 bg-[#D4A843]/10 px-4 py-1.5 text-sm font-medium text-[#D4A843] backdrop-blur-sm">
              <Car className="h-4 w-4" />
              Vehicle Inventory
            </span>
            <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
              Browse Our <span className="text-[#D4A843]">Cars</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-white/80">
              {filteredCars.length} quality Korean vehicles available for export
            </p>

            {/* Search Bar */}
            <div className="mt-8 flex justify-center">
              <div className="relative w-full max-w-xl">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0a4d0e]/40" />
                <input
                  type="text"
                  placeholder="Search by brand or model..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl bg-white py-3.5 pl-12 pr-4 text-[#0a4d0e] shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D4A843]/50"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FILTERS + RESULTS ===== */}
      <section className="py-10 sm:py-16 bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Filter Panel */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl border border-[#0a4d0e]/10 bg-white p-5 sm:p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a4d0e]">
                <SlidersHorizontal className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-[#0a4d0e]">Filter Vehicles</h2>
                <p className="text-sm text-[#0a4d0e]/50">Find your perfect Korean car</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="rounded-lg border border-[#0a4d0e]/20 px-3 py-1.5 text-xs font-medium text-[#0a4d0e] hover:bg-[#0a4d0e]/5 transition-colors"
                >
                  {showAdvanced ? 'Simple' : 'Advanced'}
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-200 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Basic Filters */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
              <FilterSelect
                label="Brand"
                value={selectedBrand}
                onChange={setSelectedBrand}
                options={brands.map((b) => ({ value: b, label: b === 'All' ? 'All Brands' : b }))}
              />
              <FilterSelect
                label="Body Type"
                value={selectedBodyType}
                onChange={setSelectedBodyType}
                options={bodyTypes.map((b) => ({ value: b, label: b === 'All' ? 'All Types' : b }))}
              />
              <FilterSelect
                label="Fuel Type"
                value={selectedFuel}
                onChange={setSelectedFuel}
                options={fuelTypes.map((f) => ({ value: f, label: f === 'All' ? 'All Fuels' : f }))}
              />
              <FilterSelect
                label="Price Range"
                value={selectedPriceRange.toString()}
                onChange={(v) => setSelectedPriceRange(Number(v))}
                options={priceRanges.map((r, i) => ({ value: i.toString(), label: r.label }))}
              />
              <FilterSelect
                label="Sort By"
                value={sortBy}
                onChange={setSortBy}
                options={sortOptions.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>

            {/* Advanced Filters */}
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 pt-4 border-t border-[#0a4d0e]/10"
              >
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
                  <FilterSelect
                    label="Year"
                    value={selectedYear}
                    onChange={setSelectedYear}
                    options={yearOptions.map((y) => ({ value: y, label: y === 'All' ? 'All Years' : y }))}
                  />
                  <FilterSelect
                    label="Mileage"
                    value={selectedMileageRange.toString()}
                    onChange={(v) => setSelectedMileageRange(Number(v))}
                    options={mileageRanges.map((r, i) => ({ value: i.toString(), label: r.label === 'All' ? 'All Mileage' : r.label }))}
                  />
                  <FilterSelect
                    label="Transmission"
                    value={selectedTransmission}
                    onChange={setSelectedTransmission}
                    options={transmissions.map((t) => ({ value: t, label: t === 'All' ? 'All' : t }))}
                  />
                  <FilterSelect
                    label="Drivetrain"
                    value={selectedDrivetrain}
                    onChange={setSelectedDrivetrain}
                    options={drivetrains.map((d) => ({ value: d, label: d === 'All' ? 'All' : d }))}
                  />
                  <FilterSelect
                    label="Color"
                    value={selectedColor}
                    onChange={setSelectedColor}
                    options={colors.map((c) => ({ value: c, label: c === 'All' ? 'All Colors' : c }))}
                  />
                </div>
              </motion.div>
            )}

            {/* Active Filters Tags */}
            {activeFilterTags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[#0a4d0e]/10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[#0a4d0e]/40 font-medium">Active:</span>
                  {activeFilterTags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-[#0a4d0e]/10 px-3 py-1 text-xs font-medium text-[#0a4d0e]"
                    >
                      {tag.label}
                      <button onClick={tag.clear} className="hover:text-[#0a4d0e]/60">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
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
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#0a4d0e]/10">
                <Car className="h-8 w-8 text-[#0a4d0e]/40" />
              </div>
              <p className="mt-4 text-lg font-semibold text-[#0a4d0e]">
                No vehicles found
              </p>
              <p className="mt-2 text-[#0a4d0e]/50">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-[#0a4d0e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0d6611] transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-[#0a4d0e]/60">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#0a4d0e]/15 bg-[#f5f5f5] px-3 py-2.5 text-sm font-medium text-[#0a4d0e] focus:outline-none focus:border-[#0a4d0e] focus:ring-2 focus:ring-[#0a4d0e]/20 transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
