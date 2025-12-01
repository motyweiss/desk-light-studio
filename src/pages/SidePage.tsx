import { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home } from 'lucide-react';
import { useDeviceDiscovery } from '@/contexts/DeviceDiscoveryContext';
import StatsBar from '@/components/discovery/StatsBar';
import AreaCard from '@/components/discovery/AreaCard';
import UnassignedSection from '@/components/discovery/UnassignedSection';
import AreaDetailSheet from '@/components/discovery/AreaDetailSheet';
import { DiscoveredArea } from '@/types/discovery';
import { Link } from 'react-router-dom';

const SidePage = () => {
  const { discoveryResult, isDiscovering, runDiscovery, error } = useDeviceDiscovery();
  const [selectedArea, setSelectedArea] = useState<DiscoveredArea | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleAreaClick = (area: DiscoveredArea) => {
    setSelectedArea(area);
    setIsSheetOpen(true);
  };

  const handleRefresh = async () => {
    await runDiscovery();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white/70 mb-4">Error: {error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!discoveryResult && isDiscovering) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <RefreshCw className="w-8 h-8 text-white/60 animate-spin mx-auto mb-4" />
          <p className="text-white/70 font-light">Discovering devices...</p>
        </motion.div>
      </div>
    );
  }

  if (!discoveryResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white/70 mb-4">No Home Assistant connection found</p>
          <Link
            to="/settings"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/90 transition-colors inline-block"
          >
            Configure Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <Home className="w-5 h-5 text-white/60" strokeWidth={1.5} />
            </Link>
            <h1 className="text-4xl font-light text-white/90" style={{ fontFamily: 'Cormorant Garamond' }}>
              Smart Home Overview
            </h1>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isDiscovering}
            className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 disabled:opacity-50"
          >
            <RefreshCw 
              className={`w-4 h-4 text-white/60 ${isDiscovering ? 'animate-spin' : ''}`} 
              strokeWidth={1.5} 
            />
            <span className="text-sm font-light text-white/90">Refresh</span>
          </button>
        </motion.div>

        {/* Stats Bar */}
        <div className="mb-8">
          <StatsBar
            totalAreas={discoveryResult.stats.totalAreas}
            totalDevices={discoveryResult.stats.totalDevices}
            totalEntities={discoveryResult.stats.totalEntities}
            isConnected={true}
          />
        </div>

        {/* Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {discoveryResult.areas.map((area, index) => (
            <AreaCard
              key={area.id}
              area={area}
              index={index}
              onClick={() => handleAreaClick(area)}
            />
          ))}
        </div>

        {/* Unassigned Devices */}
        <UnassignedSection devices={discoveryResult.unassignedDevices} />
      </div>

      {/* Area Detail Sheet */}
      <AreaDetailSheet
        area={selectedArea}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
};

export default SidePage;
