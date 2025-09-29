
"use client";

import React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Phone,
  MapPin,
  Cake,
  Globe,
  Palette,
  Shield,
  History,
  Star,
  BookText,
  TrendingUp,
  Linkedin,
  Twitter,
  Github,
  Instagram,
  Pencil,
  Settings,
  Share2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex justify-between items-center text-sm py-3 border-b border-border/50">
        <div className="flex items-center gap-3 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </div>
        <span className="font-medium text-foreground">{value}</span>
    </div>
);

const QuickActionButton = ({ icon: Icon, label }: { icon: React.ElementType, label: string }) => (
    <Button variant="outline" className="flex-1 bg-accent/50 border-none justify-start gap-2 py-5">
        <Icon className="h-4 w-4 text-primary" />
        <span className="font-medium">{label}</span>
    </Button>
);

export function ProfilePage() {
    const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

    return (
        <div className="w-full space-y-6 pb-12">
            <Card className="shadow-lg overflow-visible">
                <CardContent className="p-6 text-center relative">
                     <Button asChild variant="outline" size="sm" className="absolute top-4 right-4 gap-2">
                        <Link href="/profile/edit">
                            <Pencil className="h-3 w-3" />
                            Edit Profile
                        </Link>
                     </Button>
                    <div className="flex justify-center mb-4 pt-8">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Aman Yadav" />}
                            <div className="h-full w-full rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                                <span className="text-4xl font-bold text-primary-foreground">A</span>
                            </div>
                        </Avatar>
                        <div className="absolute bottom-5 right-[calc(50%-2.7rem)] transform translate-x-1/2 bg-primary rounded-full p-1.5 shadow-md">
                            <Heart className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">Aman Yadav</h2>
                        <div className="flex items-center justify-center gap-2">
                             <Badge variant="outline" className="border-yellow-500 text-yellow-500">Owner</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">amanyadavyadav9458@gmail.com</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 space-y-1">
                   <DetailItem icon={Phone} label="Phone" value="+91 7037652730" />
                   <DetailItem icon={MapPin} label="Address" value="Manirampur bewar" />
                   <DetailItem icon={Cake} label="Birthday" value="December 5th" />
                </CardContent>
            </Card>
            
            <Card>
                <CardContent className="p-4 space-y-1">
                   <DetailItem icon={Globe} label="Default Region" value="International" />
                   <DetailItem icon={Palette} label="Theme" value="Sutradhaar" />
                   <div className="flex justify-between items-center text-sm py-3">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <History className="h-4 w-4" />
                            <span>Save History</span>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
                <QuickActionButton icon={Globe} label="Region" />
                <QuickActionButton icon={Shield} label="Security" />
                <QuickActionButton icon={Palette} label="Theme" />
                <QuickActionButton icon={History} label="History" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <Card>
                    <CardContent className="p-3">
                        <div className="text-xl font-bold">34</div>
                        <div className="text-xs text-muted-foreground">Conversions</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3">
                        <div className="text-xl font-bold">3</div>
                        <div className="text-xs text-muted-foreground">Notes</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3">
                        <div className="text-xl font-bold">3</div>
                        <div className="text-xs text-muted-foreground">Days Active</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-4">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <Star className="h-5 w-5 text-primary" />
                        Achievements
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 bg-accent/50 p-3 rounded-lg">
                           <Star className="h-5 w-5 text-yellow-500 fill-yellow-400"/>
                           <span className="font-medium text-sm">Verified User</span>
                        </div>
                        <div className="flex items-center gap-3 bg-accent/50 p-3 rounded-lg">
                           <Star className="h-5 w-5 text-purple-500 fill-purple-400"/>
                           <span className="font-medium text-sm">Premium Member</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                 <CardContent className="p-4">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <Pencil className="h-5 w-5 text-primary" />
                        Skills & Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <Badge>React</Badge>
                        <Badge>developed</Badge>
                    </div>
                 </CardContent>
            </Card>
            
            <Card>
                 <CardContent className="p-4">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                       Social Links
                    </h3>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <a href="#" className="flex items-center gap-1.5 hover:text-primary"><Linkedin className="h-4 w-4" /> <span className='text-sm'>LinkedIn</span></a>
                        <a href="#" className="flex items-center gap-1.5 hover:text-primary"><Twitter className="h-4 w-4" /> <span className='text-sm'>Twitter</span></a>
                        <a href="#" className="flex items-center gap-1.5 hover:text-primary"><Github className="h-4 w-4" /> <span className='text-sm'>GitHub</span></a>
                        <a href="#" className="flex items-center gap-1.5 hover:text-primary"><Instagram className="h-4 w-4" /> <span className='text-sm'>Instagram</span></a>
                    </div>
                 </CardContent>
            </Card>

             <div className="text-center text-xs text-muted-foreground pt-4">
                © 2025 Sutradhar | Owned by Aman Yadav.
            </div>

        </div>
    );
}
