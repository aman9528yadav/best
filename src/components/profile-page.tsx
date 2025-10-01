
"use client";

import React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
  LogOut,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useProfile } from '@/context/ProfileContext';
import { useHistory } from '@/context/HistoryContext';
import { useAuth } from '@/context/AuthContext';

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex justify-between items-center text-sm py-3 border-b border-border/50">
        <div className="flex items-center gap-3 text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </div>
        <span className="font-medium text-foreground">{value}</span>
    </div>
);

const QuickActionButton = ({ icon: Icon, label, href }: { icon: React.ElementType, label: string, href?: string }) => {
    const content = (
         <Button variant="outline" className="flex-1 bg-accent/50 border-none justify-start gap-2 py-5">
            <Icon className="h-4 w-4 text-primary" />
            <span className="font-medium">{label}</span>
        </Button>
    );
    return href ? <Link href={href}>{content}</Link> : content;
};

export function ProfilePage() {
    const { profile } = useProfile();
    const { history } = useHistory();
    const { user, logout } = useAuth();
    
    const { allTimeActivities = 0, daysActive = 0 } = profile.stats || {};
    const totalNotes = profile.notes.filter(n => !n.isTrashed).length;


    const displayName = user?.displayName || profile.name;
    const displayEmail = user?.email || profile.email;
    const displayAvatar = user?.photoURL;
    const avatarFallback = displayName.charAt(0).toUpperCase();

    const isOwner = displayEmail === 'amanyadavyadav9458@gmail.com';

    return (
        <div className="w-full space-y-6 pb-12">
            <Card className="shadow-lg overflow-visible">
                <CardContent className="p-6 text-center relative">
                     <div className="absolute top-4 right-4 flex gap-2">
                        <Button asChild variant="outline" size="sm" className="gap-2">
                            <Link href="/profile/edit">
                                <Pencil className="h-3 w-3" />
                                Edit
                            </Link>
                        </Button>
                        {user && (
                            <Button variant="destructive" size="sm" className="gap-2" onClick={logout}>
                                <LogOut className="h-3 w-3" />
                                Logout
                            </Button>
                        )}
                     </div>
                    <div className="flex justify-center mb-4 pt-8">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                            {displayAvatar ? <AvatarImage src={displayAvatar} alt={displayName} /> : (
                                <div className="h-full w-full rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                                    <span className="text-4xl font-bold text-primary-foreground">{avatarFallback}</span>
                                </div>
                            )}
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold">{displayName}</h2>
                        <div className="flex items-center justify-center gap-2">
                            {isOwner ? (
                                <Badge variant="outline" className="border-yellow-500 text-yellow-500">Owner</Badge>
                            ) : (
                                <Badge variant="secondary">Member</Badge>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground">{displayEmail}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-4 space-y-1">
                   <DetailItem icon={Phone} label="Phone" value={profile.phone} />
                   <DetailItem icon={MapPin} label="Address" value={profile.address} />
                   <DetailItem icon={Cake} label="Birthday" value={profile.birthday} />
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 gap-3">
                <QuickActionButton icon={Globe} label="Region" />
                <QuickActionButton icon={Shield} label="Security" />
                <QuickActionButton icon={Palette} label="Theme" />
                <QuickActionButton icon={History} label="History" href="/history" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <Card>
                    <CardContent className="p-3">
                        <div className="text-xl font-bold">{allTimeActivities}</div>
                        <div className="text-xs text-muted-foreground">Activities</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3">
                        <div className="text-xl font-bold">{totalNotes}</div>
                        <div className="text-xs text-muted-foreground">Notes</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-3">
                        <div className="text-xl font-bold">{daysActive}</div>
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
                        {profile.skills.map(skill => <Badge key={skill}>{skill}</Badge>)}
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
                        <a href={profile.socialLinks.linkedin} className="flex items-center gap-1.5 hover:text-primary"><Linkedin className="h-4 w-4" /> <span className='text-sm'>LinkedIn</span></a>
                        <a href={profile.socialLinks.twitter} className="flex items-center gap-1.5 hover:text-primary"><Twitter className="h-4 w-4" /> <span className='text-sm'>Twitter</span></a>
                        <a href={profile.socialLinks.github} className="flex items-center gap-1.5 hover:text-primary"><Github className="h-4 w-4" /> <span className='text-sm'>GitHub</span></a>
                        <a href={profile.socialLinks.instagram} className="flex items-center gap-1.5 hover:text-primary"><Instagram className="h-4 w-4" /> <span className='text-sm'>Instagram</span></a>
                    </div>
                 </CardContent>
            </Card>

             <div className="text-center text-xs text-muted-foreground pt-4">
                © 2025 Sutradhar | Owned by Aman Yadav.
            </div>

        </div>
    );
}
