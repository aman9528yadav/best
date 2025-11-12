

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronUp, Divide, Equal, Minus, Plus, X, Percent, Baseline, History, Undo2, Trash2, Volume2, VolumeX, Delete, Maximize, Minimize } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProfile, CalculatorHistoryItem } from '@/context/ProfileContext';
import Link from 'next/link';

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
}) => {
    const [calculatorSounds, setCalculatorSounds] = useState(false);
    
    useEffect(() => {
        const soundsEnabled = localStorage.getItem('sutradhaar_calculator_sounds') === 'true';
        setCalculatorSounds(soundsEnabled);
        
        const handleStorageChange = () => {
            const soundsEnabled = localStorage.getItem('sutradhaar_calculator_sounds-page.tsx') === 'true';
            setCalculatorSounds(soundsEnabled);
        }
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const playSound = () => {
        if (calculatorSounds) {
            const audio = new Audio('/sound/keyboard-click-327728.mp3');
            audio.play().catch(e => console.error("Failed to play sound", e));
        }
    };
    
    const handleClick = () => {
        playSound();
        onClick();
    }
  
  return (
    <Button
        variant={variant}
        className={`h-16 text-2xl rounded-xl ${className}`}
        onClick={handleClick}
    >
        {children}
    </Button>
  );
};

export function Calculator({ onToggleFullScreen, isFullScreen }: { onToggleFullScreen: () => void, isFullScreen?: boolean }) {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [isSci, setIsSci] = useState(false);
  const { profile, addCalculatorToHistory, deleteHistoryItem } = useProfile();
  const { history } = profile;
  const [calculatorSounds, setCalculatorSounds] = useState(false);
  
  useEffect(() => {
    const soundsEnabled = localStorage.getItem('sutradhaar_calculator_sounds-page.tsx') === 'true';
    setCalculatorSounds(soundsEnabled);
  }, []);

  const toggleSounds = () => {
    const newSoundsState = !calculatorSounds;
    setCalculatorSounds(newSoundsState);
    localStorage.setItem('sutradhaar_calculator_sounds-page.tsx', String(newSoundsState));
     // This is to notify other components that might be listening to this value
    window.dispatchEvent(new Event('storage'));
  };

  const handleInput = (value: string) => {
    if (display === 'Error') {
      setDisplay(value);
      setExpression(value);
      return;
    }
    // If current display is an operator, replace it
    if (['+', '-', '×', '÷', '^'].includes(display) || expression.endsWith('(')) {
       setDisplay(value);
    } else if (display === '0' && value !== '.') {
      setDisplay(value);
    } else {
      setDisplay(display + value);
    }
    setExpression(expression + value);
  };

  const handleOperator = (op: string) => {
    if (display === 'Error') return;
    const lastChar = expression.slice(-1);
    if (['+', '-', '×', '÷', '^'].includes(lastChar)) {
      setExpression(expression.slice(0, -1) + op);
    } else if (expression !== '' && expression.slice(-1) !== '(') {
      setExpression(expression + op);
    }
    setDisplay(op);
  };
  
  const evaluateExpression = (expr: string): number => {
    // Handle expressions ending with operators by removing them
    let sanitizedExpr = expr.replace(/×/g, '*').replace(/÷/g, '/');
    while (['*', '/', '+', '-'].includes(sanitizedExpr.slice(-1))) {
        sanitizedExpr = sanitizedExpr.slice(0, -1);
    }

    const scientificExpr = sanitizedExpr.replace(/(\d+(\.\d+)?)\s*\^\s*(\d+(\.\d+)?)/g, 'Math.pow($1, $3)');
    const funcExpr = scientificExpr
        .replace(/sin\(([^)]+)\)/g, (match, p1) => `Math.sin((${p1}) * Math.PI / 180)`)
        .replace(/cos\(([^)]+)\)/g, (match, p1) => `Math.cos((${p1}) * Math.PI / 180)`)
        .replace(/tan\(([^)]+)\)/g, (match, p1) => `Math.tan((${p1}) * Math.PI / 180)`)
        .replace(/log\(([^)]+)\)/g, 'Math.log10($1)')
        .replace(/ln\(([^)]+)\)/g, 'Math.log($1)')
        .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');

    try {
      // Balance parentheses before evaluation
      const openParen = (funcExpr.match(/\(/g) || []).length;
      const closeParen = (funcExpr.match(/\)/g) || []).length;
      const finalExpr = funcExpr + ')'.repeat(openParen - closeParen);

      return new Function('return ' + finalExpr)();
    } catch (e) {
      console.error("Calculation Error:", e);
      throw new Error("Invalid Expression");
    }
  };


  const handleEquals = () => {
    if (display === 'Error' || expression === '') return;
    try {
      const currentExpression = expression;
      const result = evaluateExpression(currentExpression);
      const finalResult = Number(result.toPrecision(15));
      
      addCalculatorToHistory({
        expression: currentExpression,
        result: finalResult.toString(),
      });

      setDisplay(finalResult.toString());
      setExpression(finalResult.toString());
    } catch (error) {
      setDisplay('Error');
      setExpression('');
    }
  };

  const handleAllClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleBackspace = () => {
    if (display === 'Error' || display === '0') return;

    // Don't backspace if display is a result of an operation or a function
    if (['+', '-', '×', '÷', '^'].includes(display) || display.endsWith('(')) {
        return;
    }
    
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    setExpression(prev => prev.length > 1 ? prev.slice(0, -1) : '');
  };


  const handlePlusMinus = () => {
    if (display === 'Error' || display === '0' || ['+', '-', '×', '÷'].includes(display)) return;
    
    // Find the last number entered
    const operators = /([+\-×÷^])/;
    const parts = expression.split(operators);
    const lastPart = parts.pop() || '';
    
    if (lastPart && !isNaN(parseFloat(lastPart))) {
        const newLastPart = (parseFloat(lastPart) * -1).toString();
        const newExpression = parts.join('') + newLastPart;
        
        setExpression(newExpression);
        setDisplay(newLastPart);
    }
  };
  
  const handlePercent = () => {
    if (display === 'Error') return;
    try {
        const value = parseFloat(display);
        if(!isNaN(value)) {
            const result = value / 100;
            setDisplay(result.toString());

            const operators = /([+\-×÷^])/;
            const parts = expression.split(operators);
            const lastPart = parts[parts.length - 1];
            if (!isNaN(parseFloat(lastPart))) {
                 const newExpression = expression.slice(0, expression.length - lastPart.length) + result.toString();
                 setExpression(newExpression);
            }
        }
    } catch (e) {
      setDisplay('Error');
      setExpression('');
    }
  };

  const handleSciFunction = (func: string) => {
    if (display === 'Error') {
        setDisplay(`${func}(`);
        setExpression(`${func}(`);
        return;
    }

    const currentDisplayIsOperator = ['+', '-', '×', '÷', '^'].includes(display);
    
    if (display === '0' || currentDisplayIsOperator || expression.endsWith('(')) {
        setDisplay(`${func}(`);
        if (display === '0' && expression ==='0') {
             setExpression(`${func}(`);
        } else if (currentDisplayIsOperator || expression.endsWith('(')) {
             setExpression(expression + `${func}(`);
        } else {
            setExpression(`${func}(`);
        }
    } else {
        setExpression(expression + `${func}(`);
        setDisplay(`${func}(`);
    }
};

  const handleRestoreHistory = (item: CalculatorHistoryItem) => {
    setExpression(item.expression);
    setDisplay(item.result);
  };

  const basicButtons = [
    { label: 'AC', onClick: handleAllClear, className: 'bg-muted text-foreground' },
    { label: <Baseline size={24} />, onClick: handlePlusMinus, className: 'bg-muted text-foreground' },
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

  const SciPad = () => (
    <div className="grid grid-cols-5 gap-2">
      {sciButtons.map((btn, i) => (
        <CalculatorButton key={`sci-${i}`} onClick={btn.onClick} className="h-12 text-lg">
          {btn.label}
        </CalculatorButton>
      ))}
    </div>
  );

  const calculatorHistory = history
    .filter(item => item.type === 'calculator')
    .slice(0, 3) as CalculatorHistoryItem[];


  return (
    <div className="w-full space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="bg-muted p-4 rounded-lg text-right relative">
            <div className='flex justify-between items-center'>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={toggleSounds}>
                      {calculatorSounds ? <Volume2 className="h-5 w-5"/> : <VolumeX className="h-5 w-5"/>}
                    </Button>
                     <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onToggleFullScreen}>
                      {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                    </Button>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleBackspace}>
                    <Delete className="h-5 w-5" />
                </Button>
            </div>
            <div className="text-muted-foreground text-xl h-8 truncate">{expression || '0'}</div>
            <div className="text-foreground text-5xl font-bold h-[60px] flex items-end justify-end truncate">{display}</div>
          </div>

          <div className="relative">
            <motion.div
              initial={false}
              animate={{ height: isSci ? 'auto' : 0, opacity: isSci ? 1 : 0 }}
              className="overflow-hidden"
            >
              <SciPad />
              <div className='h-2'></div>
            </motion.div>

            <div className="grid grid-cols-4 gap-2">
              {basicButtons.map((btn, i) => (
                <CalculatorButton key={i} onClick={btn.onClick} className={btn.className} variant={btn.variant}>
                  {btn.label}
                </CalculatorButton>
              ))}
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
      
      {!isFullScreen && calculatorHistory.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2"><History className='h-5 w-5 text-muted-foreground' />Recent Calculations</h3>
              <Button asChild variant="link" className="text-primary pr-0">
                <Link href="/history">See All</Link>
              </Button>
            </div>
            <ul className="space-y-1">
              {calculatorHistory.map((item) => (
                <li key={item.id} className="p-2 rounded-lg bg-accent flex justify-between items-center text-sm text-accent-foreground">
                    <div className='flex flex-col text-right w-full items-end'>
                       <span className='text-xs text-muted-foreground'>{item.expression}</span>
                       <span className="font-semibold text-lg">{item.result}</span>
                    </div>
                    <div className="flex items-center pl-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleRestoreHistory(item)}>
                        <Undo2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteHistoryItem(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
