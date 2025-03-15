'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react'; // Assuming you have an icon for messages
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import messages from '@/message.json';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function Home() {
  return (<>
        {/* Main content */}
        <main className="flex-grow flex flex-col items-center justify-center px-6 sm:px-12 md:px-24 lg:px-32 py-12 bg-gray-800 text-white">
          <section className="text-center mb-8 md:mb-12 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
              Explore the Realm of Confidential Feedback
            </h1>
            <p className="mt-3 md:mt-4 text-base sm:text-lg md:text-xl">
              SilentIQ – Anonymous Feedback, Intelligent Insights.
            </p>
          </section>

          {/* Carousel for Messages */}
          <Carousel
              plugins={[Autoplay({ delay: 2000 })]}
              className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl"
          >
            <CarouselContent>
              {messages.map((message, index) => (
                  <CarouselItem key={index} className="p-4">
                    <Card className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-lg sm:text-xl font-semibold">{message.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-4">
                        <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-sm sm:text-base">{message.content}</p>
                          <p className="text-xs text-gray-500">{message.received}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </main>

        {/* Footer */}
        <footer className="w-full text-center p-4 sm:p-6 bg-gray-900 text-white text-sm sm:text-base">
          © 2025 SilentIQ. All rights reserved.
        </footer>
      </>

  );
}