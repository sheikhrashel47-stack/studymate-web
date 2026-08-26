from pathlib import Path

from PIL import Image


ICON_PATHS = [
    Path("assets/images/icon.png"),
    Path("assets/images/splash-icon.png"),
    Path("assets/images/favicon.png"),
    Path("assets/images/android-icon-foreground.png"),
]


def main() -> None:
    for path in ICON_PATHS:
        image = Image.open(path).convert("RGBA")
        image.thumbnail((512, 512), Image.Resampling.LANCZOS)
        image.save(path, format="PNG", optimize=True, compress_level=9)
        print(f"Optimized {path}: {image.size[0]}×{image.size[1]}")


if __name__ == "__main__":
    main()
