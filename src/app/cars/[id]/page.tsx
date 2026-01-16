import CarDetailClient from './CarDetailClient';

// Dummy car data
const carsData: Record<string, {
  id: number;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  fuel: string;
  transmission: string;
  bodyType: string;
  color: string;
  engine: string;
  drivetrain: string;
  doors: number;
  seats: number;
  vin: string;
  description: string;
  images: string[];
  status: string;
}> = {
  '1': {
    id: 1,
    brand: 'Hyundai',
    model: 'Sonata DN8',
    year: 2023,
    mileage: 15000,
    price: 28500,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    color: 'Phantom Black',
    engine: '2.5L Smartstream',
    drivetrain: 'Front-Wheel Drive',
    doors: 4,
    seats: 5,
    vin: 'KMHL341CBNA123456',
    description: `This 2023 Hyundai Sonata DN8 is in excellent condition with low mileage.

Features include:
- Smart Cruise Control with Stop & Go
- Highway Driving Assist
- Blind-Spot Collision-Avoidance Assist
- 12.3-inch Digital Cluster
- Wireless Apple CarPlay & Android Auto
- Bose Premium Audio System

The vehicle has been thoroughly inspected and is ready for export.`,
    images: [
      'https://images.unsplash.com/photo-1590656371803-0ae2ae004989?w=1200',
      'https://images.unsplash.com/photo-1688893287874-ac7fbd686c24?w=1200',
      'https://images.unsplash.com/photo-1714348938045-0c74379cd4d9?w=1200',
      'https://images.unsplash.com/photo-1616627091698-50d033ce0980?w=1200',
    ],
    status: 'available',
  },
  '2': {
    id: 2,
    brand: 'Kia',
    model: 'K5 DL3',
    year: 2022,
    mileage: 28000,
    price: 24500,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    color: 'Snow White Pearl',
    engine: '2.5L GDi',
    drivetrain: 'Front-Wheel Drive',
    doors: 4,
    seats: 5,
    vin: 'KNAG411ABNA654321',
    description: `2022 Kia K5 DL3 in excellent condition.

Features include:
- 10.25-inch Touchscreen Display
- Apple CarPlay & Android Auto
- Smart Cruise Control
- Lane Keeping Assist
- Forward Collision-Avoidance Assist

Ready for export with all documentation.`,
    images: [
      'https://images.unsplash.com/photo-1688893287874-ac7fbd686c24?w=1200',
      'https://images.unsplash.com/photo-1590656371803-0ae2ae004989?w=1200',
      'https://images.unsplash.com/photo-1714348938045-0c74379cd4d9?w=1200',
      'https://images.unsplash.com/photo-1616627091698-50d033ce0980?w=1200',
    ],
    status: 'available',
  },
  '3': {
    id: 3,
    brand: 'Genesis',
    model: 'G80 RG3',
    year: 2023,
    mileage: 12000,
    price: 52000,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    bodyType: 'Sedan',
    color: 'Vik Black',
    engine: '3.5L Twin-Turbo V6',
    drivetrain: 'All-Wheel Drive',
    doors: 4,
    seats: 5,
    vin: 'KMTG541DBPA789012',
    description: `Luxury 2023 Genesis G80 with premium features.

Features include:
- 14.5-inch 3D Cluster Display
- 12.3-inch Infotainment Screen
- Lexicon Premium Audio
- Nappa Leather Interior
- Highway Driving Assist II

Exceptional luxury sedan ready for export.`,
    images: [
      'https://images.unsplash.com/photo-1714348938045-0c74379cd4d9?w=1200',
      'https://images.unsplash.com/photo-1590656371803-0ae2ae004989?w=1200',
      'https://images.unsplash.com/photo-1688893287874-ac7fbd686c24?w=1200',
      'https://images.unsplash.com/photo-1616627091698-50d033ce0980?w=1200',
    ],
    status: 'available',
  },
};

const relatedCars = [
  {
    id: 2,
    brand: 'Kia',
    model: 'K5 DL3',
    year: 2022,
    mileage: 28000,
    price: 24500,
    fuel: 'Gasoline',
    transmission: 'Automatic',
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
    images: ['https://images.unsplash.com/photo-1714348938045-0c74379cd4d9?w=800'],
  },
  {
    id: 1,
    brand: 'Hyundai',
    model: 'Sonata DN8',
    year: 2023,
    mileage: 15000,
    price: 28500,
    fuel: 'Gasoline',
    transmission: 'Automatic',
    images: ['https://images.unsplash.com/photo-1590656371803-0ae2ae004989?w=800'],
  },
];

export function generateStaticParams() {
  return Object.keys(carsData).map((id) => ({
    id: id,
  }));
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = carsData[id] || carsData['1'];

  // Filter out current car from related
  const filtered = relatedCars.filter((c) => c.id !== car.id);

  return <CarDetailClient car={car} relatedCars={filtered} />;
}
