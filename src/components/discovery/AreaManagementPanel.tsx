import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { useAreaManagement } from '@/contexts/AreaManagementContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AreaManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AreaManagementPanel = ({ isOpen, onClose }: AreaManagementPanelProps) => {
  const { areas, createArea, renameArea, deleteArea } = useAreaManagement();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [newAreaName, setNewAreaName] = useState('');

  const handleStartEdit = (areaId: string, currentName: string) => {
    setEditingId(areaId);
    setEditingName(currentName);
  };

  const handleSaveEdit = (areaId: string) => {
    if (editingName.trim()) {
      renameArea(areaId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleCreateArea = () => {
    if (newAreaName.trim()) {
      createArea(newAreaName.trim());
      setNewAreaName('');
    }
  };

  const handleDelete = (areaId: string) => {
    if (window.confirm('Are you sure you want to delete this area? Devices will be moved to unassigned.')) {
      deleteArea(areaId);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-[hsl(28,20%,18%)]/95 backdrop-blur-xl border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-white/90" style={{ fontFamily: 'Cormorant Garamond' }}>
            Manage Areas
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Create, rename, or delete areas to organize your devices
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2">
          {/* Existing Areas */}
          <AnimatePresence>
            {areas.map((area, index) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-lg bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] hover:border-white/20 transition-all"
              >
                {editingId === area.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(area.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="flex-1 bg-white/[0.06] border-white/20 text-white/90"
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSaveEdit(area.id)}
                      className="text-[hsl(44,85%,58%)] hover:text-[hsl(44,85%,68%)] hover:bg-white/[0.06]"
                    >
                      <Check className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      className="text-white/60 hover:text-white/90 hover:bg-white/[0.06]"
                    >
                      <X className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <h3 className="font-light text-white/90">{area.name}</h3>
                      <p className="text-xs text-white/50">
                        {area.deviceAssignments.length} devices
                        {area.isAutoDetected && ' • Auto-detected'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleStartEdit(area.id, area.name)}
                      className="text-white/60 hover:text-white/90 hover:bg-white/[0.06]"
                    >
                      <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(area.id)}
                      className="text-white/60 hover:text-red-400 hover:bg-white/[0.06]"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Create New Area */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-white/[0.02] border border-white/10 border-dashed">
            <Input
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateArea();
              }}
              placeholder="Enter new area name..."
              className="flex-1 bg-white/[0.06] border-white/20 text-white/90 placeholder:text-white/40"
            />
            <Button
              onClick={handleCreateArea}
              disabled={!newAreaName.trim()}
              className="bg-white/[0.06] hover:bg-white/[0.1] text-white/90 border border-white/10"
            >
              <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
              Add Area
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AreaManagementPanel;
