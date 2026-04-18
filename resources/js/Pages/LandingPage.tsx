import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import Layout from '@/Layouts/DefaultLayout';
import CTABanner from '@/Components/CTABanner';
import PkmMapDashboardCard from '@/Components/PkmMapDashboardCard';
import TestimonialSection from '@/Components/TestimonialSection';

import { resolvePublicPkmData } from '@/data/sigapData';
import { PkmData, TestimoniItem } from '@/types';
import '../../css/landing.css';

interface LandingPageProps {
    pkmData?: PkmData[] | null;
    publicPkmData?: PkmData[] | null;
    testimonials?: TestimoniItem[] | null;
}

export default function LandingPage({
    pkmData: serverPkmData = null,
    publicPkmData = null,
    testimonials = [],
}: LandingPageProps) {
    const pkmData = useMemo(() => resolvePublicPkmData(publicPkmData ?? serverPkmData), [publicPkmData, serverPkmData]);

    return (
        <Layout mainClassName="site-main-content" mainStyle={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
            <Head title="Beranda" />
            <div className="max-w-7xl mx-auto w-full px-3 sm:px-4 md:px-6 flex-1 flex flex-col py-4 sm:py-6 md:py-8 gap-6 sm:gap-8 md:gap-10">
                <PkmMapDashboardCard pkmData={pkmData} watchKey="landing-map" />
                <TestimonialSection testimonials={testimonials || []} />
                <CTABanner />
            </div>
        </Layout>
    );
}
