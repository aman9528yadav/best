
"use client";

import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface WelcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dontShowAgain: boolean) => void;
  title: string;
  description: string;
}

export function WelcomeDialog({ open, onOpenChange, onConfirm, title, description }: WelcomeDialogProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleConfirm = () => {
    onConfirm(dontShowAgain);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2">
          <Checkbox id="dont-show-again" checked={dontShowAgain} onCheckedChange={(checked) => setDontShowAgain(!!checked)} />
          <Label htmlFor="dont-show-again">Don't show this again</Label>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleConfirm}>Got it!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
