export const GWR_ORIGINAL_ASSET_REFRESH_MESSAGE = 'No se pudo obtener la imagen original. Actualiza la pagina e intenta de nuevo.';

export function showUserNotice(targetWindow = globalThis, message = '') {
  const normalizedMessage = typeof message === 'string' ? message.trim() : '';
  if (!normalizedMessage) {
    return false;
  }

  try {
    if (typeof targetWindow?.alert === 'function') {
      targetWindow.alert(normalizedMessage);
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
