const compressImage = async (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.7): Promise<File> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > maxWidth || height > maxHeight) {
                    if (width > height) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    } else {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                }

                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(new File([blob], file.name, { type: "image/webp", lastModified: Date.now() }));
                    } else {
                        resolve(file);
                    }
                }, "image/webp", quality);
            };
        };
    });
};

export default compressImage;