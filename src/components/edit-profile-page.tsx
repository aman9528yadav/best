

"use client";

import React, { useState, useRef } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Phone,
  MapPin,
  Cake,
  Star,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';


const InputField = ({ icon: Icon, label, id, value, placeholder, onChange, type = 'text' }: { icon?: React.ElementType, label: string, id: string, value: string, placeholder?: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }) => (
    <div className="space-y-2">
        <Label htmlFor={id} className="flex items-center gap-2 text-muted-foreground">
            {Icon && <Icon className="h-4 w-4" />}
            <span>{label}</span>
        </Label>
        <Input id={id} name={id} value={value} onChange={onChange} type={type} placeholder={placeholder} />
    </div>
);

const PasswordField = ({ label, id, value, onChange }: { label: string, id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
    const [visible, setVisible] = useState(false);
    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <div className="relative">
                <Input id={id} name={id} value={value} onChange={onChange} type={visible ? 'text' : 'password'} />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground" onClick={() => setVisible(!visible)}>
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
};

export function EditProfilePage() {
    const { profile, setProfile, deleteAllUserData } = useProfile();
    const { changePassword, logout } = useAuth();
    const [formData, setFormData] = useState(profile);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const { toast } = useToast();
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
            };
            reader.readAsDataURL(file);
        }
    };


    const handleSaveChanges = () => {
        setProfile(formData);
        toast({
            title: "Profile Updated",
            description: "Your changes have been saved successfully.",
        });
        router.push('/profile');
    };
    
    const handleChangePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { currentPassword, newPassword, confirmPassword } = passwordData;
        if (newPassword !== confirmPassword) {
            toast({ title: "Passwords do not match", variant: "destructive" });
            return;
        }
        if (newPassword.length < 6) {
            toast({ title: "Password is too short", description: "Password must be at least 6 characters.", variant: "destructive" });
            return;
        }

        const success = await changePassword(currentPassword, newPassword);
        if (success) {
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }
    };
    
    const handleDeleteData = async () => {
        await deleteAllUserData();
        logout();
        toast({
            title: "All Data Deleted",
            description: "Your profile and history have been permanently removed.",
        });
    }

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
                                     <AvatarImage src={formData.photoUrl} alt="User Avatar" />
                                    <div className="h-full w-full rounded-full bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-primary-foreground">{profile.name.charAt(0)}</span>
                                    </div>
                                </Avatar>
                                 <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                                <Button variant="link" className="text-primary" onClick={handleAvatarClick}>Change Photo</Button>
                            </div>
                            
                            <div className="space-y-6 text-left mt-8">
                                 <InputField label="Full Name" id="name" value={formData.name} onChange={handleChange} />
                                
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2 text-muted-foreground">Email</Label>
                                    <Input id="email" value={formData.email} readOnly className="bg-muted/50" />
                                </div>
                                
                                <InputField icon={Phone} label="Phone Number" id="phone" value={formData.phone} onChange={handleChange} />
                                <InputField icon={MapPin} label="Address" id="address" value={formData.address} onChange={handleChange} />

                                <div className="space-y-2">
                                    <Label htmlFor="dob" className="flex items-center gap-2 text-muted-foreground"><Cake className="h-4 w-4" />Date of Birth</Label>
                                    <Input id="birthday" name="birthday" type="text" value={formData.birthday} onChange={handleChange} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="skills" className="flex items-center gap-2 text-muted-foreground"><Star className="h-4 w-4" />Skills & Interests</Label>
                                    <Textarea id="skills" name="skills" value={formData.skills.join(', ')} onChange={(e) => setFormData(prev => ({...prev, skills: e.target.value.split(',').map(s => s.trim())}))} />
                                </div>

                                <Button size="lg" className="w-full" onClick={handleSaveChanges}>Save Changes</Button>
                            </div>
                        </TabsContent>
                         <TabsContent value="security" className="pt-6 text-left">
                            <div className="space-y-6">
                                <form className="space-y-6" onSubmit={handleChangePasswordSubmit}>
                                    <h3 className="text-lg font-semibold">Change Password</h3>
                                    <PasswordField label="Current Password" id="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} />
                                    <PasswordField label="New Password" id="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} />
                                    <PasswordField label="Confirm New Password" id="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} />
                                    <Button size="lg" type="submit" className="w-full">Change Password</Button>
                                </form>

                                <div className="space-y-4 pt-4 border-t">
                                     <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full gap-2">
                                                <Trash2 className="h-4 w-4" />
                                                Delete All Data
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action is irreversible. All your profile information, history, notes, and settings will be permanently deleted from our servers and your device.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteData}>Yes, delete everything</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
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
