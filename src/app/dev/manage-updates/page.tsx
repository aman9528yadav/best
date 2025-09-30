
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Icon as LucideIcon,
  Wrench,
  Rocket,
  User,
  Languages,
  Bug,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMaintenance, UpdateItem } from '@/context/MaintenanceContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const iconMap: { [key: string]: LucideIcon } = {
  Wrench,
  Rocket,
  User,
  Languages,
  Bug,
};

const iconOptions: UpdateItem['icon'][] = ['Wrench', 'Rocket', 'User', 'Languages', 'Bug'];

const UpdateForm = ({
  item,
  onSave,
  onCancel,
}: {
  item: Omit<UpdateItem, 'id'> | UpdateItem;
  onSave: (item: Omit<UpdateItem, 'id'> | UpdateItem) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(item);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (value: UpdateItem['icon']) => {
    setFormData((prev) => ({ ...prev, icon: value }));
  };
  
  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, tags: e.target.value.split(',').map(s => s.trim()) }));
  }

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{'id' in item ? 'Edit' : 'Add'} Update</DialogTitle>
        <DialogDescription>
          Fill in the details for the "What's New" item.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">
            Title
          </Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">
            Date
          </Label>
          <Input id="date" name="date" value={formData.date} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="icon" className="text-right">
            Icon
          </Label>
          <Select value={formData.icon} onValueChange={handleIconChange}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select an icon" />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((iconName) => {
                const IconComponent = iconMap[iconName];
                return (
                  <SelectItem key={iconName} value={iconName}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-4 w-4" />
                      <span>{iconName}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="tags" className="text-right">
            Tags
          </Label>
          <Input id="tags" name="tags" value={formData.tags.join(', ')} onChange={handleTagsChange} className="col-span-3" placeholder="e.g. New Feature, Beta 1.3"/>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogFooter>
    </>
  );
};

export default function ManageUpdatesPage() {
  const router = useRouter();
  const { maintenanceConfig, addUpdateItem, editUpdateItem, deleteUpdateItem } = useMaintenance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UpdateItem | null>(null);

  const handleAddNew = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: UpdateItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleSave = (itemData: Omit<UpdateItem, 'id'> | UpdateItem) => {
    if ('id' in itemData) {
      editUpdateItem(itemData);
    } else {
      addUpdateItem(itemData);
    }
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this update item?')) {
        deleteUpdateItem(id);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-[412px] flex flex-col flex-1">
        <div className="flex items-center justify-between gap-4 mb-6 pt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-9 w-9"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Manage Updates</h1>
            </div>
          </div>
          <Button
            size="icon"
            className="rounded-full h-9 w-9"
            onClick={handleAddNew}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <main className="flex-1 space-y-4 pb-12">
          {maintenanceConfig.updateItems.map((item) => {
            const ItemIcon = iconMap[item.icon] || Bug;
            return (
              <Card key={item.id}>
                <CardContent className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3 flex-1">
                        <ItemIcon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                            {item.date}
                        </p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(item)}
                        >
                        <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(item.id)}
                        >
                        <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <UpdateForm
            item={
              editingItem || {
                title: '',
                date: '',
                description: '',
                icon: 'Bug',
                tags: [],
              }
            }
            onSave={handleSave}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingItem(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
