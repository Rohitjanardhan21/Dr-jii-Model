// src/utils/cropImage.js
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', (error) => reject(error));
    img.setAttribute('crossOrigin', 'anonymous'); // for CORS support
    img.src = url;
  });

export const getRadianAngle = (degreeValue) => (degreeValue * Math.PI) / 180;

export default async function getCroppedImg(imageSrc, crop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const safeArea = Math.max(image.width, image.height) * 2;
  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate(getRadianAngle(rotation));
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  const pixelRatio = window.devicePixelRatio;
  canvas.width = crop.width * pixelRatio;
  canvas.height = crop.height * pixelRatio;
  ctx.putImageData(data, -crop.x * pixelRatio, -crop.y * pixelRatio);

  return new Promise((resolve) => {
    canvas.toBlob((file) => resolve(file), 'image/jpeg');
  });
}
