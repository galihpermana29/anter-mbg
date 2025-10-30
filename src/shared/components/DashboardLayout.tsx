"use client";

import React, { useState, useMemo, useEffect } from "react";
import { getSessionClient } from "@/shared/session/get-session-client";
import {
  ShoppingCartOutlined,
  BookOutlined,
  LogoutOutlined,
  CarOutlined,
  DashboardOutlined,
  DownOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Breadcrumb, Dropdown, Layout, Menu, Space, theme } from "antd";
import primaryLogo from "@/assets/logo-primary.png";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import StatistikIcon from "./icons/Statistik";
import AktivitasIcon from "./icons/AktivitasIcon";
import PesananIcon from "./icons/PesananIcon";
import SekolahIcon from "./icons/SekolahIcon";
import MenuIcon from "./icons/MenuIcon";
import LogoutIcon from "@/assets/logout-icon.png";

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

// Define custom menu item type with route property
interface CustomMenuItem {
  label: string;
  key: string;
  icon?: React.ReactNode;
  route?: string;
  children?: CustomMenuItem[];
  className?: string;
}

// Define menu items with their corresponding routes
const kitchenMenu: CustomMenuItem[] = [
  {
    label: "Dashboard",
    key: "dashboard",
    icon: <StatistikIcon isActive={true} />,
    route: "/admin/statistik",
  },
  {
    label: "Aktivitas",
    key: "aktivitas",
    icon: <AktivitasIcon isActive={false} />,
    route: "/admin/aktivitas",
  },
  {
    label: "Pesanan",
    key: "pesanan",
    icon: <PesananIcon isActive={false} />,
    route: "/admin/pesanan",
  },
  {
    label: "Sekolah",
    key: "sekolah",
    icon: <SekolahIcon isActive={false} />,
    route: "/admin/sekolah",
  },
  {
    label: "Menu",
    key: "menu",
    icon: <MenuIcon isActive={false} />,
    route: "/admin/menu",
  },
];

const schoolMenu: CustomMenuItem[] = [
  {
    label: "Aktivitas",
    key: "aktivitas",
    icon: <AktivitasIcon isActive={false} />,
    route: "/school/aktivitas",
  },
  {
    label: "Pesanan",
    key: "pesanan",
    icon: <PesananIcon isActive={false} />,
    route: "/school/pesanan",
  },
  {
    label: "Profile Sekolah",
    key: "sekolah",
    icon: <SekolahIcon isActive={false} />,
    route: "/school/profile",
  },
];

const driverMenu: CustomMenuItem[] = [
  {
    label: "Aktivitas",
    key: "aktivitas",
    icon: <AktivitasIcon isActive={false} />,
    route: "/driver/aktivitas",
  },
];

