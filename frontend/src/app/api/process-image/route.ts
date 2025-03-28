import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs'

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
        let image = sharp(buffer);

        // Obtém meta-dados da imagem original.
        const metadata = await image.metadata();
        if (!metadata.width || !metadata.height) {
            return NextResponse.json({ error: 'Formato de imagem não suportado' }, { status: 400 });
        }

        const imgRatio = metadata.width / metadata.height;
        const targetRatio = TARGET_SIZE.width / TARGET_SIZE.height;

        // Define a área de corte mantendo a proporção.
        if (imgRatio > targetRatio) {
            const newWidth = Math.floor(metadata.height * targetRatio);
            image = image.extract({
                left: Math.floor((metadata.width - newWidth) / 2),
                top: 0,
                width: newWidth,
                height: metadata.height
            });
        } else {
            const newHeight = Math.floor(metadata.width / targetRatio);
            image = image.extract({
                left: 0,
                top: Math.floor((metadata.height - newHeight) / 2),
                width: metadata.width,
                height: newHeight
            });
        }

        // Redimensiona para 1200x750
        image = image.resize(TARGET_SIZE.width, TARGET_SIZE.height);

        // Carrega as imagens de sobreposição.
        const topLeft = await sharp(PNG_TOP_LEFT).ensureAlpha().toBuffer();
        const bottomRight = await sharp(PNG_BOTTOM_RIGHT).ensureAlpha().toBuffer();
        const logo = await sharp(LOGO_PATH).resize({ height: 50 }).ensureAlpha().toBuffer();

        // Compoõe as imagens
        const finalImage = await image.composite([
            { input: topLeft, left: 0, top: 0 },
            { input: bottomRight, left: TARGET_SIZE.width - (await sharp(bottomRight).metadata()).width!, top: TARGET_SIZE.height - (await sharp(bottomRight).metadata()).height! },
            { input: logo, left: TARGET_SIZE.width - (await sharp(logo).metadata()).width! - 10, top: 10 }
        ]).png().toBuffer();

        const processedImagePath = path.join(process.cwd(), 'public', 'processed-image.png');
        await fs.promises.writeFile(processedImagePath, finalImage);

        const imageUrl = `/processed-image.png?${Date.now()}`;

        return new NextResponse(
            JSON.stringify({ imageUrl }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    } catch (error) {
        console.log(error)
        return NextResponse.json({ error: 'Erro ao processar a imagem' }, { status: 500 });
    }
}
