import React from 'react';
import { Ruler, Weight, Thermometer, Speedometer, AreaChart, Volume } from 'lucide-react';

export type Unit = {
  name: string;
  symbol: string;
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
      { name: 'Meters', symbol: 'm' },
      { name: 'Kilometers', symbol: 'km' },
      { name: 'Centimeters', symbol: 'cm' },
      { name: 'Millimeters', symbol: 'mm' },
      { name: 'Feet', symbol: 'ft' },
      { name: 'Inches', symbol: 'in' },
      { name: 'Yards', symbol: 'yd' },
      { name: 'Miles', symbol: 'mi' },
    ],
  },
  {
    name: 'Weight',
    icon: Weight,
    units: [
      { name: 'Grams', symbol: 'g' },
      { name: 'Kilograms', symbol: 'kg' },
      { name: 'Milligrams', symbol: 'mg' },
      { name: 'Pounds', symbol: 'lb' },
      { name: 'Ounces', symbol: 'oz' },
    ],
  },
  {
    name: 'Temperature',
    icon: Thermometer,
    units: [
      { name: 'Celsius', symbol: '°C' },
      { name: 'Fahrenheit', symbol: '°F' },
      { name: 'Kelvin', symbol: 'K' },
    ],
  },
];

const conversionFactors: Record<string, Record<string, number>> = {
  // Length to base (Meters)
  Meters: 1,
  Kilometers: 1000,
  Centimeters: 0.01,
  Millimeters: 0.001,
  Feet: 0.3048,
  Inches: 0.0254,
  Yards: 0.9144,
  Miles: 1609.34,
  // Weight to base (Grams)
  Grams: 1,
  Kilograms: 1000,
  Milligrams: 0.001,
  Pounds: 453.592,
  Ounces: 28.3495,
};

export function convert(value: number, fromUnit: string, toUnit: string, category: string): number | null {
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
