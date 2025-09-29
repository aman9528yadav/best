"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronUp, Divide, Equal, Minus, Plus, X, Percent, PlusMinus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CalculatorButton = ({
  onClick,
  children,
  className,
  variant = 'secondary',
}: {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'secondary' | 'default' | 'outline' | 'ghost' | 'link' | 'destructive' | null | undefined
}) => (
  <Button
    variant={variant}
    className={`h-16 text-2xl rounded-xl ${className}`}
    onClick={onClick}
  >
    {children}
  </Button>
);

export function Calculator() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isSci, setIsSci] = useState(false);

  const handleInput = (value: string) => {
    if (display === 'Error') {
      setDisplay(value);
      setExpression(value);
      return;
    }
    if (display === '0' && value !== '.') {
      setDisplay(value);
      setExpression(value);
    } else {
      setDisplay(display + value);
      setExpression(expression + value);
    }
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    const lastChar = expression.slice(-1);
    if (['+', '-', '×', '÷'].includes(lastChar)) {
      setExpression(expression.slice(0, -1) + op);
    } else {
      setExpression(expression + op);
    }
    setDisplay(op);
  };
  
  const evaluateExpression = (expr: string): number => {
    // Replace visual operators with JS-friendly ones
    const sanitizedExpr = expr.replace(/×/g, '*').replace(/÷/g, '/');

    // Handle scientific notation
    const scientificExpr = sanitizedExpr.replace(/(\d+)\s*\^\s*(\d+)/g, 'Math.pow($1, $2)');

    // Handle functions
    const funcExpr = scientificExpr
        .replace(/sin\(([^)]+)\)/g, (match, p1) => `Math.sin((${p1}) * Math.PI / 180)`)
        .replace(/cos\(([^)]+)\)/g, (match, p1) => `Math.cos((${p1}) * Math.PI / 180)`)
        .replace(/tan\(([^)]+)\)/g, (match, p1) => `Math.tan((${p1}) * Math.PI / 180)`)
        .replace(/log\(([^)]+)\)/g, 'Math.log10($1)')
        .replace(/ln\(([^)]+)\)/g, 'Math.log($1)')
        .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');


    // Using Function constructor for safety instead of eval
    try {
      return new Function('return ' + funcExpr)();
    } catch (e) {
      console.error("Calculation Error:", e);
      throw new Error("Invalid Expression");
    }
  };


  const handleEquals = () => {
    if (display === 'Error') return;
    try {
      const result = evaluateExpression(expression);
      const finalResult = Number(result.toPrecision(15));
      setDisplay(finalResult.toString());
      setExpression(finalResult.toString());
    } catch (error) {
      setDisplay('Error');
      setExpression('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleAllClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handlePlusMinus = () => {
    if (display === 'Error' || display === '0') return;
    setDisplay((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
    setExpression((prev) => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
  };
  
  const handlePercent = () => {
    if (display === 'Error') return;
    try {
        // Find the last number in the expression
        const parts = expression.split(/([+\-×÷])/);
        const lastPart = parts[parts.length - 1];
        
        if (!isNaN(parseFloat(lastPart))) {
            const percentage = parseFloat(lastPart) / 100;
            const newExpression = expression.slice(0, expression.length - lastPart.length) + percentage.toString();
            setExpression(newExpression);

            // Temporarily show the percentage value on display
            setDisplay(percentage.toString());
            // After a short delay, restore the display to the full expression or handle as needed
            setTimeout(() => setDisplay(newExpression), 1000);
        }
    } catch (e) {
      setDisplay('Error');
      setExpression('');
    }
  };


  const handleSciFunction = (func: string) => {
    if (display === 'Error') return;
    setDisplay(`${func}(`);
    setExpression(`${expression}${func}(`);
  };

  const basicButtons = [
    { label: 'AC', onClick: handleAllClear, className: 'bg-muted text-foreground' },
    { label: <PlusMinus size={24} />, onClick: handlePlusMinus, className: 'bg-muted text-foreground' },
    { label: <Percent size={24} />, onClick: handlePercent, className: 'bg-muted text-foreground' },
    { label: <Divide size={24} />, onClick: () => handleOperator('÷'), variant: 'default' },
    { label: '7', onClick: () => handleInput('7') },
    { label: '8', onClick: () => handleInput('8') },
    { label: '9', onClick: () => handleInput('9') },
    { label: <X size={24} />, onClick: () => handleOperator('×'), variant: 'default' },
    { label: '4', onClick: () => handleInput('4') },
    { label: '5', onClick: () => handleInput('5') },
    { label: '6', onClick: () => handleInput('6') },
    { label: <Minus size={24} />, onClick: () => handleOperator('-'), variant: 'default' },
    { label: '1', onClick: () => handleInput('1') },
    { label: '2', onClick: () => handleInput('2') },
    { label: '3', onClick: () => handleInput('3') },
    { label: <Plus size={24} />, onClick: () => handleOperator('+'), variant: 'default' },
    { label: '0', onClick: () => handleInput('0'), className: 'col-span-2' },
    { label: '.', onClick: () => handleInput('.') },
    { label: <Equal size={24} />, onClick: handleEquals, variant: 'default' },
  ];
  
  const sciButtons = [
    { label: 'sin', onClick: () => handleSciFunction('sin') },
    { label: 'cos', onClick: () => handleSciFunction('cos') },
    { label: 'tan', onClick: () => handleSciFunction('tan') },
    { label: 'log', onClick: () => handleSciFunction('log') },
    { label: 'ln', onClick: () => handleSciFunction('ln') },
    { label: '(', onClick: () => handleInput('(') },
    { label: ')', onClick: () => handleInput(')') },
    { label: '√', onClick: () => handleSciFunction('sqrt') },
    { label: 'x^y', onClick: () => handleOperator('^') },
    { label: 'π', onClick: () => handleInput(Math.PI.toString()) },
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="bg-muted p-4 rounded-lg text-right">
          <div className="text-muted-foreground text-xl h-8 truncate">{expression || '0'}</div>
          <div className="text-foreground text-5xl font-bold h-[60px] flex items-end justify-end truncate">{display}</div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-4 gap-2">
            {!isSci && basicButtons.map((btn, i) => (
              <CalculatorButton key={i} onClick={btn.onClick} className={btn.className} variant={btn.variant}>
                {btn.label}
              </CalculatorButton>
            ))}
            {isSci && <>
              {sciButtons.slice(0,5).map((btn, i) => (
                <CalculatorButton key={`sci-1-${i}`} onClick={btn.onClick} className={btn.className}>
                  {btn.label}
                </CalculatorButton>
              ))}
               <CalculatorButton onClick={handleAllClear} className='bg-muted text-foreground'>AC</CalculatorButton>
               <CalculatorButton onClick={handlePlusMinus} className='bg-muted text-foreground'><PlusMinus size={24} /></CalculatorButton>
               <CalculatorButton onClick={handlePercent} className='bg-muted text-foreground'><Percent size={24} /></CalculatorButton>
               <CalculatorButton onClick={() => handleOperator('÷')} variant='default'><Divide size={24} /></CalculatorButton>

               {sciButtons.slice(5, 9).map((btn, i) => (
                <CalculatorButton key={`sci-2-${i}`} onClick={btn.onClick} className={btn.className}>
                  {btn.label}
                </CalculatorButton>
              ))}
              <CalculatorButton onClick={() => handleOperator('×')} variant='default'><X size={24} /></CalculatorButton>
              
              <CalculatorButton onClick={() => handleInput('7')}>7</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('8')}>8</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('9')}>9</CalculatorButton>
              <CalculatorButton onClick={() => handleOperator('-')} variant='default'><Minus size={24} /></CalculatorButton>

              <CalculatorButton onClick={() => handleInput('4')}>4</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('5')}>5</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('6')}>6</CalculatorButton>
              <CalculatorButton onClick={() => handleOperator('+')} variant='default'><Plus size={24} /></CalculatorButton>

              <CalculatorButton onClick={() => handleInput('1')}>1</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('2')}>2</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('3')}>3</CalculatorButton>
              <CalculatorButton onClick={handleEquals} variant='default' className="row-span-2 h-auto">
                <Equal size={24} />
              </CalculatorButton>

              <CalculatorButton onClick={() => handleInput('0')} className="col-span-2">0</CalculatorButton>
              <CalculatorButton onClick={() => handleInput('.')}>.</CalculatorButton>
            </>}
          </div>

          <Button 
            variant="ghost" 
            className="w-full mt-2" 
            onClick={() => setIsSci(!isSci)}
          >
            <motion.div
              animate={{ rotate: isSci ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronUp className="mr-2 h-4 w-4" />
            </motion.div>
            {isSci ? 'Basic' : 'Scientific'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
