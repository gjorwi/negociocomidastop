const MAX_DATA_URL_LENGTH = 700_000;

const attempts = [
  { maxSide: 1200, quality: 0.85 },
  { maxSide: 1000, quality: 0.76 },
  { maxSide: 900, quality: 0.66 },
  { maxSide: 800, quality: 0.56 },
];

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen. Usa otra foto."));
    };
    image.src = url;
  });
}

export async function compressImage(file) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen.");
  }

  const image = await loadImage(file);

  for (const { maxSide, quality } of attempts) {
    const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length <= MAX_DATA_URL_LENGTH) return dataUrl;
  }

  throw new Error("La foto es demasiado pesada. Elige una imagen más pequeña.");
}
