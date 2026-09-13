import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: {
          backgroundColor: "#F6F9FC",
        },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="scanner" />
      <Stack.Screen name="preview" />
      <Stack.Screen name="analysis" />
      <Stack.Screen name="result" />
      <Stack.Screen name="verification" />
      <Stack.Screen name="report" />
      <Stack.Screen name="history" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}