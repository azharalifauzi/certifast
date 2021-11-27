export const fileToBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function () {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject('');
    };

    reader.readAsDataURL(file);
  });
