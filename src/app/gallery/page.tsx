import React from "react";
import A4PaperCard from "@/components/A4PaperCard";

type Startup = {
  logo?: string;
  name: string;
  summary: string;
  visits: number;
  valuation: string;
  websiteUrl: string;
};

const GalleryPage = () => {
  // Sample data - replace with actual data from API/database
  const startups: Startup[] = [
    {
      logo: "",
      name: "TechFlow",
      summary:
        "Revolutionary project management tool that helps teams collaborate seamlessly. Built with cutting-edge technology to streamline workflows and boost productivity. Our platform integrates seamlessly with your existing tools and provides real-time insights into your team's performance.",
      visits: 12500,
      valuation: "$2.5M",
      websiteUrl: "https://techflow.example.com",
    },
    {
      logo: "",
      name: "DataSync",
      summary:
        "AI-powered data synchronization platform for modern businesses. Transform how you manage and sync data across multiple platforms with intelligent automation. Our solution ensures data consistency and reduces manual work by up to 80%.",
      visits: 8900,
      valuation: "$1.8M",
      websiteUrl: "https://datasync.example.com",
    },
    {
      logo: "",
      name: "CloudVault",
      summary:
        "Secure cloud storage solution with enterprise-grade encryption. Protect your sensitive data with military-grade security while enjoying seamless access from anywhere. Trusted by over 10,000 businesses worldwide.",
      visits: 15200,
      valuation: "$3.2M",
      websiteUrl: "https://cloudvault.example.com",
    },
    {
      logo: "",
      name: "CodeCraft",
      summary:
        "Developer tools platform that streamlines the coding workflow. From code review to deployment, CodeCraft provides everything developers need to build better software faster. Join thousands of developers who have transformed their workflow.",
      visits: 9800,
      valuation: "$2.1M",
      websiteUrl: "https://codecraft.example.com",
    },
    {
      logo: "",
      name: "MarketPulse",
      summary:
        "Real-time market analytics platform for traders and investors. Get instant insights into market trends, analyze patterns, and make data-driven investment decisions. Our advanced algorithms help you stay ahead of the market.",
      visits: 11200,
      valuation: "$2.9M",
      websiteUrl: "https://marketpulse.example.com",
    },
    {
      logo: "",
      name: "DesignHub",
      summary:
        "Collaborative design platform for creative teams and agencies. Bring your design team together with powerful collaboration tools, version control, and seamless handoff capabilities. Create stunning designs faster than ever.",
      visits: 7600,
      valuation: "$1.5M",
      websiteUrl: "https://designhub.example.com",
    },
    {
      logo: "",
      name: "FinanceWise",
      summary:
        "Personal finance management app with smart budgeting features. Take control of your finances with intelligent spending insights, automated savings, and comprehensive financial planning tools. Your path to financial freedom starts here.",
      visits: 13400,
      valuation: "$2.7M",
      websiteUrl: "https://financewise.example.com",
    },
    {
      logo: "",
      name: "HealthTrack",
      summary:
        "Comprehensive health monitoring platform for individuals and clinics. Track your health metrics, manage medical records, and connect with healthcare providers seamlessly. Empowering better health decisions through technology.",
      visits: 10100,
      valuation: "$2.3M",
      websiteUrl: "https://healthtrack.example.com",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Startup Gallery
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Explore innovative startups that have been reviewed and added to our
            gallery. Each card represents a unique journey and vision.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {startups.map((startup, index) => (
            <A4PaperCard key={index} {...startup} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
