import {useCallback, useEffect, useState} from 'react';
import Cropper, {Area} from 'react-easy-crop';
import {cropImage} from '@/utils/crop-image';
import {removeBackground}  from "@imgly/background-removal";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface ImageCropperProps {
    image: string;
    onCropComplete: (croppedImage: File | null) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    mode: 'products' | 'content';
}

const ImageCropper = ({image, onCropComplete, isOpen, setIsOpen, mode}: ImageCropperProps) => {
    const [crop, setCrop] = useState({x: 0, y: 0});
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isOpen && mode === 'products') {
            handleBackgroundRemoval(image)
                .then(() => setIsProcessing(false));
        }
    }, [mode, isOpen, image]);

    const handleBackgroundRemoval = async (imageSrc: string) => {
            setIsProcessing(true);

            // Remover fundo usando `imglyRemoveBackground`
            const blob = await removeBackground(imageSrc);

            // Converter Blob para URL
            const url = URL.createObjectURL(blob);
            setProcessedImage(url);
    };


    const handleCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const handleConfirmCrop = async () => {
        const finalImage = processedImage || image;
        if (finalImage && croppedAreaPixels) {
            const croppedFile = await cropImage(finalImage, croppedAreaPixels);
            onCropComplete(croppedFile);
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className={'w-2/3'}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Selecione a área de corte</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="w-full h-96 relative flex flex-col items-center justify-center">
                    {isProcessing ? (
                        <p className="text-center text-gray-500">Removendo fundo...</p>
                    ) : (
                        <Cropper
                            image={processedImage || image}
                            crop={crop}
                            zoom={zoom}
                            aspect={mode === 'products' ? 1.125 : 1.6}
                            onCropChange={setCrop}
                            onCropComplete={handleCropComplete}
                            onZoomChange={setZoom}
                        />
                    )}
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmCrop} disabled={isProcessing}>
                        {isProcessing ? 'Processando...' : 'Confirmar'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ImageCropper;
