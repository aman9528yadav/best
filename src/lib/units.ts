
import React from 'react';
import {
  Ruler,
  Weight,
  Thermometer,
  GaugeCircle,
  LandPlot,
  Beaker,
  Clock,
  Database,
  Wind,
  DollarSign,
} from 'lucide-react';

export type Unit = {
  name: string;
  symbol: string;
  isStandard?: boolean;
  region?: 'Indian';
};

export type Category = {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  units: Unit[];
};

export const CATEGORIES: Category[] = [
  {
    name: 'Length',
    icon: Ruler,
    units: [
      { name: 'Meters', symbol: 'm', isStandard: true },
      { name: 'Kilometers', symbol: 'km' },
      { name: 'Centimeters', symbol: 'cm' },
      { name: 'Millimeters', symbol: 'mm' },
      { name: 'Micrometers', symbol: 'μm' },
      { name: 'Nanometers', symbol: 'nm' },
      { name: 'Feet', symbol: 'ft' },
      { name: 'Inches', symbol: 'in' },
      { name: 'Yards', symbol: 'yd' },
      { name: 'Miles', symbol: 'mi' },
      { name: 'Nautical Miles', symbol: 'nmi' },
      { name: 'Gaj', symbol: 'gaj', region: 'Indian' },
    ],
  },
  {
    name: 'Weight',
    icon: Weight,
    units: [
      { name: 'Grams', symbol: 'g', isStandard: true },
      { name: 'Kilograms', symbol: 'kg' },
      { name: 'Milligrams', symbol: 'mg' },
      { name: 'Metric Tonnes', symbol: 't' },
      { name: 'Pounds', symbol: 'lb' },
      { name: 'Ounces', symbol: 'oz' },
      { name: 'Stone', symbol: 'st' },
      { name: 'Tola', symbol: 'tola', region: 'Indian' },
      { name: 'Sher', symbol: 'sher', region: 'Indian' },
      { name: 'Maund', symbol: 'maund', region: 'Indian' },
    ],
  },
  {
    name: 'Temperature',
    icon: Thermometer,
    units: [
      { name: 'Celsius', symbol: '°C' },
      { name: 'Fahrenheit', symbol: '°F' },
      { name: 'Kelvin', symbol: 'K', isStandard: true },
    ],
  },
  {
    name: 'Area',
    icon: LandPlot,
    units: [
      { name: 'Square Meters', symbol: 'm²', isStandard: true },
      { name: 'Square Kilometers', symbol: 'km²' },
      { name: 'Square Feet', symbol: 'ft²' },
      { name: 'Square Miles', symbol: 'mi²' },
      { name: 'Acres', symbol: 'ac' },
      { name: 'Hectares', symbol: 'ha' },
      { name: 'Square Gaj', symbol: 'sq gaj', region: 'Indian' },
      { name: 'Bigha', symbol: 'bigha', region: 'Indian' },
      { name: 'Kanal', symbol: 'kanal', region: 'Indian' },
      { name: 'Killa', symbol: 'killa', region: 'Indian' },
    ],
  },
  {
    name: 'Volume',
    icon: Beaker,
    units: [
      { name: 'Liters', symbol: 'L', isStandard: true },
      { name: 'Milliliters', symbol: 'mL' },
      { name: 'Cubic Meters', symbol: 'm³' },
      { name: 'Gallons (US)', symbol: 'gal' },
      { name: 'Pints (US)', symbol: 'pt' },
    ],
  },
  {
    name: 'Speed',
    icon: GaugeCircle,
    units: [
      { name: 'Meters per second', symbol: 'm/s', isStandard: true },
      { name: 'Kilometers per hour', symbol: 'km/h' },
      { name: 'Miles per hour', symbol: 'mph' },
      { name: 'Knots', symbol: 'kn' },
    ],
  },
  {
    name: 'Time',
    icon: Clock,
    units: [
      { name: 'Seconds', symbol: 's', isStandard: true },
      { name: 'Minutes', symbol: 'min' },
      { name: 'Hours', symbol: 'h' },
      { name: 'Days', symbol: 'd' },
      { name: 'Weeks', symbol: 'wk' },
    ],
  },
  {
    name: 'Data',
    icon: Database,
    units: [
      { name: 'Bytes', symbol: 'B', isStandard: true },
      { name: 'Kilobytes', symbol: 'KB' },
      { name: 'Megabytes', symbol: 'MB' },
      { name: 'Gigabytes', symbol: 'GB' },
      { name: 'Terabytes', symbol: 'TB' },
    ],
  },
  {
    name: 'Pressure',
    icon: Wind,
    units: [
      { name: 'Pascal', symbol: 'Pa', isStandard: true },
      { name: 'Bar', symbol: 'bar' },
      { name: 'Atmosphere', symbol: 'atm' },
      { name: 'PSI', symbol: 'psi' },
    ],
  },
  {
    name: 'Currency',
    icon: DollarSign,
    units: [
      { name: 'USD', symbol: '$' },
      { name: 'EUR', symbol: '€' },
      { name: 'GBP', symbol: '£' },
      { name: 'JPY', symbol: '¥' },
      { name: 'INR', symbol: '₹' },
      { name: 'CAD', symbol: 'CA$' },
      { name: 'AUD', symbol: 'A$' },
      { name: 'CHF', symbol: 'CHF' },
      { name: 'CNY', symbol: '¥' },
      { name: 'RUB', symbol: '₽' },
    ],
  },
];

