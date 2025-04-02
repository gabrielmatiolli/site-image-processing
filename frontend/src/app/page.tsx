"use client"

import React, {ChangeEvent, useEffect, useRef, useState} from "react";
import useFileForm from "@/hooks/use-form";
import ImageCropper from "@/components/image-cropper";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import logo from '@/assets/logo.svg';
import {ChangeMode} from "@/components/change-mode";
import compressImage from "@/utils/compress-image";

export default function Home() {
    const [mode, setMode] = useState<'products' | 'content'>('products');
    const {form, onSubmit, imageUrl, openDialog, setOpenDialog} = useFileForm({mode});
    const [fileName, setFileName] = useState("imagem.webp");
    const [imageSrc, setImageSrc] = useState<string | ArrayBuffer | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (openDialog) {
            requestAnimationFrame(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            });
        }
    }, [openDialog]);

    const downloadImage = async () => {
        if (!imageUrl) return;

        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Libera o objeto Blob da memória
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Erro ao baixar a imagem:", error);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && imageUrl) {
            event.preventDefault();
            const link = document.createElement("a");
            link.href = imageUrl;
            link.download = fileName;
            link.click();
        }
    };

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB

        const maxWidth = mode === 'content' ? 1800 : 2400;
        const maxHeight = mode === 'content' ? 2400 : 1500;

        let processedFile = file; // Inicialmente, o arquivo original

        console.log("Tamanho do arquivo original:", file.size);

        if (file.size > MAX_FILE_SIZE) {
            processedFile = await compressImage(file, maxWidth, maxHeight, 1);
            console.log("Tamanho do arquivo comprimido:", processedFile.size);
        }

        form.setValue('file', processedFile);

        setCropperOpen(true);

        // Atualiza a visualização da imagem.
        const reader = new FileReader();
        reader.onload = () => setImageSrc(reader.result);
        reader.readAsDataURL(processedFile);
    };


    const handleCropComplete = (croppedImage: File | null) => {
        if (croppedImage) {
            form.setValue('file', croppedImage);
            setImageSrc(null);
            onSubmit(form.getValues());
        }
    };

    console.log("URL da imagem:", imageUrl);

    return (
        <>
            <Image src={logo} alt="Logo" width={200} height={200}/>
            <div
                className="w-1/5 h-fit p-4 rounded-md shadow-sm bg-white flex flex-col items-center justify-center gap-6">
                <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-center">
                    Padronizador de imagens
                </h1>
                <ChangeMode mode={mode} changeMode={setMode}/>
                <Form {...form}>
                    <form className="flex flex-col items-center justify-center w-full gap-4"
                          onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="file"
                            render={() => (
                                <FormItem className="w-full">
                                    <FormLabel>Imagem</FormLabel>
                                    <FormControl>
                                        <Input type="file" accept=".jpg,.png,.jpeg,.svg" multiple={false}
                                               onChange={handleFileChange}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <ImageCropper image={imageSrc as string} onCropComplete={handleCropComplete}
                                      isOpen={cropperOpen} setIsOpen={setCropperOpen} mode={mode}/>
                    </form>
                </Form>
            </div>

            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent className={'flex flex-col items-stretch justify-center w-full'}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Imagem processada</AlertDialogTitle>
                    </AlertDialogHeader>
                    {imageUrl && (
                        <Image src={imageUrl} alt="Imagem processada" width={mode === 'products' ? 300 : 600}
                               height={mode === 'products' ? 400 : 900}
                               className="rounded-md shadow-md m-auto"/>
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>Fechar</AlertDialogCancel>
                        {imageUrl && (
                            <>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={fileName}
                                    onChange={(e) => setFileName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    className="w-full mb-2 px-2 py-1 border rounded-md"
                                    placeholder="Digite o nome do arquivo"
                                />
                                <Button className="mr-2" onClick={downloadImage}>Baixar Imagem</Button>
                            </>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
