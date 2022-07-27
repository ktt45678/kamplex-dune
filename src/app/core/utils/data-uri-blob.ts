export function dataURItoBlob(dataURI: string) {
  let splitDataURI = dataURI.split(',');
  let byteString = window.atob(splitDataURI[1]);
  let mimeString = splitDataURI[0].split(':')[1].split(';')[0];
  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  let blob = new Blob([ab], { type: mimeString });
  return blob;
}

export function getImageName(file: File | Blob) {
  if (file instanceof File)
    return file.name;
  const blobExt = getImageExt(file.type);
  return 'unknown.' + blobExt;
}

export function getImageExt(type: string) {
  switch (type) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
  }
  return 'unknown';
}

export function getImageFormat(type: string) {
  switch (type) {
    case 'image/jpeg':
      return 'jpeg';
    case 'image/png':
      return 'png';
  }
  return 'jpeg';
}
