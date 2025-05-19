import { Redirect } from 'expo-router';
import { auth } from '../firebaseConfig';

export default function Index() {
  const user = auth.currentUser;
  
  if (!user) {
    return <Redirect href="/login" />;
  }
  
  return <Redirect href="/(tabs)/homePage" />;
}
