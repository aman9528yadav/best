"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ArrowRightLeft,
  Globe,
  Star,
  Copy,
  Share2,
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
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CATEGORIES, convert } from '@/lib/units';
import { suggestUnits } from '@/ai/flows/suggest-units-based-on-input';
import { useToast } from '@/hooks/use-toast';

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
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState(CATEGORIES[0].units[0].name);
  const [toUnit, setToUnit] = useState(CATEGORIES[0].units[4].name);
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<Conversion[]>([]);
  const [fromSuggestions, setFromSuggestions] = useState<string[]>([]);
  const [toSuggestions, setToSuggestions] = useState<string[]>([]);

  const activeCategory = useMemo(() => CATEGORIES.find((c) => c.name === category)!, [category]);
  const units = useMemo(() => activeCategory.units, [activeCategory]);

  const handleConversion = useCallback(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      setResult('');
      return;
    }
    const convertedValue = convert(value, fromUnit, toUnit, category);
    if (convertedValue !== null) {
      setResult(
        Number(convertedValue.toPrecision(5)).toLocaleString('en-US', {
          maximumFractionDigits: 5,
        })
      );
    } else {
      setResult('N/A');
    }
  }, [inputValue, fromUnit, toUnit, category]);

  useEffect(() => {
    handleConversion();
  }, [handleConversion]);

  useEffect(() => {
    if (!inputValue || isNaN(parseFloat(inputValue))) {
      setFromSuggestions([]);
      setToSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const suggestions = await suggestUnits({
          inputValue,
          category,
          region,
        });
        setFromSuggestions(suggestions.fromUnitSuggestions.filter(s => units.some(u => u.name === s)));
        setToSuggestions(suggestions.toUnitSuggestions.filter(s => units.some(u => u.name === s)));
      } catch (error) {
        console.error('AI suggestion failed:', error);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [inputValue, category, region, units]);

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const newCategoryData = CATEGORIES.find((c) => c.name === newCategory);
    if (newCategoryData && newCategoryData.units.length >= 2) {
      setFromUnit(newCategoryData.units[0].name);
      setToUnit(newCategoryData.units[1].name);
    }
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setInputValue(result.replace(/,/g, ''));
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
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({ title: 'Copied!', description: 'Result copied to clipboard.' });
    }
  };

  const UnitSelector = ({ value, onChange, suggestions }: { value: string; onChange: (v: string) => void; suggestions: string[] }) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full text-base sm:w-[150px]">
        <SelectValue placeholder="Unit" />
      </SelectTrigger>
      <SelectContent>
        {suggestions.length > 0 && (
          <SelectGroup>
            <SelectLabel>Suggested</SelectLabel>
            {suggestions.map((unit) => <SelectItem key={`sugg-${unit}`} value={unit}>{unit}</SelectItem>)}
          </SelectGroup>
        )}
        <SelectGroup>
          <SelectLabel>All Units</SelectLabel>
          {units.map((unit) => <SelectItem key={unit.name} value={unit.name}>{unit.name}</SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full sm:w-auto flex-1">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <SelectValue placeholder="Region" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="International">International</SelectItem>
                <SelectItem value="Local">Local</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-auto flex-1">
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
          <div className="relative flex flex-col items-center">
            <Card className="w-full p-4 border-b-0 rounded-b-none">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="text-2xl h-12 flex-1" placeholder="0" />
                <UnitSelector value={fromUnit} onChange={setFromUnit} suggestions={fromSuggestions} />
              </div>
            </Card>
            <div className="w-full h-px bg-border my-[-1px] z-10"></div>
            <Button variant="outline" size="icon" className="absolute top-1/2 -translate-y-1/2 z-20 rounded-full bg-background" onClick={handleSwap}>
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <Card className="w-full p-4 border-t-0 rounded-t-none">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Input value={result} readOnly className="text-2xl h-12 flex-1 font-bold border-none" placeholder="0" />
                <UnitSelector value={toUnit} onChange={setToUnit} suggestions={toSuggestions} />
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 flex items-center justify-between">
            <span className="text-4xl font-bold tracking-tight">{result || '0'}</span>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon"><Star className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon" onClick={handleCopy}><Copy className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon"><Share2 className="h-5 w-5"/></Button>
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" size="lg">Compare</Button>
        <Button size="lg" onClick={handleAddToHistory}>Convert</Button>
      </div>

      {history.length > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Recent Conversions</h3>
            <Button variant="link" className="text-primary pr-0">See All</Button>
          </div>
          <Card>
            <CardContent className="p-2">
              <ul className="space-y-1">
                {history.map((item) => (
                  <li key={item.id} className="p-2 rounded-md hover:bg-accent flex justify-between items-center text-sm">
                    <span>{`${item.fromValue} ${item.fromUnit}`}</span>
                    <span className="text-muted-foreground mx-2">-&gt;</span>
                    <span className="font-semibold">{`${item.toValue} ${item.toUnit}`}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
