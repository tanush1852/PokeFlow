import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import GoogleSignInDialog from "@/pages/Googledialog";
import { toast } from "sonner";
import {
  ArrowRight,
  Grid,
  Zap,
  Shield,
  Clock,
  Users,
  Workflow,
  Code,
  LogOut,
  ChevronDown,
  Braces,
  Laptop,
} from "lucide-react";

// Meteor Component
const Meteor = ({ children }) => {
  return (
    <div className="relative">
      <div className="absolute top-[calc(50%-1px)] left-[calc(50%-1px)] h-0.5 w-0.5 rounded-[50%] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] transition-[transform,opacity]" />
      <div className="absolute top-[calc(50%-1px)] left-[calc(50%-1px)] h-0.5 w-0.5 rounded-[50%] bg-slate-300 shadow-[0_0_0_1px_#ffffff10] transition-[transform,opacity]" />
    </div>
  );
};

const Meteors = ({ number }) => {
  const meteors = new Array(number || 20).fill(true);
  return (
    <>
      {meteors.map((el, idx) => (
        <div
          key={"meteor" + idx}
          className={`absolute h-0.5 w-0.5 animate-meteor-effect rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10]`}
          style={{
            top: Math.floor(Math.random() * 100) + "%",
            left: Math.floor(Math.random() * 100) + "%",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
          }}
        >
          <div className="absolute h-0.5 w-[50px] -translate-y-[50%] bg-gradient-to-r from-slate-500 to-transparent" />
        </div>
      ))}
    </>
  );
};

// Beam Component
const MovingGradient = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-gradient" />
    </div>
  );
};

const AppIcon = ({ icon, delay }) => {
  return (
    <div
      className="absolute p-4 bg-white/10 backdrop-blur-md rounded-xl animate-float"
      style={{
        animationDelay: `${delay}s`,
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`,
      }}
    >
      {icon}
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const features = [
    {
      title: "Automated Workflows",
      description:
        "Create and manage complex workflows with our intuitive drag-and-drop interface",
      icon: <Workflow className="w-12 h-12 text-blue-400" />,
      stats: "500+ Templates",
    },
    {
      title: "Team Collaboration",
      description:
        "Work together seamlessly with real-time updates and shared workspaces",
      icon: <Users className="w-12 h-12 text-indigo-400" />,
      stats: "10k+ Teams",
    },
    {
      title: "Lightning Fast",
      description:
        "Execute your workflows at unprecedented speeds with our optimized engine",
      icon: <Zap className="w-12 h-12 text-cyan-400" />,
      stats: "100ms Latency",
    },
    {
      title: "Enterprise Security",
      description:
        "Bank-grade encryption and security protocols to protect your data",
      icon: <Shield className="w-12 h-12 text-purple-400" />,
      stats: "99.9% Uptime",
    },
    {
      title: "Time Saving",
      description:
        "Reduce manual tasks and save countless hours with smart automation",
      icon: <Clock className="w-12 h-12 text-sky-400" />,
      stats: "85% Time Saved",
    },
    {
      title: "API Integration",
      description:
        "Connect with your favorite tools through our extensive API ecosystem",
      icon: <Code className="w-12 h-12 text-blue-400" />,
      stats: "100+ Integrations",
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [openDialog]);

  const handleSignInSuccess = (userData) => {
    setUser(userData);
    setOpenDialog(false);
    toast.success("Welcome to PokeFlow! Ready to automate your workflow? ⚡");
    navigate("/savedTemplates");
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Successfully signed out. See you soon! 👋");
    navigate("/");
  };

  const handleAuthClick = () => {
    if (user) {
      navigate("/savedTemplates");
    } else {
      setOpenDialog(true);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
      {/* Background Effects */}
      <MovingGradient />
      <div className="absolute inset-0">
        <Meteors number={20} />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 w-full backdrop-blur-md bg-black/20 z-50 border-b border-white/10">
          <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Grid className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text">
                PokeFlow ⚡
              </span>
            </div>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 hover:bg-white/10"
                  >
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="w-8 h-8 rounded-full ring-2 ring-blue-400"
                    />
                    <span>{user.name}</span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-gray-800 border-gray-700">
                  <DropdownMenuItem
                    onClick={() => navigate("/savedTemplates")}
                    className="text-white hover:bg-gray-700"
                  >
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                onClick={handleAuthClick}
                className="px-6 py-2 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Button>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="relative">
              <div className="absolute inset-0 -z-10">
                <Meteors number={10} />
              </div>

              <h1 className="text-6xl font-bold mb-6 pb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text z-100 ">
                Workflow Automation
                <br />
                Made Magical
              </h1>
            </div>
            <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
              Transform your business processes with PokeFlow's powerful
              automation platform. Design, deploy, and optimize workflows with
              unmatched efficiency!
            </p>
            <Button
              onClick={handleAuthClick}
              className="px-8 py-6 text-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-300"
            >
              Start Automating
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-gray-800/50 backdrop-blur-lg border-white/5 hover:bg-gray-800/70 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-blue-500/10"
              >
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-2xl font-bold text-white">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold text-blue-400">
                    {feature.stats}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Join thousands of businesses already using PokeFlow to automate
            their processes and achieve unprecedented efficiency.
          </p>
          <Button
            onClick={handleAuthClick}
            className="px-8 py-6 text-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            Get Started Free
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>

      <GoogleSignInDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSignInSuccess={handleSignInSuccess}
      />

      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes meteor-effect {
          0% {
            transform: rotate(215deg) translateX(0);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: rotate(215deg) translateX(-500px);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-gradient {
          animation: gradient 15s ease infinite;
          background-size: 400% 400%;
        }

        .animate-meteor-effect {
          animation: meteor-effect 5s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
