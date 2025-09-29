"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowRightLeft,
  Globe,
  Star,
  Copy,
  Share2,
  Info,
  Grid3x3,
  History,
  Power,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES, convert } from '@/lib/units';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Conversion = {
  id: string;
  fromValue: string;
  fromUnit: string;
  toValue: string;
  toUnit: string;
  category: string;
};

export function UnitConverter() {
  const { toast } = useToast();
  const [region, setRegion] = useState('International');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [inputValue, setInputValue] = useState('112');
  const [fromUnit, setFromUnit] = useState(CATEGORIES[0].units[0].name);
  const [toUnit, setToUnit] = useState(CATEGORIES[0].units[1].name);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<Conversion[]>([]);

  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.name === category)!,
    [category]
  );
  const units = useMemo(() => activeCategory.units, [activeCategory]);
  const fromUnitDetails = useMemo(() => units.find(u => u.name === fromUnit), [units, fromUnit]);

  const handleConversion = useCallback(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('');
      return;
    }
    const convertedValue = convert(value, fromUnit, toUnit, category);
    if (convertedValue !== null) {
      const formattedResult = Number(convertedValue.toPrecision(5));
      setResult(formattedResult.toString());
    } else {
      setResult('N/A');
    }
  }, [inputValue, fromUnit, toUnit, category]);

  useEffect(() => {
    handleConversion();
  }, [handleConversion]);

  useEffect(() => {
    // Pre-populate history with an example
    if (history.length === 0) {
      setHistory([
        {
          id: 'initial-1',
          fromValue: '112',
          fromUnit: 'Meters',
          toValue: '0.112',
          toUnit: 'Kilometers',
          category: 'Length',
        },
      ]);
    }
  }, [history.length]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const newCategoryData = CATEGORIES.find((c) => c.name === newCategory);
    if (newCategoryData && newCategoryData.units.length >= 2) {
      setFromUnit(newCategoryData.units[0].name);
      setToUnit(newCategoryData.units[1].name);
    }
  };

  const handleSwap = () => {
    const currentFromResult = result;
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (currentFromResult && currentFromResult !== 'N/A') {
      setInputValue(currentFromResult.replace(/,/g, ''));
    }
  };

  const handleAddToHistory = () => {
    if (result && result !== 'N/A') {
      const newConversion: Conversion = {
        id: new Date().toISOString(),
        fromValue: inputValue,
        fromUnit,
        toValue: result,
        toUnit,
        category,
      };
      setHistory([newConversion, ...history.slice(0, 4)]);
      handleConversion(); // Trigger conversion on button click as well
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({ title: 'Copied!', description: 'Result copied to clipboard.' });
    }
  };

  const UnitSelector = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string; }) => {
    const unitDetails = units.find(u => u.name === value);
    return (
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full bg-card border-none text-muted-foreground">
          <SelectValue>
           {unitDetails ? `${unitDetails.name} (${unitDetails.symbol})` : label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit.name} value={unit.name}>
                {`${unit.name} (${unit.symbol})`}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="space-y-4 w-full">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Globe className="h-4 w-4" />
                    <span>Region</span>
                </div>
                 <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="International">International</SelectItem>
                    <SelectItem value="Local">Local</SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Grid3x3 className="h-4 w-4" />
                    <span>Category</span>
                </div>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full">
                     <div className="flex items-center gap-2">
                      {React.createElement(activeCategory.icon, { className: 'h-4 w-4' })}
                      <SelectValue placeholder="Category" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.name} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4" />
                          <span>{cat.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
             </div>
          </div>
          
          <div className='space-y-2'>
            <label className='text-sm text-muted-foreground'>From</label>
            <Input 
                type="number" 
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                className="text-lg h-12" 
                placeholder="0" 
            />
          </div>

          <div className="relative grid grid-cols-2 gap-2 items-center bg-muted/50 p-2 rounded-md">
            <UnitSelector value={fromUnit} onChange={setFromUnit} label="Meters (m)" />
            <div className="absolute w-full flex items-center justify-center">
              <Button variant="outline" size="icon" className="z-10 rounded-full bg-background" onClick={handleSwap}>
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            </div>
            <UnitSelector value={toUnit} onChange={setToUnit} label="Kilometers.." />
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-accent text-accent-foreground p-2 rounded-md flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>It is the standard unit</span>
            </div>
             <div className="bg-accent text-accent-foreground p-2 rounded-md flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>1km = 1000 m</span>
            </div>
          </div>

          <div className="bg-accent p-4 rounded-lg flex items-center justify-between">
            <span className="text-3xl font-bold tracking-tight text-accent-foreground">{result || '0'}</span>
            <div className="flex items-center gap-1 text-accent-foreground">
                <Button variant="ghost" size="icon"><Star className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" onClick={handleCopy}><Copy className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon"><Share2 className="h-5 w-5"/></Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" size="lg"><ArrowRightLeft className='mr-2 h-4 w-4'/>Compare</Button>
            <Button size="lg" onClick={handleAddToHistory}><Power className='mr-2 h-4 w-4' />Convert</Button>
          </div>

        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2"><History className='h-5 w-5 text-muted-foreground' />Recent Conversions</h3>
              <Button variant="link" className="text-primary pr-0">See All</Button>
            </div>
            <ul className="space-y-1">
              {history.map((item) => (
                <li key={item.id} className="p-3 rounded-lg bg-accent flex justify-center items-center text-sm text-accent-foreground">
                  <span>{`${item.fromValue} ${item.fromUnit.split(' ')[0]}`}</span>
                  <ArrowRightLeft className="h-3 w-3 mx-3" />
                  <span className="font-semibold">{`${item.toValue} ${item.toUnit.split(' ')[0]}`}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
