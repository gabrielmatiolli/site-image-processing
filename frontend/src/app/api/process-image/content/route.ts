import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

const TARGET_SIZE = { width: 1200, height: 750 };
const LOGO_PATH = path.join(process.cwd(), 'public/logo.png');
const PNG_TOP_LEFT = path.join(process.cwd(), 'public/top-left.png');
const PNG_BOTTOM_RIGHT = path.join(process.cwd(), 'public/bottom-right.png');
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

        // Redimensiona a imagem para 1200x750
        const resizedImage = image.resize(TARGET_SIZE.width, TARGET_SIZE.height);

        // Carrega as imagens de sobreposição.
        const topLeft = await sharp(PNG_TOP_LEFT).ensureAlpha().toBuffer();
        const bottomRight = await sharp(PNG_BOTTOM_RIGHT).ensureAlpha().toBuffer();
        const logo = await sharp(LOGO_PATH).resize({ height: 50 }).ensureAlpha().toBuffer();

        // Compoõe as imagens, ajustando as posições.
        const finalImage = await resizedImage.composite([
            { input: topLeft, left: 0, top: 0 },
            { input: bottomRight, left: TARGET_SIZE.width - 400, top: TARGET_SIZE.height - 70 }, // Ajuste a posição do bottom-right;
            { input: logo, left: TARGET_SIZE.width - 210, top: 10 } // Ajuste a posição da logo;
        ]).webp().toBuffer();

        const processedImagePath = path.join(process.cwd(), 'public', 'processed-image.webp');
        await fs.promises.writeFile(processedImagePath, finalImage);

        const imageUrl = `/processed-image.webp?${Date.now()}`;

        return new NextResponse(
            JSON.stringify({ imageUrl }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: 'Erro ao processar a imagem' }, { status: 500 });
    }
}
