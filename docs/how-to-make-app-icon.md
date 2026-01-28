# How to Make App Icon

## MacOS Icon

This section describe the steps to create MacOS icon file from the base icon image from the previous step.

1. Open `images/icon.svg` in Inkscape.

2. Export the base image as `icon1024.png` (`1024x1024`) and `icon512.png` (`512x512`).

3. Run:

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

   The `icon.icns` file will be produced in the current directory.

4. Move `icon.icns` into `images/`.
