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
import primaryLogo from "@/assets/primary-logo.png";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
    label: "Aktivitas",
    key: "aktivitas",
    icon: <CarOutlined />,
    route: "/admin/aktivitas",
    children: [
      {
        label: "Pengantaran",
        key: "pengantaran",
        icon: <ShoppingCartOutlined />,
        route: "/admin/aktivitas/pengantaran",
      },
      {
        label: "Pengambilan",
        key: "pengambilan",
        icon: <ShoppingCartOutlined />,
        route: "/admin/aktivitas/pengambilan",
      },
    ],
  },
  {
    label: "Pesanan",
    key: "pesanan",
    icon: <ShoppingCartOutlined />,
    route: "/admin/pesanan",
  },
  {
    label: "Sekolah",
    key: "sekolah",
    icon: <BookOutlined />,
    route: "/admin/sekolah",
  },
  {
    label: "Menu",
    key: "menu",
    icon: <BookOutlined />,
    route: "/admin/menu",
  },
];

const schoolMenu: CustomMenuItem[] = [
  {
    label: "Aktivitas",
    key: "aktivitas",
    icon: <CarOutlined />,
    route: "/school/aktivitas",
  },
  {
    label: "Pesanan",
    key: "pesanan",
    icon: <ShoppingCartOutlined />,
    route: "/school/pesanan",
  },
  {
    label: "Profile Sekolah",
    key: "sekolah",
    icon: <BookOutlined />,
    route: "/school/profile",
  },
];

const driverMenu: CustomMenuItem[] = [
  {
    label: "Dashboard",
    key: "dashboard",
    icon: <DashboardOutlined />,
    route: "/driver",
  },
  {
    label: "Aktivitas",
    key: "aktivitas",
    icon: <CarOutlined />,
    route: "/driver/aktivitas",
  },
];

// Convert menu items to the format required by Ant Design
const convertMenuItems = (menuItems: CustomMenuItem[]): MenuItem[] => {
  return menuItems.map((item) => {
    if (item.children) {
      return getItem(
        item.label,
        item.key,
        item.icon,
        item.children.map((child) => getItem(child.label, child.key))
      );
    }
    return getItem(item.label, item.key, item.icon);
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
    return [
      { title: "Home", href: "/" },
      ...pathSegments.map((segment, index) => {
        // Create the href for this segment (all segments up to this point)
        const href = `/${pathSegments.slice(0, index + 1).join("/")}`;

        // Capitalize the first letter of each segment for better display
        const title = segment.charAt(0).toUpperCase() + segment.slice(1);

        return { title, href };
      }),
    ];
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
                <h1>Kawal MBG</h1>
              </div>
              <div className="flex flex-col justify-between h-full">
                {isLoading ? (
                  <div className="p-4 text-center">Loading...</div>
                ) : (
                  <Menu
                    className={`${sidebarFocused ? "sidebar-focused" : ""}`}
                    selectedKeys={findSelectedKey()}
                    mode="inline"
                    items={convertMenuItems(activeMenuItems)}
                    onClick={handleMenuClick}
                    style={{
                      fontWeight: sidebarFocused ? 500 : 400,
                    }}
                  />
                )}
                <div
                  className="p-[16px] text-red-700 cursor-pointer flex items-center gap-2 hover:bg-gray-100 mb-[100px]"
                  onClick={handleLogout}
                >
                  <LogoutOutlined />
                  <span className="font-[500]">Logout</span>
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
          collapsedWidth="0"
          style={{
            background: colorBgContainer,
            overflow: "auto",
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
            <h1>Kawal MBG</h1>
          </div>
          <div className="flex flex-col justify-between h-full">
            {isLoading ? (
              <div className="p-4 text-center">Loading...</div>
            ) : (
              <Menu
                className={`${sidebarFocused ? "sidebar-focused" : ""}`}
                selectedKeys={findSelectedKey()}
                mode="inline"
                items={convertMenuItems(activeMenuItems)}
                onClick={handleMenuClick}
                style={{
                  fontWeight: sidebarFocused ? 500 : 400,
                }}
              />
            )}
            <div
              className="p-[16px] text-red-700 cursor-pointer flex items-center gap-2 hover:bg-gray-100 mb-[100px]"
              onClick={handleLogout}
            >
              <LogoutOutlined />
              {!collapsed && <span className="font-[500]">Logout</span>}
            </div>
          </div>
        </Sider>
      )}

      {/* Main content layout */}
      <Layout>
        <Header style={{ padding: "0 16px", background: colorBgContainer }}>
          <div className="flex justify-between lg:justify-end">
            <h1 className="lg:hidden">Kawal MBG</h1>
            <div
              className={`cursor-pointer lg:hidden rounded-md transition-all ${
                sidebarFocused ? "text-blue-700" : ""
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
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }} items={breadcrumbItems} />
          <div
            style={{
              padding: 24,
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
