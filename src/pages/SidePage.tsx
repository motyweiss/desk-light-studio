import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home, Settings, CheckSquare, Square } from 'lucide-react';
import { useDeviceDiscovery } from '@/contexts/DeviceDiscoveryContext';
import { useAreaManagement } from '@/contexts/AreaManagementContext';
import StatsBar from '@/components/discovery/StatsBar';
import AreaCard from '@/components/discovery/AreaCard';
import UnassignedSection from '@/components/discovery/UnassignedSection';
import AreaDetailSheet from '@/components/discovery/AreaDetailSheet';
import AreaManagementPanel from '@/components/discovery/AreaManagementPanel';
import SearchFilterBar from '@/components/discovery/SearchFilterBar';
import DeviceDetailModal from '@/components/discovery/DeviceDetailModal';
import BulkActionsBar from '@/components/discovery/BulkActionsBar';
import DeviceCard from '@/components/discovery/DeviceCard';
import { DiscoveredArea, DiscoveredDevice, DeviceType } from '@/types/discovery';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const SidePage = () => {
  const { discoveryResult, isDiscovering, runDiscovery, error } = useDeviceDiscovery();
  const { areas, assignments, mergeAutoDetectedAreas, getDeviceArea, bulkAssignDevices } = useAreaManagement();
  const [selectedArea, setSelectedArea] = useState<DiscoveredArea | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [isDeviceDetailOpen, setIsDeviceDetailOpen] = useState(false);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<DeviceType[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  
  // Bulk Selection State
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState<Set<string>>(new Set());

  // Merge auto-detected areas with managed areas
  useEffect(() => {
    if (discoveryResult) {
      mergeAutoDetectedAreas(
        discoveryResult.areas.map(area => ({ id: area.id, name: area.name }))
      );
    }
  }, [discoveryResult, mergeAutoDetectedAreas]);

  // Create organized areas with assignments
  const organizedAreas = areas.map(area => {
    const assignedDevices: DiscoveredDevice[] = [];
    
    if (discoveryResult) {
      const allDevices = [
        ...discoveryResult.areas.flatMap(a => a.devices),
        ...discoveryResult.unassignedDevices
      ];
      
      allDevices.forEach(device => {
        const deviceAreaId = getDeviceArea(device.id);
        if (deviceAreaId === area.id) {
          assignedDevices.push(device);
        }
      });
    }
    
    return {
      id: area.id,
      name: area.name,
      icon: area.icon,
      devices: assignedDevices,
      entityCount: assignedDevices.reduce((sum, d) => sum + d.entities.length, 0)
    };
  }).filter(area => area.devices.length > 0);

  // Get all devices for filtering
  const allDevices = useMemo(() => {
    if (!discoveryResult) return [];
    return [
      ...discoveryResult.areas.flatMap(a => a.devices),
      ...discoveryResult.unassignedDevices
    ];
  }, [discoveryResult]);

  // Apply search and filters
  const filteredDevices = useMemo(() => {
    let devices = allDevices;

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      devices = devices.filter(device =>
        device.name.toLowerCase().includes(query) ||
        device.manufacturer?.toLowerCase().includes(query) ||
        device.entities.some(e => 
          e.friendly_name.toLowerCase().includes(query) ||
          e.entity_id.toLowerCase().includes(query)
        )
      );
    }

    // Apply type filter
    if (selectedTypes.length > 0) {
      devices = devices.filter(device => selectedTypes.includes(device.deviceType));
    }

    // Apply manufacturer filter
    if (selectedManufacturers.length > 0) {
      devices = devices.filter(device => 
        device.manufacturer && selectedManufacturers.includes(device.manufacturer)
      );
    }

    return devices;
  }, [allDevices, searchQuery, selectedTypes, selectedManufacturers]);

  // Get truly unassigned devices (from filtered list)
  const unassignedDevices = useMemo(() => {
    return filteredDevices.filter(device => !getDeviceArea(device.id));
  }, [filteredDevices, getDeviceArea]);

  // Get assigned filtered devices organized by area
  const filteredOrganizedAreas = useMemo(() => {
    return areas.map(area => {
      const assignedDevices = filteredDevices.filter(device => getDeviceArea(device.id) === area.id);
      return {
        ...area,
        devices: assignedDevices,
        entityCount: assignedDevices.reduce((sum, d) => sum + d.entities.length, 0)
      };
    }).filter(area => area.devices.length > 0);
  }, [areas, filteredDevices, getDeviceArea]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedTypes.length > 0 || selectedManufacturers.length > 0;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setSelectedManufacturers([]);
  };

  const handleDeviceClick = (deviceId: string) => {
    if (isBulkMode) {
      toggleDeviceSelection(deviceId);
    } else {
      setSelectedDeviceId(deviceId);
      setIsDeviceDetailOpen(true);
    }
  };

  const toggleDeviceSelection = (deviceId: string) => {
    setSelectedDeviceIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId);
      } else {
        newSet.add(deviceId);
      }
      return newSet;
    });
  };

  const handleBulkAssign = (areaId: string | null) => {
    bulkAssignDevices(Array.from(selectedDeviceIds), areaId || '');
    setSelectedDeviceIds(new Set());
    setIsBulkMode(false);
  };

  const selectedDevice = allDevices.find(d => d.id === selectedDeviceId) || null;

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
          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                setSelectedDeviceIds(new Set());
              }}
              variant="outline"
              className={`bg-white/[0.04] backdrop-blur-xl border-white/10 hover:bg-white/[0.06] hover:border-white/20 ${
                isBulkMode ? 'border-[hsl(44,85%,58%)] bg-[hsl(44,85%,58%)]/10' : ''
              }`}
            >
              {isBulkMode ? (
                <CheckSquare className="w-4 h-4 text-[hsl(44,85%,58%)]" strokeWidth={1.5} />
              ) : (
                <Square className="w-4 h-4 text-white/60" strokeWidth={1.5} />
              )}
              <span className="text-sm font-light text-white/90 ml-2">
                {isBulkMode ? 'Cancel Selection' : 'Bulk Select'}
              </span>
            </Button>
            <button
              onClick={() => setIsManagementOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-xl hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300"
            >
              <Settings className="w-4 h-4 text-white/60" strokeWidth={1.5} />
              <span className="text-sm font-light text-white/90">Manage Areas</span>
            </button>
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
          </div>
        </motion.div>

        {/* Search and Filter Bar */}
        <div className="mb-6">
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTypes={selectedTypes}
            onTypesChange={setSelectedTypes}
            selectedManufacturers={selectedManufacturers}
            onManufacturersChange={setSelectedManufacturers}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>

        {/* Stats Bar */}
        <div className="mb-8">
          <StatsBar
            totalAreas={filteredOrganizedAreas.length}
            totalDevices={filteredDevices.length}
            totalEntities={filteredDevices.reduce((sum, d) => sum + d.entities.length, 0)}
            isConnected={true}
          />
        </div>

        {/* Areas Grid or Filtered View */}
        {hasActiveFilters ? (
          <div className="mb-8">
            <h2 className="text-xl font-light text-white/70 mb-4">
              Search Results ({filteredDevices.length} devices)
            </h2>
            <div className="space-y-2">
              {filteredDevices.map((device, index) => (
                <div key={device.id} className="relative">
                  {isBulkMode && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedDeviceIds.has(device.id)}
                        onChange={() => toggleDeviceSelection(device.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 checked:bg-[hsl(44,85%,58%)] checked:border-[hsl(44,85%,58%)]"
                      />
                    </div>
                  )}
                  <div className={isBulkMode ? 'pl-12' : ''}>
                    <DeviceCard
                      device={device}
                      index={index}
                      onClick={() => handleDeviceClick(device.id)}
                      showAreaAssignment={!isBulkMode}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredOrganizedAreas.map((area, index) => (
                <AreaCard
                  key={area.id}
                  area={area}
                  index={index}
                  onClick={() => handleAreaClick(area)}
                />
              ))}
            </div>

            {/* Unassigned Devices */}
            <div className="space-y-2">
              <UnassignedSection devices={unassignedDevices} />
            </div>
          </>
        )}
      </div>

      {/* Area Detail Sheet */}
      <AreaDetailSheet
        area={selectedArea}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onDeviceClick={handleDeviceClick}
      />

      {/* Area Management Panel */}
      <AreaManagementPanel
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
      />

      {/* Device Detail Modal */}
      <DeviceDetailModal
        device={selectedDevice}
        isOpen={isDeviceDetailOpen}
        onClose={() => {
          setIsDeviceDetailOpen(false);
          setSelectedDeviceId(null);
        }}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedDeviceIds.size}
        onClearSelection={() => {
          setSelectedDeviceIds(new Set());
          setIsBulkMode(false);
        }}
        onBulkAssign={handleBulkAssign}
      />
    </div>
  );
};

export default SidePage;
