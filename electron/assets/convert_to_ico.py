# Tested on Python 3.10.6 [MSC v.1932 64 bit (AMD64)]
from PIL import Image # Pillow version 10.1.0

# Load the image

img = Image.open("icon.png")



# ICO format specific: multiple sizes can be saved in one .ico file, 

# here we save the highest possible quality for Windows 10 which usually supports up to 256x256 pixels.

ico_sizes = [(16,16), (32,32), (48,48), (64,64), (128,128), (256,256)]



# Convert and save the image

output_path = "icon.ico"

img.save(output_path, format='ICO', sizes=ico_sizes)
