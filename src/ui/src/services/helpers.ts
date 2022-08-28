export const getApiUrl = (): string =>
  `${window.location.protocol}//${window.location.hostname}:${
    // @ts-expect-error Environment variable
    import.meta.env.VITE_API_PORT
  }`;

export const toFormData = (obj: Object): FormData => {
  const formData = new FormData();
  Object.keys(obj).forEach((key) => formData.append(key, obj[key]));
  return formData;
};

export const getCurrentTimestamp = (): number => Date.now();
//export const getCurrentTimestamp = (): number => Math.floor(Date.now() / 1000);
