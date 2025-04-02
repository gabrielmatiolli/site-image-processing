import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import sharp from 'sharp';
import { createCanvas, loadImage } from 'canvas';
import { put } from '@vercel/blob';

const TARGET_SIZE = { width: 800, height: 900 };
const LOGO_SIZE = { width: 566 }; // Largura fixa da logo
const LOGO_PATH = path.join(process.cwd(), 'public/logo.png');
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/webp', 'image/png', 'image/svg+xml'];

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file || !(file instanceof Blob)) {
            return NextResponse.json({ error: 'Arquivo inválido' }, { status: 400 });
        }

        if (!ALLOWED_FORMATS.includes(file.type)) {
            return NextResponse.json({ error: 'Formato de imagem não suportado' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const image = sharp(buffer);

        // Redimensiona a imagem para 800x900
        const resizedImageBuffer = await image.resize(TARGET_SIZE.width, TARGET_SIZE.height).toBuffer();
        const resizedImage = await loadImage(resizedImageBuffer);

        // Redimensiona a logo para 566px de largura
        const logoBuffer = await sharp(LOGO_PATH).resize(LOGO_SIZE).toBuffer();
        const logo = await loadImage(logoBuffer);

        // Criando um canvas
        const canvas = createCanvas(TARGET_SIZE.width, TARGET_SIZE.height);
        const ctx = canvas.getContext('2d');

        // Desenha a imagem de fundo
        ctx.drawImage(resizedImage, 0, 0, TARGET_SIZE.width, TARGET_SIZE.height);

        // Define a opacidade da logo e desenha no canvas
        ctx.globalAlpha = 0.25;
        const centerX = Math.floor((TARGET_SIZE.width - LOGO_SIZE.width) / 2);
        const centerY = Math.floor((TARGET_SIZE.height - (LOGO_SIZE.width * (logo.height / logo.width))) / 2);
        ctx.drawImage(logo, centerX, centerY, LOGO_SIZE.width, LOGO_SIZE.width * (logo.height / logo.width));
        ctx.globalAlpha = 1.0; // Restaura a opacidade

        // Converte o canvas para buffer PNG
        const pngBuffer = canvas.toBuffer('image/png');

        // Converte a imagem para WebP com sharp
        const finalImageBuffer = await sharp(pngBuffer).toFormat('webp').toBuffer();

        // Envia a imagem para o Vercel Blob
        const blob = await put(`processed-image-${Date.now()}.webp`, finalImageBuffer, {
            access: 'public', // Torna o arquivo acessível publicamente
            contentType: 'image/webp'
        });

        return NextResponse.json({ imageUrl: blob.url }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Erro ao processar a imagem' }, { status: 500 });
    }
}
