'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Calendar, MapPin, Clock, Users } from 'lucide-react';

export default function EventsPage() {
    const router = useRouter();

    const events = [
        {
            id: 1,
            title: 'Annual Tech Symposium',
            date: 'Jan 25',
            time: '10:00 AM',
            location: 'Main Auditorium',
            attendees: 120,
            type: 'Technical',
            image: 'bg-gradient-to-br from-blue-500 to-indigo-600'
        },
        {
            id: 2,
            title: 'Cultural Night Auditions',
            date: 'Jan 28',
            time: '04:00 PM',
            location: 'Amphitheater',
            attendees: 45,
            type: 'Cultural',
            image: 'bg-gradient-to-br from-pink-500 to-purple-600'
        },
        {
            id: 3,
            title: 'Hackathon: Code for Good',
            date: 'Feb 05',
            time: '09:00 AM',
            location: 'CS Dept Labs',
            attendees: 200,
            type: 'Competiton',
            image: 'bg-gradient-to-br from-green-500 to-emerald-600'
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-32">
            <header className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <Button variant="ghost" className="p-2 -ml-2" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <h1 className="text-3xl font-bold font-heading text-foreground">Upcoming Events</h1>
                </div>
                <p className="text-gray-500 pl-12">Don't miss out on the action!</p>
            </header>

            <main className="space-y-6">
                {events.map(event => (
                    <Card key={event.id} className="overflow-hidden border-0 shadow-lg group hover:shadow-xl transition-shadow bg-surface">
                        <div className={`h-32 ${event.image} relative p-6 text-white flex flex-col justify-end`}>
                            <Badge className="absolute top-4 right-4 bg-primary/20 hover:bg-primary/30 text-primary border-none backdrop-blur-sm">
                                {event.type}
                            </Badge>
                            <h3 className="text-2xl font-bold leading-none mb-1">{event.title}</h3>
                        </div>
                        <div className="p-4">
                            <div className="flex gap-4 mb-4">
                                <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                    <Calendar className="mx-auto mb-1 text-primary" size={20} />
                                    <span className="block font-bold text-foreground text-sm">{event.date}</span>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                                    <Clock className="mx-auto mb-1 text-primary" size={20} />
                                    <span className="block font-bold text-foreground text-sm">{event.time}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-500 text-sm mb-6 px-1">
                                <MapPin size={16} />
                                <span>{event.location}</span>
                            </div>

                            <Button className="w-full rounded-xl py-6 text-lg font-bold shadow-soft">
                                Register Now
                            </Button>
                        </div>
                    </Card>
                ))}
            </main>
        </div>
    );
}
