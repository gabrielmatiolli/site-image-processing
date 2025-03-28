import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema, FormType } from "@/validators/form-validator";
import axios from "axios";
import { useState } from "react";

export default function useFileForm() {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false); // Estado para abrir o Dialog

    const form = useForm<FormType>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            file: ''
        }
    });

    function onSubmit(values: FormType) {
        const formData = new FormData();
        formData.append('file', values.file);

        axios.post('/api/process-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(response => {
                setImageUrl(response.data.imageUrl); // Ajuste conforme a API retorna a URL
                setOpenDialog(true); // Abre o Dialog ao receber a imagem
            })
            .catch(error => console.error('Erro no upload:', error));
    }

    return { form, onSubmit, imageUrl, openDialog, setOpenDialog };
}
