
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
  Undo2,
  Trash2,
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
import { AdPlaceholder } from './ad-placeholder';
import { useHistory, ConversionHistoryItem, FavoriteItem } from '@/context/HistoryContext';
import Link from 'next/link';
import { ConversionComparisonDialog } from './conversion-comparison-dialog';

export function UnitConverter() {
  const { toast } = useToast();
  const { history, favorites, addConversionToHistory, addFavorite, deleteFavorite, deleteHistoryItem } = useHistory();

  const [region, setRegion] = useState('International');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [inputValue, setInputValue] = useState('1');
  const [fromUnit, setFromUnit] = useState(CATEGORIES[0].units[0].name);
  const [toUnit, setToUnit] = useState(CATEGORIES[0].units[1].name);
  const [result, setResult] = useState('');
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false);

  const activeCategory = useMemo(
    () => CATEGORIES.find((c) => c.name === category)!,
    [category]
  );
  const units = useMemo(() => activeCategory.units, [activeCategory]);
  const fromUnitDetails = useMemo(() => units.find(u => u.name === fromUnit), [units, fromUnit]);
  const toUnitDetails = useMemo(() => units.find(u => u.name === toUnit), [units, toUnit]);

  const isFavorited = useMemo(() => {
    return favorites.some(fav => fav.category === category && fav.fromUnit === fromUnit && fav.toUnit === toUnit);
  }, [favorites, category, fromUnit, toUnit]);

  const conversionInfo = useMemo(() => {
    if (!fromUnitDetails || !toUnitDetails) return '';
    const oneUnitConversion = convert(1, fromUnit, toUnit, category);
    if (oneUnitConversion !== null) {
      const formattedResult = Number(oneUnitConversion.toPrecision(5));
      return `1 ${fromUnitDetails.symbol} = ${formattedResult} ${toUnitDetails.symbol}`;
    }
    return '';
  }, [fromUnit, toUnit, category, fromUnitDetails, toUnitDetails]);

  const handleConversion = useCallback((valueStr?: string) => {
    const valueToConvert = valueStr || inputValue;
    const value = parseFloat(valueToConvert);
    if (isNaN(value)) {
      setResult('');
      return;
    }
    const convertedValue = convert(value, fromUnit, toUnit, category);
    if (convertedValue !== null) {
      const formattedResult = Number(convertedValue.toPrecision(5));
      setResult(formattedResult.toString());
      return {
        fromValue: valueToConvert,
        fromUnit,
        toValue: formattedResult.toString(),
        toUnit,
        category,
      };
    } else {
      setResult('N/A');
    }
    return null;
  }, [inputValue, fromUnit, toUnit, category]);

  useEffect(() => {
    handleConversion();
  }, [inputValue, fromUnit, toUnit, category, handleConversion]);


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
    const currentFromUnit = fromUnit;
    const currentToUnit = toUnit;
  
    setFromUnit(currentToUnit);
    setToUnit(currentFromUnit);
  
    if (currentFromResult && currentFromResult !== 'N/A') {
      setInputValue(currentFromResult.replace(/,/g, ''));
    }
  };

  const handleAddToHistory = () => {
    const conversionResult = handleConversion();
    if (conversionResult) {
      addConversionToHistory({
        type: 'conversion',
        fromValue: conversionResult.fromValue,
        fromUnit: conversionResult.fromUnit,
        toValue: conversionResult.toValue,
        toUnit: conversionResult.toUnit,
        category: conversionResult.category,
      });
    }
  };
  
  const handleRestoreHistory = (itemToRestore: ConversionHistoryItem) => {
    setInputValue(itemToRestore.fromValue);
    setCategory(itemToRestore.category);
    setFromUnit(itemToRestore.fromUnit);
    setToUnit(itemToRestore.toUnit);
  };

  const handleDeleteHistory = (idToDelete: string) => {
    deleteHistoryItem(idToDelete);
  };

  const handleFavoriteToggle = () => {
    const favoriteItem = favorites.find(fav => fav.category === category && fav.fromUnit === fromUnit && fav.toUnit === toUnit);

    if (favoriteItem) {
      deleteFavorite(favoriteItem.id);
      toast({ title: 'Removed from favorites.' });
    } else {
      addFavorite({ fromUnit, toUnit, category });
      toast({ title: 'Added to favorites!' });
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

  const conversionHistory = history
    .filter(item => item.type === 'conversion')
    .slice(0, 5) as ConversionHistoryItem[];

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
                      <span>{category}</span>
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

          <div className="relative flex items-center">
            <div className="flex-1 bg-muted/50 p-2 rounded-md">
                <UnitSelector value={fromUnit} onChange={setFromUnit} label="Meters (m)" />
            </div>
            <div className="px-2">
                <Button variant="outline" size="icon" className="z-10 rounded-full bg-background w-8 h-8" onClick={handleSwap}>
                    <ArrowRightLeft className="h-3 w-3" />
                </Button>
            </div>
            <div className="flex-1 bg-muted/50 p-2 rounded-md">
                <UnitSelector value={toUnit} onChange={setToUnit} label="Kilometers.." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {fromUnitDetails?.isStandard && (
                <div className="bg-accent text-accent-foreground p-2 rounded-md flex items-center gap-2">
                <Info className="h-4 w-4" />
                <span>{fromUnitDetails.name} is a standard unit.</span>
                </div>
            )}
            {conversionInfo && (
                <div className="bg-accent text-accent-foreground p-2 rounded-md flex items-center gap-2 col-span-full">
                <Info className="h-4 w-4" />
                <span>{conversionInfo}</span>
                </div>
            )}
          </div>

          <div className="bg-accent p-4 rounded-lg flex items-center justify-between">
            <span className="text-3xl font-bold tracking-tight text-accent-foreground">{result || '0'}</span>
            <div className="flex items-center gap-1 text-accent-foreground">
                <Button variant="ghost" size="icon" onClick={handleFavoriteToggle}>
                  <Star className={cn("h-5 w-5", isFavorited && "fill-current text-primary")} />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleCopy}><Copy className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon"><Share2 className="h-5 w-5"/></Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" size="lg" onClick={() => setIsCompareDialogOpen(true)}><ArrowRightLeft className='mr-2 h-4 w-4'/>Compare</Button>
            <Button size="lg" onClick={handleAddToHistory}><Power className='mr-2 h-4 w-4' />Convert</Button>
          </div>

        </CardContent>
      </Card>

      {conversionHistory.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2"><History className='h-5 w-5 text-muted-foreground' />Recent Conversions</h3>
              <Button asChild variant="link" className="text-primary pr-0">
                <Link href="/history">See All</Link>
              </Button>
            </div>
            <ul className="space-y-1">
              {conversionHistory.map((item) => (
                <li key={item.id} className="p-2 rounded-lg bg-accent flex justify-between items-center text-sm text-accent-foreground">
                    <div className='flex items-center'>
                      <span>{`${item.fromValue} ${item.fromUnit.split(' ')[0]}`}</span>
                      <ArrowRightLeft className="h-3 w-3 mx-3" />
                      <span className="font-semibold">{`${item.toValue} ${item.toUnit.split(' ')[0]}`}</span>
                    </div>
                    <div className="flex items-center">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRestoreHistory(item)}>
                        <Undo2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteHistory(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <AdPlaceholder className="mt-4 w-full" />

      {fromUnitDetails && (
        <ConversionComparisonDialog
          open={isCompareDialogOpen}
          onOpenChange={setIsCompareDialogOpen}
          category={category}
          fromUnit={fromUnit}
          fromUnitDetails={fromUnitDetails}
          inputValue={inputValue}
        />
      )}
    </div>
  );
}

    
