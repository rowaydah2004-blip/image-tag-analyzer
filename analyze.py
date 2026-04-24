import sys
import tensorflow as tf
import numpy as np
from PIL import Image

# load pretrained model
model = tf.keras.applications.MobileNetV2(weights="imagenet")

# load labels decoder
decode_predictions = tf.keras.applications.mobilenet_v2.decode_predictions

# get image path from Node.js
image_path = sys.argv[1]

# process image
img = Image.open(image_path).convert("RGB").resize((224, 224))
img_array = np.array(img)
img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
img_array = np.expand_dims(img_array, axis=0)

# predict
predictions = model.predict(img_array, verbose=0)
decoded = decode_predictions(predictions, top=3)[0]

# print results as: label|score
for _, label, score in decoded:
    print(f"{label}|{score}")