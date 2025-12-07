export const loadFromS3 = async (fileUrl: string) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    const fileName = fileUrl.split('/').pop() || 'file';

    return new File([blob], fileName, { type: blob.type });
  } catch (e) {
    console.error('Error of file loading, ' + e);
  }
};
