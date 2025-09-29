
"use client";

import React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

import {
  Phone,
  MapPin,
  Cake,
  Star,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Mail,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const InputField = ({ icon: Icon, label, id, value, placeholder }: { icon: React.ElementType, label: string, id: string, value: string, placeholder?: string }) => (
    <div className="space-y-2">
        <Label htmlFor={id} className="flex items-center gap-2 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </Label>
        <Input id={id} defaultValue={value} placeholder={placeholder} />
    </div>
);

export function EditProfilePage() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

    return (
        <div className="w-full space-y-6 pb-12">
            <Card className="shadow-lg">
                <CardContent className="p-6 text-center space-y-4">
                     <h1 className="text-2xl font-bold">Edit Profile</h1>
                     <p className="text-sm text-muted-foreground">Update your personal information and security settings.</p>

                    <Tabs defaultValue="account" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-accent/50">
                            <TabsTrigger value="account">Account</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="note-pass">Note Pass</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account" className="pt-6">
                            <div className="flex flex-col items-center space-y-4">
                                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Aman Yadav" />}
                                    <div className="h-full w-full rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-primary-foreground">A</span>
                                    </div>
                                </Avatar>
                                <Button variant="link" className="text-primary">Change Photo</Button>
                            </div>
                            
                            <div className="space-y-6 text-left mt-8">
                                 <div className="space-y-2">
                                    <Label htmlFor="full-name">Full Name</Label>
                                    <Input id="full-name" defaultValue="Aman Yadav" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">Email</Label>
                                    <Input id="email" defaultValue="amanyadavyadav9458@gmail.com" readOnly className="bg-muted/50" />
                                </div>
                                
                                <InputField icon={Phone} label="Phone Number" id="phone" value="+91 7037652730" />
                                <InputField icon={MapPin} label="Address" id="address" value="Manirampur bewar" />

                                <div className="space-y-2">
                                    <Label htmlFor="dob" className="flex items-center gap-2 text-muted-foreground"><Cake className="h-4 w-4" />Date of Birth</Label>
                                    <Input id="dob" type="text" defaultValue="December 5th, 2025" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="skills" className="flex items-center gap-2 text-muted-foreground"><Star className="h-4 w-4" />Skills & Interests</Label>
                                    <Textarea id="skills" defaultValue="React, developed" />
                                </div>

                                <InputField icon={Linkedin} label="LinkedIn" id="linkedin" value="65vf" />
                                <InputField icon={Twitter} label="Twitter" id="twitter" value="hjjkkk" />
                                <InputField icon={Github} label="GitHub" id="github" value="hhgg" />
                                <InputField icon={Instagram} label="Instagram" id="instagram" value="yygcfcnmm" />

                                <Button size="lg" className="w-full">Save Changes</Button>
                            </div>
                        </TabsContent>
                    </Tabs>

                </CardContent>
            </Card>

             <div className="text-center text-xs text-muted-foreground pt-4">
                © 2025 Sutradhar | Owned by Aman Yadav.
            </div>

        </div>
    );
}
