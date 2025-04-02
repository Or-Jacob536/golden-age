import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { FontAwesome5 } from "@expo/vector-icons";
import { ThemeContext } from "../../contexts/ThemeContext";

export default function TabsLayout() {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: t("tabs.home"),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="home" size={size} color={color} />
          ),
          href: {
            pathname: "/(tabs)",
          },
        }}
      />
      <Tabs.Screen
        name="restaurant"
        options={{
          tabBarLabel: t("tabs.restaurant"),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="utensils" size={size} color={color} />
          ),
          href: {
            pathname: "/(tabs)/restaurant",
          },
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          tabBarLabel: t("tabs.activities"),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="calendar-alt" size={size} color={color} />
          ),
          href: {
            pathname: "/(tabs)/activities",
          },
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarLabel: t("tabs.messages"),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="envelope" size={size} color={color} />
          ),
          href: {
            pathname: "/(tabs)/messages",
          },
        }}
      />
      <Tabs.Screen
        name="medical"
        options={{
          tabBarLabel: t("tabs.medical"),
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="heartbeat" size={size} color={color} />
          ),
          href: {
            pathname: "/(tabs)/medical",
          },
        }}
      />
    </Tabs>
  );
}
