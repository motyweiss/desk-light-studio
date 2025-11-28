import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Sofa } from "lucide-react";

export const RoomNavigation = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed top-0 left-0 right-0 z-50 bg-[#96856e]/80 backdrop-blur-xl border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-[hsl(44_85%_58%)] text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Home className="w-4 h-4" />
            <span className="font-light tracking-wide">Office</span>
          </NavLink>
          
          <NavLink
            to="/living-room"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-[hsl(44_85%_58%)] text-white shadow-lg"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`
            }
          >
            <Sofa className="w-4 h-4" />
            <span className="font-light tracking-wide">Living Room</span>
          </NavLink>
        </div>
      </div>
    </motion.nav>
  );
};
