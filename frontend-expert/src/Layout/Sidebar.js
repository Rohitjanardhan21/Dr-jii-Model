import { useRef } from "react";
import { MenuDatas } from "../components/Datas";
import { Link } from "react-router-dom";
import { useDoctorAuthStore } from "../store/useDoctorAuthStore";

function Sidebar() {
  const sidebarRef = useRef(null);
  const { doctor } = useDoctorAuthStore();

  const currentPath = (path) => {
    return window.location.pathname.split("/")[1] === path.split("/")[1] ? path : null;
  };

  // Don't show sidebar for public users (non-authenticated)
  if (!doctor) {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar - Always visible on desktop, hidden on mobile */}
      <div
        ref={sidebarRef}
        className="hidden md:flex fixed md:static top-[64px] left-0 z-40 h-auto w-[70px] lg:w-[95px] bg-gradient-to-b from-white to-gray-50 px-2 pt-4 pb-6 overflow-visible flex-col gap-3 border-r border-gray-100 shadow-sm rounded-tr-xl"
      >
        {MenuDatas.map((item, index) => (
          item.external ? (
            <a
              href={item.path}
              key={index}
              className={`group flex flex-col items-center gap-1.5 rounded-lg p-3 transition-all duration-300 relative hover:bg-gray-100`}
            >
              <item.icon
                className={`h-[22px] w-[22px] transition-all duration-300 text-gray-500 group-hover:text-[#ff4646] group-hover:scale-105`}
              />
              <p
                className={`text-[9px] font-semibold transition-all duration-300 text-center leading-tight text-gray-600 group-hover:text-[#ff4646]`}
              >
                {item.title}
              </p>
            </a>
          ) : (
            <Link
              to={item.path}
              key={index}
              className={`group flex flex-col items-center gap-1.5 rounded-lg p-3 transition-all duration-300 relative ${
                currentPath(item.path) === item.path
                  ? "bg-red-50"
                  : "hover:bg-gray-100"
              }`}
            >
              {currentPath(item.path) === item.path && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#ff4646] rounded-r-full"></div>
              )}
              <item.icon
                className={`h-[22px] w-[22px] transition-all duration-300 ${
                  currentPath(item.path) === item.path
                    ? "text-[#ff4646] scale-110"
                    : "text-gray-500 group-hover:text-[#ff4646] group-hover:scale-105"
                }`}
              />
              <p
                className={`text-[9px] font-semibold transition-all duration-300 text-center leading-tight ${
                  currentPath(item.path) === item.path
                    ? "text-[#ff4646]"
                    : "text-gray-600 group-hover:text-[#ff4646]"
                }`}
              >
                {item.title}
              </p>
            </Link>
          )
        ))}
      </div>

      {/* Mobile Bottom Tab Navigation - Only visible on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center h-20 px-2">
          {MenuDatas.map((item, index) => {
            const isActive = currentPath(item.path) === item.path;
            const middleIndex = Math.floor(MenuDatas.length / 2);
            const isMiddle = index === middleIndex;

            return item.external ? (
              <a
                href={item.path}
                key={index}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all duration-300 transform scale-100`}
              >
                <item.icon
                  className={`transition-all duration-300 h-[24px] w-[24px] text-gray-500`}
                />
                <p
                  className={`text-[9px] font-bold transition-all duration-300 text-gray-500`}
                >
                  {item.title}
                </p>
              </a>
            ) : (
              <Link
                to={item.path}
                key={index}
                className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-all duration-300 transform ${
                  isActive
                    ? isMiddle
                      ? "scale-110"
                      : "scale-105"
                    : "scale-100"
                }`}
              >
                <item.icon
                  className={`transition-all duration-300 ${
                    isActive
                      ? "h-[28px] w-[28px] text-[#ff4646]"
                      : "h-[24px] w-[24px] text-gray-500"
                  }`}
                />
                <p
                  className={`text-[9px] font-bold transition-all duration-300 ${
                    isActive
                      ? "text-[#ff4646]"
                      : "text-gray-500"
                  }`}
                >
                  {item.title}
                </p>
                {isActive && (
                  <div className="h-1 w-6 bg-[#ff4646] rounded-full mt-1 animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile bottom padding to prevent content overlap with bottom nav */}
      <div className="md:hidden h-20"></div>
    </>
  );
}

export default Sidebar;
