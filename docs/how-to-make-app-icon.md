# How to Make App Icon

The app icon is the [Send icon](https://tabler.io/icons/icon/send) from tabler icons.

## Base Image

Use the following steps to create base icon image:

1. Download the SVG version of the icon at stroke width of 1
1. Open the SVG file in GIMP at 800x800
1. In GIMP, select menu "Image" -> "Canvas Size" and set the size to 1024x1024. Make sure the image
   is centered.
1. Add a new layer as background with color `eaf3fd`.
1. Change the icon color to `238be6`.
1. Save the image, e.g., `icon.xcf`.

## MacOS Icon

This section describe the steps to create MacOS icon file from the base icon image from the previous step.

Export the base image as `icon1024.png` (`1024x1024`) and `icon512.png` (`512x512`).

Run the following;

```bash
# Generate icon masks

magick convert -size 1024x1024 xc:none -draw "roundrectangle 0,0 1024,1024 222,222" mask1024.png

magick convert -size 512x512 xc:none -draw "roundrectangle 0,0 512,512 111,111" mask512.png

# Create PNG icon files

magick icon1024.png mask1024.png -alpha set -compose DstIn -composite icon1024.png

magick icon512.png mask512.png -alpha set -compose DstIn -composite icon512.png

# Make iconset folder

mkdir icon.iconset
cp icon1024.png icon512.png icon.iconset/

# Generate final icon set file
iconutil -c icns icon.iconset
```

The final `icon.icns` file will be produced in the current directory.
