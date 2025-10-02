
"use client";

import React from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Rocket,
  Sparkles,
  Zap,
  CheckCircle,
  GitBranch,
  MessageSquare,
  Users,
  BookOpen,
  Shield,
  FileText,
  Mail,
  Flag,
  Icon as LucideIcon,
  ChevronDown,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useMaintenance } from '@/context/MaintenanceContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const roadmapIconMap: { [key: string]: LucideIcon } = {
  GitBranch,
  Sparkles,
};


const testimonials = [
    {
        quote: "This app is a lifesaver for my freelance work. The currency converter is always up-to-date, and the notes feature keeps everything in one place.",
        name: "Priya Sharma",
        location: "Mumbai"
    },
    {
        quote: "As a student, I use the calculator and unit converter daily. It's fast, accurate, and the interface is clean and easy to use.",
        name: "Rohan Kumar",
        location: "Delhi"
    },
    {
        quote: "The custom units feature is a game-changer for my niche projects. I can create my own conversions, saving me so much time.",
        name: "Anjali Gupta",
        location: "Bangalore"
    },
]

export function AboutPage() {
    const { maintenanceConfig } = useMaintenance();
    const { stats, ownerInfo, appInfo, roadmap } = maintenanceConfig.aboutPageContent;

    const founderImage = PlaceHolderImages.find(p => p.id === ownerInfo.photoId);

    return (
        <div className="w-full space-y-8 pb-12">
            <section className="text-center space-y-4">
                <div className="inline-block p-4 bg-accent/50 rounded-full">
                    <Rocket className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-primary">Sutradhaar</h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Sutradhaar is a modern, smart, and simple unit converter app built by Aman Yadav. It blends speed, accuracy, and elegant design to make your calculations effortless.
                </p>
            </section>
            
            <section className="grid grid-cols-2 gap-4 text-center">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-2xl font-bold">{stats.happyUsers}</p>
                        <p className="text-sm text-muted-foreground">Happy Users</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-2xl font-bold">{stats.calculationsDone}</p>
                        <p className="text-sm text-muted-foreground">Calculations Done</p>
                    </CardContent>
                </Card>
            </section>

            <section>
                 <Card>
                    <CardContent className="p-4">
                         <h2 className="font-semibold flex items-center gap-2 mb-3"><Zap className="h-5 w-5 text-primary" /> App Information</h2>
                         <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span>{appInfo.version}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Build</span><span>{appInfo.build}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Channel</span><span>{appInfo.channel}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">License</span><span>{appInfo.license}</span></div>
                         </div>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 text-pink-500" />
                        Release Plan & Roadmap
                    </h2>
                </div>
                 <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
                    {roadmap.map((item, index) => {
                        const ItemIcon = roadmapIconMap[item.icon] || GitBranch;
                        return (
                        <AccordionItem value={`item-${index}`} key={item.id} className="border-b-0">
                            <div className="flex">
                                <div className="flex flex-col items-center mr-4">
                                    <div>
                                        <div className={cn("w-4 h-4 rounded-full", index % 2 === 0 ? "bg-primary" : "bg-pink-500")} />
                                    </div>
                                    {index < roadmap.length - 1 && <div className="w-px h-full bg-border" />}
                                </div>
                                <div className="flex-1 pb-8">
                                    <AccordionTrigger className="w-full py-1 hover:no-underline">
                                        <div className="flex justify-between items-start w-full">
                                            <div className="text-left">
                                                <p className="font-semibold text-base">{item.title}</p>
                                                <p className="text-xs text-muted-foreground">{item.date}</p>
                                            </div>
                                            <Badge variant="outline" className="ml-4 shrink-0">{item.version}</Badge>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pt-4">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <div className="flex gap-2 items-center">
                                                    <span className="font-medium">Version:</span>
                                                    <Badge variant="outline">{item.version}</Badge>
                                                </div>
                                                 <div className="flex gap-2 items-center">
                                                    <span className="font-medium">Status:</span>
                                                    <Badge variant={item.status === 'completed' ? 'default' : 'secondary'} className={item.status === 'completed' ? 'bg-green-500/10 text-green-700 border-green-500/50' : ''}>{item.status}</Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1 mb-2">{item.description}</p>
                                            <ul className="text-sm text-muted-foreground space-y-1">
                                                {item.details.map((detail, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                                        {detail}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </AccordionContent>
                                </div>
                            </div>
                        </AccordionItem>
                    )})}
                </Accordion>
            </section>
            
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-center">What Our Users Say</h2>
                {testimonials.map((testimonial, index) => (
                    <Card key={index}>
                        <CardContent className="p-4 space-y-2">
                             <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                             <p className="font-semibold text-right text-primary">~ {testimonial.name}, {testimonial.location}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>

             <section className="space-y-4 text-center">
                 <h2 className="text-xl font-bold">Credits & Founder</h2>
                 <Avatar className="h-28 w-28 mx-auto border-4 border-primary/50">
                    {founderImage && <AvatarImage src={founderImage.imageUrl} alt={ownerInfo.name} />}
                    <AvatarFallback>AY</AvatarFallback>
                 </Avatar>
                 <div className='space-y-1'>
                    <p className="font-semibold flex items-center justify-center gap-2"><Users className="h-4 w-4 text-primary"/>{ownerInfo.name} - Founder & Engineer</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">"Hi, I'm Aman Yadav, the creator of Sutradhaar. My vision is to build a simple yet powerful productivity tool that helps people save time, focus better, and achieve more with ease."</p>
                 </div>
            </section>

            <section className="space-y-3">
                 <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><BookOpen className="h-5 w-5 text-primary" />Learn More</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                            <p>Updates</p>
                            <p>How to Use</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Shield className="h-5 w-5 text-primary" />Legal</h3>
                         <div className="text-sm text-muted-foreground space-y-1">
                            <p>Terms of Service</p>
                            <p>Privacy Policy</p>
                            <p>Open Source</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><MessageSquare className="h-5 w-5 text-primary" />Support</h3>
                        <div className="text-sm text-muted-foreground space-y-1">
                           <p className='flex items-center gap-2'><Mail className="h-4 w-4" />Contact Us</p>
                           <p className='flex items-center gap-2'><Flag className="h-4 w-4" />Report an Issue</p>
                        </div>
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}
