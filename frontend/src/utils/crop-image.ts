export async function cropImage(imageSrc: string, cropArea: { x: number; y: number; width: number; height: number }) {
    return new Promise<File | null>((resolve, reject) => {
        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                reject("Could not create canvas context");
                return;
            }

            canvas.width = cropArea.width;
            canvas.height = cropArea.height;

            ctx.drawImage(
                img,
                cropArea.x, cropArea.y, cropArea.width, cropArea.height,
                0, 0, cropArea.width, cropArea.height
            );

            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], "cropped-image.png", {type: "image/png"}));
                } else {
                    reject("Failed to crop image");
                }
            }, "image/png");
        };

        img.onerror = (error) => reject(error);
    });
}
