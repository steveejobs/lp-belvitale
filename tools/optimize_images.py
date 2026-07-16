"""Create optimized derivatives from approved source images.

The tool never modifies the source file. Cropping is explicit so product and
proof framing can be reviewed before a derivative is published.
"""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def parse_crop(value: str) -> tuple[int, int, int, int]:
    parts = tuple(int(part) for part in value.split(","))
    if len(parts) != 4:
        raise argparse.ArgumentTypeError("crop must use x,y,width,height")
    x, y, width, height = parts
    if min(x, y) < 0 or min(width, height) <= 0:
        raise argparse.ArgumentTypeError("crop values must describe a positive area")
    return x, y, width, height


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--crop", type=parse_crop)
    parser.add_argument("--max-width", type=int)
    parser.add_argument("--quality", type=int, default=86)
    return parser


def main() -> None:
    args = build_parser().parse_args()
    with Image.open(args.input) as source:
        image = source.convert("RGB")
        if args.crop is not None:
            x, y, width, height = args.crop
            if x + width > image.width or y + height > image.height:
                raise ValueError("crop exceeds source dimensions")
            image = image.crop((x, y, x + width, y + height))
        if args.max_width is not None and image.width > args.max_width:
            height = round(image.height * args.max_width / image.width)
            image = image.resize((args.max_width, height), Image.Resampling.LANCZOS)

        args.output.parent.mkdir(parents=True, exist_ok=True)
        image.save(args.output, format="WEBP", quality=args.quality, method=6)
        print(f"{args.output}: {image.width}x{image.height}")


if __name__ == "__main__":
    main()
