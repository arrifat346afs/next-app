"use client"
import { ArrowRight, Github, Sparkles, Twitter } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import FooterSection from '../footer';

export default function Footer() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm();

    const onSubmit = async (data: any) => {
        // Handle newsletter submission
        console.log(data);
        reset();
    };

    const links = {
        product: [
            { name: 'Features', href: '/features' },
            { name: 'Documentation', href: '/docs' },
            { name: 'Examples', href: '/examples' },
            { name: 'Pricing', href: '/pricing' },
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '/blog' },
            { name: 'Careers', href: '/careers' },
            { name: 'Contact', href: '/contact' },
        ],
        legal: [
            { name: 'Privacy', href: '/privacy' },
            { name: 'Terms', href: '/terms' },
            { name: 'License', href: '/license' },
        ],
    };

    return (
        <footer className="border-t">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                <FooterSection/>
            </div>
        </footer>
    );
}
