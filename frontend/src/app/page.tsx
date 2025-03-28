"use client"

import useFileForm from "@/hooks/use-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import {
    AlertDialog, AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import logo from '@/assets/logo.svg';
import { ChangeEvent, KeyboardEvent, RefObject, useEffect, useRef, useState } from "react";

export default function Home() {
    const { form, onSubmit, imageUrl, openDialog, setOpenDialog } = useFileForm();
    const [fileName, setFileName] = useState("imagem-processada.png");

    // Função para permitir ao usuário escolher o nome do arquivo.
    const handleFileNameChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFileName(event.target.value);
    };

    const fileNameInputRef: RefObject<HTMLInputElement | null> = useRef(null);

    // Foca no input quando o modal é aberto, com um pequeno delay.
    useEffect(() => {
        if (openDialog) {
            setTimeout(() => {
                if (fileNameInputRef.current) {
                    fileNameInputRef.current.focus();
                }
            }, 100); // Ajuste o delay conforme necessário
        }
    }, [openDialog]);

    // Função para lidar com o evento de pressionar a tecla Enter
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === "Enter") {
            // Baixar a imagem ao pressionar "Enter"
            const downloadLink = document.createElement("a");
            downloadLink.href = imageUrl || "";
            downloadLink.download = fileName; // Define o nome do arquivo
            downloadLink.click();
        }
    };

    return (
        <>
            <Image src={logo} alt="Logo" width={200} height={200} />
            <div className="w-1/5 h-fit p-4 rounded-md shadow-sm bg-white flex flex-col items-center justify-center gap-6 font-signika">
                <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-center">
                    Padronizador de imagens
                </h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col items-center justify-center w-full gap-4">
                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Imagem</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="file"
                                            accept=".jpg,.png,.jpeg,.svg"
                                            multiple={false}
                                            onChange={(event) => {
                                                field.onChange(event.target.files?.[0]);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button className="w-full cursor-pointer" type="submit">Enviar</Button>
                    </form>
                </Form>
            </div>

            <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Imagem processada</AlertDialogTitle>
                    </AlertDialogHeader>
                    {imageUrl && (
                        <Image src={imageUrl} alt="Imagem processada" width={800} height={500} className="rounded-md shadow-md" />
                    )}
                    <AlertDialogFooter>
                        <AlertDialogCancel>Fechar</AlertDialogCancel>
                        {imageUrl && (
                            <>
                                <input
                                    type="text"
                                    value={fileName}
                                    onChange={handleFileNameChange}
                                    onKeyDown={handleKeyDown} // Adiciona o evento para capturar "Enter"
                                    ref={fileNameInputRef} // Foca no input automaticamente
                                    className="w-full mb-2 px-2 py-1 border rounded-md"
                                    placeholder="Digite o nome do arquivo"
                                />
                                <a href={imageUrl} download={fileName}>
                                    <Button className="mr-2">Baixar Imagem</Button>
                                </a>
                            </>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
