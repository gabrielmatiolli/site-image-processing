import imageCompression from "browser-image-compression";

const compressImage = async (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<File> => {
    const options = {
        maxSizeMB: 4.5, // Tamanho máximo do arquivo final (4.5MB)
        maxWidthOrHeight: Math.max(maxWidth, maxHeight), // Ajusta o maior lado
        useWebWorker: true, // Usa WebWorker para melhorar a performance
        initialQuality: quality, // Qualidade inicial
        alwaysKeepResolution: true, // Mantém a resolução original
    };

    try {
        return await imageCompression(file, options);
    } catch (error) {
        console.error("Erro ao comprimir imagem:", error);
        return file; // Se der erro, retorna o arquivo original
    }
};

export default compressImage;
