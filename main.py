from fastapi import FastAPI, File, UploadFile, Response
from PIL import Image
import io

app = FastAPI()

TARGET_SIZE = (1200, 750)
LOGO_PATH = "static/logo.png"  # Caminho da logo em PNG
PNG_TOP_LEFT = "static/top-left.png"  # Caminho do PNG superior esquerdo
PNG_BOTTOM_RIGHT = "static/bottom-right.png"  # Caminho do PNG inferior direito


def ensure_rgba(image):
    if image.mode != "RGBA":
        return image.convert("RGBA")
    return image


def crop_center(image, target_size):
    img_width, img_height = image.size
    target_width, target_height = target_size

    # Calcula a proporção de corte
    img_ratio = img_width / img_height
    target_ratio = target_width / target_height

    if img_ratio > target_ratio:
        # A imagem é mais larga que o necessário, cortar as laterais
        new_width = int(img_height * target_ratio)
        new_height = img_height
    else:
        # A imagem é mais alta que o necessário, cortar a parte superior/inferior
        new_width = img_width
        new_height = int(img_width / target_ratio)

    left = (img_width - new_width) // 2
    top = (img_height - new_height) // 2
    right = left + new_width
    bottom = top + new_height

    return image.crop((left, top, right, bottom))


@app.post("/process-image/")
async def process_image(file: UploadFile = File(...)):
    # Abrir a imagem enviada
    image = Image.open(io.BytesIO(await file.read())).convert("RGBA")

    # Cortar mantendo a proporção e redimensionar para 1200x750
    image = crop_center(image, TARGET_SIZE).resize(TARGET_SIZE, Image.LANCZOS)

    # Abrir os arquivos PNG diretamente e garantir que estejam em RGBA
    top_left = ensure_rgba(Image.open(PNG_TOP_LEFT))
    bottom_right = ensure_rgba(Image.open(PNG_BOTTOM_RIGHT))
    logo = ensure_rgba(Image.open(LOGO_PATH))

    # Redimensionar a logo para que sua altura seja de 50px
    logo_ratio = logo.width / logo.height
    new_logo_height = 50
    new_logo_width = int(new_logo_height * logo_ratio)
    logo = logo.resize((new_logo_width, new_logo_height), Image.LANCZOS)

    # Criar uma cópia da imagem base para edição
    final_image = image.copy()

    # Sobrepor PNGs na imagem
    final_image.paste(top_left, (0, 0), top_left)
    final_image.paste(bottom_right, (TARGET_SIZE[0] - bottom_right.width, TARGET_SIZE[1] - bottom_right.height),
                      bottom_right)

    # Adicionar logo com espaçamento
    padding = 10
    logo_position = (TARGET_SIZE[0] - new_logo_width - padding, padding)
    final_image.paste(logo, logo_position, logo)

    # Converter a imagem final para bytes
    img_byte_arr = io.BytesIO()
    final_image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)

    return Response(content=img_byte_arr.getvalue(), media_type="image/png")