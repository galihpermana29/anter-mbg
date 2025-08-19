"use client";

import React, { useState, useMemo, useEffect } from "react";
import { getSessionClient } from "@/shared/session/get-session-client";
import {
  ShoppingCartOutlined,
  BookOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, Layout, Menu, theme } from "antd";
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
  const [userRole, setUserRole] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuItems, setActiveMenuItems] = useState<CustomMenuItem[]>([]);
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const pathname = usePathname();
  const router = useRouter();
  
  // Fetch session data to determine user role
  useEffect(() => {
    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const sessionData = await getSessionClient();
        // Get role from either direct property or user object
        const role = sessionData.role || (sessionData.user?.role) || "";
        setUserRole(role);
        
        // Set menu items based on role
        if (role === "KITCHEN") {
          setActiveMenuItems(kitchenMenu);
        } else if (role === "SCHOOL") {
          setActiveMenuItems(schoolMenu);
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
    <Layout style={{ height: "100vh" }}>
      <Sider
        style={{ background: colorBgContainer }}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div className="h-[64px] flex items-center justify-center">
          <Image src={primaryLogo} alt="logo" />
        </div>
        <div className="flex flex-col justify-between h-full">
          {isLoading ? (
            <div className="p-4 text-center">Loading...</div>
          ) : (
            <Menu
              className=""
              selectedKeys={findSelectedKey()}
              mode="inline"
              items={convertMenuItems(activeMenuItems)}
              onClick={handleMenuClick}
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
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Content style={{ margin: "0 16px" }}>
          <Breadcrumb style={{ margin: "16px 0" }} items={breadcrumbItems} />
          <div
            style={{
              padding: 24,
              height: "80vh",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
              overflowY: "auto",
            }}
          >
            {children}
          </div>
        </Content>
        <Footer style={{ textAlign: "center", zIndex: 9999 }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
