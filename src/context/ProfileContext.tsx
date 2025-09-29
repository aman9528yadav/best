
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthday: string;
  skills: string[];
  socialLinks: {
    linkedin: string;
    twitter: string;
    github: string;
    instagram: string;
  };
};

type ProfileContextType = {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const getInitialProfile = (): UserProfile => {
  return {
    name: "Aman Yadav",
    email: "amanyadavyadav9458@gmail.com",
    phone: "+91 7037652730",
    address: "Manirampur bewar",
    birthday: "December 5th, 2025",
    skills: ["React", "developed"],
    socialLinks: {
      linkedin: "#",
      twitter: "#",
      github: "#",
      instagram: "#",
    },
  };
};

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [profile, setProfileState] = useState<UserProfile>(getInitialProfile());

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('unitwise_profile');
      if (savedProfile) {
        setProfileState(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error("Failed to load profile from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  const setProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    if (isLoaded) {
      try {
        localStorage.setItem('unitwise_profile', JSON.stringify(newProfile));
      } catch (error) {
        console.error("Failed to save profile to localStorage", error);
      }
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
