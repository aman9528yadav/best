

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
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useMaintenance } from '@/context/MaintenanceContext';
import { Badge } from '@/components/ui/badge';

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

            <section className="space-y-4">
                <h2 className="text-xl font-bold text-center">Release Plan & Roadmap</h2>
                 <Accordion type="single" collapsible className="w-full space-y-3" defaultValue="item-0">
                    {roadmap.map((item, index) => {
                        const ItemIcon = roadmapIconMap[item.icon] || GitBranch;
                        return (
                        <Card key={item.id} className="overflow-hidden">
                             <AccordionItem value={`item-${index}`} className="border-none">
                                <AccordionTrigger className="p-4 bg-accent/30 hover:no-underline data-[state=open]:bg-accent/50 data-[state=open]:border-b">
                                    <div className='flex items-center gap-3'>
                                        <ItemIcon className="h-4 w-4 text-primary" />
                                        <span className="font-semibold">{item.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="p-4 space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <div className="flex gap-2">
                                            <span className="font-medium">Version:</span>
                                            <Badge variant="outline">{item.version}</Badge>
                                        </div>
                                         <div className="flex gap-2">
                                            <span className="font-medium">Status:</span>
                                            <Badge variant={item.status === 'completed' ? 'default' : 'secondary'}>{item.status}</Badge>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{item.date}</p>
                                    <p className="text-sm text-muted-foreground mt-1 mb-2">{item.description}</p>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        {item.details.map((detail, i) => (
                                            <li key={i} className="flex items-center gap-2">
                                                <CheckCircle className="h-3 w-3 text-green-500" />
                                                {detail}
                                            </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Card>
                    )})}
                </Accordion>
                <Button variant="outline" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none">
                    <Sparkles className="mr-2 h-4 w-4"/> Click for WOW!
                </Button>
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
