import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAreaManagement } from '@/contexts/AreaManagementContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAssign: (areaId: string | null) => void;
}

const BulkActionsBar = ({ selectedCount, onClearSelection, onBulkAssign }: BulkActionsBarProps) => {
  const { areas } = useAreaManagement();

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-4 px-6 py-4 bg-[hsl(28,20%,18%)]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[hsl(44,85%,58%)]" strokeWidth={1.5} />
              <span className="text-sm font-light text-white/90">
                {selectedCount} device{selectedCount > 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-white/50" strokeWidth={1.5} />
              <Select onValueChange={(value) => onBulkAssign(value === 'unassigned' ? null : value)}>
                <SelectTrigger className="w-[180px] bg-white/[0.06] border-white/10 text-white/90">
                  <SelectValue placeholder="Assign to area..." />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(28,20%,18%)]/95 backdrop-blur-xl border-white/10">
                  <SelectItem value="unassigned" className="text-white/90">
                    Unassigned
                  </SelectItem>
                  {areas.map((area) => (
                    <SelectItem key={area.id} value={area.id} className="text-white/90">
                      {area.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-white/60 hover:text-white/90 hover:bg-white/[0.06]"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkActionsBar;