const conversionFactors: Record<string, Record<string, number>> = {
  // Length to base (Meters)
  Meters: 1,
  Kilometers: 1000,
  Centimeters: 0.01,
  Millimeters: 0.001,
  Micrometers: 1e-6,
  Nanometers: 1e-9,
  Feet: 0.3048,
  Inches: 0.0254,
  Yards: 0.9144,
  Miles: 1609.34,
  'Nautical Miles': 1852,
  Gaj: 0.9144, // Same as Yard
  // Weight to base (Grams)
  Grams: 1,
  Kilograms: 1000,
  Milligrams: 0.001,
  'Metric Tonnes': 1000000,
  Pounds: 453.592,
  Ounces: 28.3495,
  Stone: 6350.29,
  Tola: 11.6638,
  Sher: 933.1, // 1 Sher = 80 Tola
  Maund: 37324, // 1 Maund = 40 Sher
  // Area to base (Square Meters)
  'Square Meters': 1,
  'Square Kilometers': 1000000,
  'Square Feet': 0.092903,
  'Square Miles': 2589988.11,
  Acres: 4046.86,
  Hectares: 10000,
  'Square Gaj': 0.836127,
  Bigha: 2529.29, // Varies, using a common value for UP/Rajasthan
  Kanal: 505.857,
  Killa: 4046.86, // Equivalent to one Acre
  // Volume to base (Liters)
  Liters: 1,
  Milliliters: 0.001,
  'Cubic Meters': 1000,
  'Gallons (US)': 3.78541,
  'Pints (US)': 0.473176,
  // Speed to base (Meters per second)
  'Meters per second': 1,
  'Kilometers per hour': 0.277778,
  'Miles per hour': 0.44704,
  Knots: 0.514444,
  // Time to base (Seconds)
  Seconds: 1,
  Minutes: 60,
  Hours: 3600,
  Days: 86400,
  Weeks: 604800,
  // Data to base (Bytes)
  Bytes: 1,
  Kilobytes: 1024,
  Megabytes: 1048576,
  Gigabytes: 1073741824,
  Terabytes: 1099511627776,
  // Pressure to base (Pascal)
  Pascal: 1,
  Bar: 100000,
  Atmosphere: 101325,
  PSI: 6894.76,
  // Currency to base (INR)
  INR: 1,
  USD: 83.5,
  EUR: 90.7,
  GBP: 105.2,
  JPY: 0.53,
  CAD: 61.0,
  AUD: 55.3,
  CHF: 92.5,
  CNY: 11.5,
  RUB: 0.95,
};

export function convert(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: string
): number | null {
  if (fromUnit === toUnit) return value;

  if (category === 'Temperature') {
    if (fromUnit === 'Celsius') {
      if (toUnit === 'Fahrenheit') return (value * 9) / 5 + 32;
      if (toUnit === 'Kelvin') return value + 273.15;
    }
    if (fromUnit === 'Fahrenheit') {
      if (toUnit === 'Celsius') return ((value - 32) * 5) / 9;
      if (toUnit === 'Kelvin') return ((value - 32) * 5) / 9 + 273.15;
    }
    if (fromUnit === 'Kelvin') {
      if (toUnit === 'Celsius') return value - 273.15;
      if (toUnit === 'Fahrenheit') return ((value - 273.15) * 9) / 5 + 32;
    }
    return null;
  }

  const fromFactor = conversionFactors[fromUnit];
  const toFactor = conversionFactors[toUnit];

  if (fromFactor && toFactor) {
    const valueInBase = value * fromFactor;
    return valueInBase / toFactor;
  }

  return null;
}
