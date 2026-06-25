import { Platform, Linking } from 'react-native';
import { api } from './api';

export async function openGoogleAuth() {
  const platform = Platform.OS === 'web' ? 'web' : 'mobile';
  const { url } = await api.getGoogleAuthUrl(platform);

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.href = url;
    return;
  }

  await Linking.openURL(url);
}
