import React, { useContext } from "react";
import { SIDE_MENU_DATA } from "../../utils/data";
import { UserContext } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import CharAvatar from "../Cards/CharAvatar";// make sure this import path is correct

const SideMenu = ({ activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  return (
    <div className="h-screen w-64 bg-white shadow-md px-4 py-6">
      {/* Profile Section */}
      <div className="flex flex-col items-center mb-8">
        {user?.profileImageUrl ? (
          <img
            src={user?.profileImageUrl || ""}
            alt="Profile Image"
            className="w-16 h-16 rounded-full border border-gray-200 object-cover"
          />
        ) : (
          <CharAvatar
            fullName={user?.fullName || ""}
            width="w-20"
            height="h-20"
            style="text-xl"
          />
        )}

        <h5 className="mt-3 text-base font-medium text-gray-800">
          {user?.fullName || ""}
        </h5>
      </div>

      {/* Side Menu Buttons */}
      <div className="flex flex-col">
        {SIDE_MENU_DATA.map((item, index) => (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] ${
              activeMenu === item.label
                ? "text-white bg-primary"
                : "text-gray-700 hover:bg-gray-100"
            } py-3 px-6 rounded-lg mb-3 transition-colors`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon
              className={`text-lg ${
                activeMenu === item.label ? "text-white" : "text-gray-600"
              }`}
            />
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SideMenu;
