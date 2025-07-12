"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Globe, 
  Users, 
  Shield, 
  TrendingUp, 
  Flag, 
  Crown, 
  Building, 
  Target,
  ChevronDown,
  ArrowRight,
  Settings,
  MapPin,
  Briefcase,
  BarChart3,
  Network,
  HandHeart,
  Star,
  Menu,
  X
} from "lucide-react";

export default function GeopolitikLanding() {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const features = [
    {
      title: "Nation Building",
      description: "Create and customize your nation from the ground up. Choose your government type, starting resources, demographics, and ideological stance to shape your nation's future.",
      icon: Flag,
      color: "from-emerald-600 to-teal-700"
    },
    {
      title: "Real-Time Diplomacy",
      description: "Engage in complex diplomatic relations with other players and AI nations. Form alliances, negotiate treaties, and navigate international crises in real-time.",
      icon: HandHeart,
      color: "from-amber-600 to-orange-700"
    },
    {
      title: "Economic Warfare",
      description: "Control trade routes, implement sanctions, and build economic empires. Your financial decisions ripple across the global marketplace.",
      icon: BarChart3,
      color: "from-slate-600 to-gray-700"
    },
    {
      title: "Strategic Planning",
      description: "Balance short-term needs with long-term vision. Every policy decision has consequences that shape your nation's trajectory for generations.",
      icon: Target,
      color: "from-red-600 to-rose-700"
    }
  ];

  const governmentTypes = [
    {
      name: "Democracy",
      description: "Higher citizen satisfaction, slower decision-making",
      icon: Users,
      pros: ["High legitimacy", "Stable transitions", "Innovation"],
      cons: ["Slow reforms", "Electoral cycles", "Gridlock"]
    },
    {
      name: "Autocracy", 
      description: "Faster policy implementation, potential for unrest",
      icon: Crown,
      pros: ["Quick decisions", "Long-term planning", "Stability"],
      cons: ["Succession crises", "Corruption", "Resistance"]
    },
    {
      name: "Federation",
      description: "Balanced regional autonomy, complex internal politics",
      icon: Network,
      pros: ["Diverse regions", "Flexibility", "Representation"],
      cons: ["Coordination issues", "Regional tensions", "Complexity"]
    },
    {
      name: "Corporate State",
      description: "Economic efficiency, potential inequality issues",
      icon: Briefcase,
      pros: ["Economic growth", "Innovation", "Efficiency"],
      cons: ["Inequality", "Short-term focus", "Social unrest"]
    }
  ];

  const gamePhases = [
    {
      title: "Early Game",
      subtitle: "Foundation Building",
      description: "Focus on domestic development, establish basic infrastructure, and build stability within your borders.",
      icon: Building,
      color: "border-emerald-500/50 bg-emerald-500/10"
    },
    {
      title: "Mid Game", 
      subtitle: "Regional Power",
      description: "Expand your influence regionally, form strategic alliances, and engage in economic competition.",
      icon: Globe,
      color: "border-amber-500/50 bg-amber-500/10"
    },
    {
      title: "Late Game",
      subtitle: "Global Superpower",
      description: "Manage multiple crises simultaneously, project power globally, and shape the world order.",
      icon: Star,
      color: "border-red-500/50 bg-red-500/10"
    }
  ];

  const stats = [
    { label: "Active Players", value: "12,400+", icon: Users },
    { label: "Nations Created", value: "89,000+", icon: Flag },
    { label: "Alliances Formed", value: "3,200+", icon: Shield },
    { label: "Diplomatic Actions", value: "2.1M+", icon: HandHeart }
  ];

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Navigation */}
      <motion.nav
        className="relative z-50 flex justify-between items-center p-6 backdrop-blur-sm bg-slate-900/80 border-b border-slate-700/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold text-white">
            Geopolitik
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-emerald-400 transition-colors font-medium"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('government')}
            className="hover:text-emerald-400 transition-colors font-medium"
          >
            Government
          </button>
          <button
            onClick={() => scrollToSection('gameplay')}
            className="hover:text-emerald-400 transition-colors font-medium"
          >
            Gameplay
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={handleLogin}
            className="text-sm font-medium hover:text-emerald-400 transition-colors px-4 py-2"
          >
            Login
          </button>
          <button
            onClick={handleRegister}
            className="text-sm font-medium px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-x-0 top-20 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 p-6"
          >
            <div className="flex flex-col space-y-4">
              <button
                onClick={() => scrollToSection('features')}
                className="text-left hover:text-emerald-400 transition-colors font-medium py-2"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('government')}
                className="text-left hover:text-emerald-400 transition-colors font-medium py-2"
              >
                Government
              </button>
              <button
                onClick={() => scrollToSection('gameplay')}
                className="text-left hover:text-emerald-400 transition-colors font-medium py-2"
              >
                Gameplay
              </button>
              <hr className="border-slate-700/50" />
              <button
                onClick={handleLogin}
                className="text-left hover:text-emerald-400 transition-colors font-medium py-2"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="text-left bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.section
        className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white">
            Geopolitik
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto mb-8"></div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <p className="text-xl md:text-2xl mb-8 max-w-4xl leading-relaxed text-gray-300">
            Shape the destiny of nations in the ultimate
            <span className="text-emerald-400 font-semibold"> geopolitical simulation</span>. 
            Build your empire, forge alliances, and navigate the complex world of international relations.
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            onClick={handleRegister}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-lg font-semibold text-lg shadow-xl hover:shadow-2xl flex items-center space-x-2 group hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Flag className="w-5 h-5" />
            <span>Start Your Nation</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            onClick={handleLogin}
            className="border-2 border-emerald-400 text-emerald-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-emerald-400 hover:text-white transition-all duration-300 flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Users className="w-5 h-5" />
            <span>Join Game</span>
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center p-6 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
            >
              <stat.icon className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
              <div className="text-2xl font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-emerald-400" />
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Master Global Politics
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Feature Display */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFeature}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${features[currentFeature].color} flex items-center justify-center mb-6`}>
                    {(() => {
                      const IconComponent = features[currentFeature].icon;
                      return <IconComponent className="w-8 h-8 text-white" />;
                    })()}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{features[currentFeature].title}</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {features[currentFeature].description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Feature Navigation */}
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                    index === currentFeature
                      ? 'bg-slate-700/50 border border-emerald-500/50'
                      : 'bg-slate-800/30 hover:bg-slate-700/30 border border-slate-700/30'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                      {(() => {
                        const IconComponent = feature.icon;
                        return <IconComponent className="w-6 h-6 text-white" />;
                      })()}
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg text-white">{feature.title}</h4>
                      <p className="text-gray-400 text-sm">{feature.description.substring(0, 80)}...</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Government Types Section */}
      <section id="government" className="relative z-10 py-20 px-6 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Choose Your Government
          </motion.h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {governmentTypes.map((gov, index) => (
              <motion.div
                key={index}
                className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                    {(() => {
                      const IconComponent = gov.icon;
                      return <IconComponent className="w-7 h-7 text-white" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{gov.name}</h3>
                    <p className="text-gray-400 text-sm">{gov.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-emerald-400 font-semibold mb-2">Advantages</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {gov.pros.map((pro, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-2">Challenges</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      {gov.cons.map((con, i) => (
                        <li key={i} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gameplay Phases Section */}
      <section id="gameplay" className="relative z-10 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-center mb-16 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Evolution of Power
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {gamePhases.map((phase, index) => (
              <motion.div
                key={index}
                className={`rounded-2xl p-8 border-2 ${phase.color} backdrop-blur-sm transition-all duration-300 hover:scale-105`}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-3 mb-6">
                  {(() => {
                    const IconComponent = phase.icon;
                    return <IconComponent className="w-8 h-8 text-white" />;
                  })()}
                  <div>
                    <h3 className="text-xl font-bold text-white">{phase.title}</h3>
                    <p className="text-gray-400 text-sm">{phase.subtitle}</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {phase.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section 
        className="relative z-10 py-20 px-6 text-center bg-slate-800/30"
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-8 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            The World Stage Awaits
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Join thousands of strategic minds competing for global dominance. Every decision shapes history. Every alliance changes the balance of power.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.button
              onClick={handleRegister}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-12 py-6 rounded-lg font-bold text-xl shadow-2xl flex items-center space-x-3 mx-auto group hover:from-emerald-700 hover:to-teal-700 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Flag className="w-6 h-6" />
              <span>Start Your Nation</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-900/80 backdrop-blur-sm py-12 px-6 border-t border-slate-700/50">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-lg flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">
              Geopolitik
            </span>
          </div>
          <p className="text-gray-400 mb-6">
            © 2025 Geopolitik. All rights reserved. Shape the future of nations.
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Community Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  );
}