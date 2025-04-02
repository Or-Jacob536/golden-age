import { useEffect } from 'react';
import { Redirect } from 'expo-router';

// This file serves as the entry point for the (auth) group
// It redirects to the login screen
export default function AuthIndex() {
  return <Redirect href="/login" />;
}