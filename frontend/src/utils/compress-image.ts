const compressImage = async (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<File> => {
    // Lê a imagem como DataURL usando uma Promise
    const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const imageDataUrl = await readFileAsDataURL(file);

    const img = new Image();
    img.src = imageDataUrl;

    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
        throw new Error("Failed to get canvas context");
    }

    let { width, height } = img;

    if (width > maxWidth || height > maxHeight) {
        if (width > height) {
            height *= maxWidth / width;
            width = maxWidth;
        } else {
            width *= maxHeight / height;
            height = maxHeight;
        }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    // Retorna uma Promise para o arquivo comprimido.
    return new Promise((resolve) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(new File([blob], "compressed_image.webp", { type: "image/webp" }));
                }
            },
            "image/webp",
            quality
        );
    });
};

export default compressImage;