// Convert menu items to the format required by Ant Design
const convertMenuItems = (
  menuItems: CustomMenuItem[],
  selectedKeys: string[]
): MenuItem[] => {
  return menuItems.map((item) => {
    const isActive = selectedKeys.includes(item.key);

    // Clone the icon and update isActive prop
    let updatedIcon = item.icon;
    if (React.isValidElement(item.icon)) {
      updatedIcon = React.cloneElement(item.icon as React.ReactElement<any>, {
        isActive: isActive,
      });
    }

    // Create label with gap between icon and text
    const labelWithGap = (
      <div className="flex items-center gap-2">
        {updatedIcon}
        <span>{item.label}</span>
      </div>
    );

    if (item.children) {
      return getItem(
        labelWithGap,
        item.key,
        null, // Remove icon from here since it's in the label
        item.children.map((child) => {
          const isChildActive = selectedKeys.includes(child.key);
          let childIcon = child.icon;
          if (React.isValidElement(child.icon)) {
            childIcon = React.cloneElement(
              child.icon as React.ReactElement<any>,
              {
                isActive: isChildActive,
              }
            );
          }
          return getItem(
            <div className="flex items-center gap-2">
              {childIcon}
              <span>{child.label}</span>
            </div>,
            child.key
          );
        })
      );
    }
    return getItem(labelWithGap, item.key, null); // Remove icon from here since it's in the label
  });
};

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuItems, setActiveMenuItems] = useState<CustomMenuItem[]>([]);
  const [sidebarFocused, setSidebarFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Toggle sidebar focus and visibility
  const toggleSidebarFocus = () => {
    // If sidebar is collapsed, show it
    if (collapsed) {
      setCollapsed(false);
      setSidebarFocused(true);
    } else if (sidebarFocused) {
      // If sidebar is focused, collapse it (close)
      setCollapsed(true);
      setSidebarFocused(false);
    } else {
      // If sidebar is visible but not focused, focus it
      setSidebarFocused(true);
    }
  };

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const pathname = usePathname();
  const router = useRouter();

  // Detect mobile screens
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Fetch session data to determine user role
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const sessionData = await getSessionClient();
        // Get role from either direct property or user object
        const role = sessionData.role || sessionData.user?.role || "";
        setUser(sessionData.user?.fullname || "");

        // Set menu items based on role
        if (role === "KITCHEN") {
          setActiveMenuItems(kitchenMenu);
        } else if (role === "SCHOOL") {
          setActiveMenuItems(schoolMenu);
        } else if (role === "DRIVER") {
          setActiveMenuItems(driverMenu);
        } else {
          setActiveMenuItems([]);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        setActiveMenuItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Find the currently active menu item based on the pathname
  const findSelectedKey = () => {
    if (!activeMenuItems.length) return [];

    // First check for exact matches
    const exactMatch = activeMenuItems.find((item) => item.route === pathname);
    if (exactMatch) return [exactMatch.key];

    // Then check for child routes
    for (const item of activeMenuItems) {
      if (item.children) {
        const childMatch = item.children.find(
          (child) => child.route === pathname
        );
        if (childMatch) return [childMatch.key];

        // Check if pathname starts with any child route
        const childPartialMatch = item.children.find((child) =>
          child.route ? pathname.startsWith(child.route) : false
        );
        if (childPartialMatch) return [childPartialMatch.key];
      }

      // Check if pathname starts with this route
      if (item.route && pathname.startsWith(item.route)) {
        return [item.key];
      }
    }

    return []; // No selection if no match
  };

  // Handle logout action
  const handleLogout = async () => {
    try {
      // Call the API to remove the session
      await fetch("/api/logout", { method: "POST" });
      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle menu item click
  const handleMenuClick = ({ key }: { key: string }) => {
    // Handle logout separately
    if (key === "logout") {
      handleLogout();
      return;
    }

    // Find the clicked item
    const findRoute = (items: CustomMenuItem[]): string | undefined => {
      for (const item of items) {
        if (item.key === key) return item.route;
        if (item.children) {
          const childRoute = item.children.find(
            (child) => child.key === key
          )?.route;
          if (childRoute) return childRoute;
        }
      }
      return undefined;
    };

    const route = findRoute(activeMenuItems);
    if (route) {
      // Close sidebar on mobile when navigating
      if (isMobile) {
        setCollapsed(true);
      }
      router.push(route);
    }
  };

  const breadcrumbItems = useMemo(() => {
    // Remove leading slash and split by '/' to get path segments
    const pathSegments = pathname
      .split("/")
      .filter((segment) => segment !== "");

    // Create breadcrumb items from path segments
    const items = [
      { title: "Home" }, // Remove href from Home to make it non-clickable
      ...pathSegments.map((segment, index) => {
        // Create the href for this segment (all segments up to this point)
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;

        // Capitalize the first letter of each segment for better display
        const title = segment.charAt(0).toUpperCase() + segment.slice(1);

        // Only add href to the last item to make it clickable
        const isLastItem = index === pathSegments.length - 1;
        return isLastItem ? { title, href } : { title };
      }),
    ];

    return items;
  }, [pathname]);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Mobile sidebar overlay implementation */}
      {isMobile && (
        <>
          {/* Overlay background when sidebar is open */}
          {!collapsed && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
                backgroundColor: !collapsed
                  ? "rgba(0, 0, 0, 0.5)"
                  : "transparent",
              }}
              onClick={() => setCollapsed(true)}
            />
          )}

          {/* Fixed position sidebar for mobile */}
          <div
            style={{
              position: "fixed",
              zIndex: 1000,
              left: collapsed ? "-250px" : 0,
              top: 0,
              height: "100%",
              transition: "left 0.3s ease",
              backgroundColor: "transparent",
            }}
          >
            <Sider
              collapsedWidth={0}
              collapsed={false}
              width={250}
              style={{
                background: colorBgContainer,
                height: "100vh",
              }}
            >
              {/* Sidebar content */}
              <div
                className={`h-[64px] px-[22px] flex items-center justify-start`}
              >
                <Image src={primaryLogo} alt="logo" width={150} height={150} />
              </div>
              <div className="flex flex-col justify-between h-full">
                {isLoading ? (
                  <div className="p-4 text-center">Loading...</div>
                ) : (
                  <Menu
                    className={`${sidebarFocused ? "sidebar-focused" : ""}`}
                    selectedKeys={findSelectedKey()}
                    mode="inline"
                    items={convertMenuItems(activeMenuItems, findSelectedKey())}
                    onClick={handleMenuClick}
                    style={{
                      fontWeight: sidebarFocused ? 500 : 400,
                    }}
                  />
                )}
                <div>
                  <div
                    className="p-[16px] text-red-700 cursor-pointer flex items-center gap-2 hover:bg-gray-100 mb-[100px]"
                    onClick={handleLogout}
                  >
                    <LogoutOutlined />
                    <span className="font-[500]">Logout</span>
                  </div>
                </div>
              </div>
            </Sider>
          </div>
        </>
      )}

      {/* Desktop sidebar implementation */}
      {!isMobile && (
        <Sider
          breakpoint="lg"
          style={{
            background: colorBgContainer,
            // overflow: "auto",
            height: "100vh",
            position: "sticky",
            insetInlineStart: 0,
            top: 0,
            bottom: 0,
            scrollbarWidth: "thin",
            scrollbarGutter: "stable",
            boxShadow: sidebarFocused ? "0 0 10px rgba(0, 0, 0, 0.2)" : "none",
            zIndex: 1000,
            transition: "all 0.3s ease",
          }}
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => {
            setCollapsed(value);
            // Reset focus state when sidebar is collapsed
            if (value) {
              setSidebarFocused(false);
            }
          }}
        >
          <div className={`h-[64px] px-[22px] flex items-center justify-start`}>
            <Image src={primaryLogo} alt="logo" width={150} height={150} />
          </div>
          <div className="flex flex-col justify-between h-full">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <Menu
                className={`${sidebarFocused ? "sidebar-focused" : ""}`}
                selectedKeys={findSelectedKey()}
                mode="inline"
                items={convertMenuItems(activeMenuItems, findSelectedKey())}
                onClick={handleMenuClick}
                style={{
                  fontWeight: sidebarFocused ? 500 : 400,
                }}
              />
            )}
            <div>
              <Image src={LogoutIcon} alt="logout" width={400} />
              <div
                className="p-[16px] text-red-700 cursor-pointer flex items-center gap-2 hover:bg-gray-100 mb-[100px]"
                onClick={handleLogout}
              >
                <LogoutOutlined />
                {!collapsed && <span className="font-[500]">Logout</span>}
              </div>
            </div>
          </div>
        </Sider>
      )}

      {/* Main content layout */}
      <Layout>
        <Header style={{ padding: "0 16px", background: colorBgContainer }}>
          <div className="flex justify-between lg:justify-end">
            <div className="lg:hidden flex justify-center items-center">
              <Image src={primaryLogo} alt="logo" width={150} height={150} />
            </div>
            <div
              className={`cursor-pointer lg:hidden rounded-md transition-all ${sidebarFocused ? "text-blue-700" : ""
                }`}
              onClick={toggleSidebarFocus}
              title={
                collapsed
                  ? "Show Sidebar"
                  : sidebarFocused
                    ? "Close Sidebar"
                    : "Focus Sidebar"
              }
            >
              <MenuOutlined style={{ fontSize: "18px" }} />
            </div>
            <div className="hidden lg:block">
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "1",
                      label: "Logout",
                      icon: <LogoutOutlined />,
                      onClick: handleLogout,
                    },
                  ],
                }}
              >
                <Space>
                  <Avatar>{user.charAt(0).toUpperCase()}</Avatar>
                  <h1 className="line-clamp-2 word-break max-w-[100px]">
                    {" "}
                    {user}
                  </h1>
                </Space>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content style={{ margin: "0 10px" }}>
          <Breadcrumb style={{ margin: "16px 0" }} items={breadcrumbItems} />
          <div
            style={{
              padding: 16,
              minHeight: "100vh",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflowY: "auto",
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
