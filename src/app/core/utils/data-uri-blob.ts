export function dataURItoBlob(dataURI: string) {
  const [ab, mimeString] = parseDataURI(dataURI);
  let blob = new Blob([ab], { type: mimeString });
  return blob;
}

export function dataURItoFile(dataURI: string, name?: string) {
  const [ab, mimeString] = parseDataURI(dataURI);
  if (!name) {
    const ext = getImageExt(mimeString);
    name = 'image.' + ext;
  }
  let blob = new File([ab], name, { type: mimeString });
  return blob;
}

export function parseDataURI(dataURI: string): [ArrayBuffer, string] {
  let splitDataURI = dataURI.split(',');
  let byteString = window.atob(splitDataURI[1]);
  let mimeString = splitDataURI[0].split(':')[1].split(';')[0];
  let ab = new ArrayBuffer(byteString.length);
  let ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return [ab, mimeString];
}

export function getImageName(file: File | Blob) {
  if (file instanceof File)
    return file.name;
  const blobExt = getImageExt(file.type);
  return 'image.' + blobExt;
}

export function getImageExt(type: string) {
  switch (type) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
  }
  return 'bin';
}

export function getImageFormat(type: string) {
  switch (type) {
    case 'image/jpeg':
      return 'jpeg';
    case 'image/png':
      return 'png';
    // case 'image/gif':
    //   return 'gif';
    case 'image/webp':
      return 'webp';
  }
  return 'jpeg';
}
