import Link from "next/link";
import Image from "next/image";

interface ErrorComponentProps {
  message?: string;
}

export default function ErrorComponent({ message = "Something went wrong" }: ErrorComponentProps) {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center space-y-4">
      {/* Add the uploaded image */}
      <Image 
        src="/fixerror.jpg" 
        alt="Error illustration" 
        width={300} 
        height={300} 
      />
      <h1 className="text-3xl font-bold">We ran into a issue!</h1>
      <p className="text-gray-600">{message}</p>
      {/* Correct usage of Link without extra <a> tag */}
      <Link 
        href="/" 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Return to Home
      </Link>
    </div>
  );
}
