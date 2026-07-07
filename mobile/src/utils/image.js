import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Redimensiona/comprime para um data URL pequeno (bom para avatar).
async function toDataUrl(uri) {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: 256 });
  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({
    base64: true,
    compress: 0.6,
    format: SaveFormat.JPEG,
  });
  return `data:image/jpeg;base64,${result.base64}`;
}

/**
 * Abre a galeria, deixa recortar em quadrado e devolve um data URL comprimido.
 * source: 'library' | 'camera'
 * Devolve null se cancelado.
 */
export async function pickAvatar(source = 'library') {
  if (source === 'camera') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error('Precisamos de acesso à câmara.');
  } else {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new Error('Precisamos de acesso às tuas fotos.');
  }

  const opts = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  };

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(opts)
      : await ImagePicker.launchImageLibraryAsync(opts);

  if (result.canceled || !result.assets?.length) return null;
  return toDataUrl(result.assets[0].uri);
}
