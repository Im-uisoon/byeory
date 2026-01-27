export const compressImage = async (
    file: File,
    maxWidth: number,
    quality: number
): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize logic
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context not available'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Compress
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const newFile = new File([blob], file.name, {
                                type: file.type, // Maintain original type where possible, but usually jpeg/webp
                                lastModified: Date.now(),
                            });
                            console.log(`Image Compressed: ${file.size / 1024}KB -> ${newFile.size / 1024}KB`);
                            resolve(newFile);
                        } else {
                            reject(new Error('Compression failed'));
                        }
                    },
                    file.type === 'image/png' ? 'image/png' : 'image/jpeg', // Conserve transparenc for PNG, else JPEG
                    quality
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
