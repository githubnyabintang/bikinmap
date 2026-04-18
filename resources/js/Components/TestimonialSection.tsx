import React from 'react';
import { TestimoniItem } from '@/types';

interface TestimonialSectionProps {
    testimonials: TestimoniItem[];
}

export default function TestimonialSection({ testimonials }: TestimonialSectionProps) {
    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className="py-12 bg-slate-50/50 border-y border-slate-100 my-4 rounded-[40px]">
            <div className="max-w-7xl mx-auto px-6 sm:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="max-w-xl">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-poltekpar-primary/10 text-poltekpar-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            Suara Masyarakat
                        </span>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                            Apa Kata <span className="text-poltekpar-primary">Masyarakat?</span>
                        </h2>
                        <p className="mt-4 text-slate-500 font-medium text-lg text-balance">
                            Feedback berharga dari para peserta kegiatan Pengabdian Kepada Masyarakat (PKM).
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <a 
                                href="/evaluasi" 
                                className="inline-flex items-center gap-2.5 px-6 py-3 bg-poltekpar-primary text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-poltekpar-navy hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                <i className="fa-solid fa-pen-to-square"></i>
                                Berikan Feedback
                            </a>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-3 text-slate-400 font-bold text-sm bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 transition-all hover:text-poltekpar-primary">
                        <i className="fa-solid fa-arrow-left-long animate-bounce-x-reverse"></i>
                        <span className="tracking-wide">Geser Kartu</span>
                        <i className="fa-solid fa-arrow-right-long animate-bounce-x"></i>
                    </div>
                </div>

                {/* Slider Container */}
                <div className="relative group">
                    <div className="flex overflow-x-auto pb-10 gap-6 snap-x snap-mandatory scrollbar-hide custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 items-stretch">
                        {testimonials.map((item, index) => (
                            <div 
                                key={index} 
                                className="flex-none w-[260px] sm:w-[320px] snap-start bg-white rounded-[32px] p-6 sm:p-7 border border-slate-100 shadow-lg shadow-slate-200/30 hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1.5 transition-all duration-500 flex flex-col group/card"
                            >
                                {/* Header: Rating & Quote Icon */}
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-0.5 text-amber-400">
                                        {[...Array(5)].map((_, i) => (
                                            <i 
                                                key={i} 
                                                className={`fa-solid fa-star text-[10px] ${i < item.rating ? '' : 'text-slate-100'}`}
                                            ></i>
                                        ))}
                                    </div>
                                    <i className="fa-solid fa-quote-right text-slate-100 text-2xl group-hover/card:text-blue-50 transition-colors"></i>
                                </div>

                                {/* Content */}
                                <div className="flex-1 mb-6">
                                    <p className="text-slate-600 italic leading-relaxed text-xs sm:text-sm font-medium line-clamp-6">
                                        "{item.pesan_ulasan || 'Layanan yang sangat memuaskan dan bermanfaat.'}"
                                    </p>
                                </div>
                                
                                {/* Footer: Identity */}
                                <div className="pt-6 border-t border-slate-50 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-black text-base border-2 border-white shadow-inner group-hover/card:from-poltekpar-primary group-hover/card:to-poltekpar-navy group-hover/card:text-white transition-all duration-500">
                                        {item.nama_pemberi.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-black text-slate-900 truncate">
                                            {item.nama_pemberi}
                                        </h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate">
                                            {(item as any).asal_instansi || 'Masyarakat Umum'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 text-center md:hidden">
                     <div className="inline-flex items-center gap-3 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] bg-white px-6 py-3 rounded-full shadow-sm border border-slate-100">
                        <i className="fa-solid fa-left-right animate-bounce-x"></i>
                        <span>Geser ke samping</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
