import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Container className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
          Plan your next <span className="text-blue-600">adventure</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed">
          The most intuitive way to build, organize, and share your travel itineraries.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard">
            <Button className="px-8 py-3 text-lg h-auto">Start Planning</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" className="px-8 py-3 text-lg h-auto">Go to Dashboard</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
