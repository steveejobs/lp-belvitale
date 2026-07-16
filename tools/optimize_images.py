"""Convert a local image to an optimized WebP without upscaling it."""

from __future__ import annotations

import argparse
from pathlib import Path
from typing import Final

from PIL import Image, ImageOps


DEFAULT_MAX_SIZE: Final = 1600
DEFAULT_QUALITY: Final = 84


def positive_integer(value: str) -> int:
    parsed = int(value)
    if parsed <= 0:
        raise argparse.ArgumentTypeError("o valor precisa ser maior que zero")
    return parsed


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Otimiza uma imagem para WebP, preservando proporcao e transparencia."
    )
    parser.add_argument("input", type=Path, help="Arquivo-fonte")
    parser.add_argument("output", type=Path, help="Arquivo .webp de destino")
    parser.add_argument(
        "--max-size",
        type=positive_integer,
        default=DEFAULT_MAX_SIZE,
        help="Maior dimensao permitida em pixels (padrao: 1600)",
    )
    parser.add_argument(
        "--quality",
        type=positive_integer,
        default=DEFAULT_QUALITY,
        help="Qualidade WebP de 1 a 100 (padrao: 84)",
    )
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="Permite substituir o destino existente",
    )
    return parser.parse_args()


def optimize_image(
    source: Path,
    destination: Path,
    max_size: int,
    quality: int,
    overwrite: bool,
) -> tuple[tuple[int, int], tuple[int, int]]:
    if not source.is_file():
        raise FileNotFoundError(f"arquivo-fonte nao encontrado: {source}")
    if destination.suffix.lower() != ".webp":
        raise ValueError("o destino precisa usar a extensao .webp")
    if destination.exists() and not overwrite:
        raise FileExistsError(
            f"destino ja existe: {destination}. Use --overwrite para substituir."
        )
    if quality > 100:
        raise ValueError("quality precisa estar entre 1 e 100")

    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as opened:
        image = ImageOps.exif_transpose(opened)
        original_size = image.size
        image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        optimized_size = image.size

        has_alpha = "A" in image.getbands() or "transparency" in image.info
        target_mode = "RGBA" if has_alpha else "RGB"
        if image.mode != target_mode:
            image = image.convert(target_mode)

        image.save(
            destination,
            format="WEBP",
            quality=quality,
            method=6,
            optimize=True,
            exact=has_alpha,
        )

    return original_size, optimized_size


def main() -> None:
    args = parse_args()
    original, optimized = optimize_image(
        source=args.input,
        destination=args.output,
        max_size=args.max_size,
        quality=args.quality,
        overwrite=args.overwrite,
    )
    source_bytes = args.input.stat().st_size
    output_bytes = args.output.stat().st_size
    print(
        f"{args.input} {original[0]}x{original[1]} ({source_bytes} bytes) -> "
        f"{args.output} {optimized[0]}x{optimized[1]} ({output_bytes} bytes)"
    )


if __name__ == "__main__":
    main()
