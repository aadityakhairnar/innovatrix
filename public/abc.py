import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
import imutils

# Step 1: Load Images
def load_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        raise FileNotFoundError(f"Error: Unable to load image at path: {image_path}")
    return image

# Load multiple original images
def load_images(image_paths):
    images = []
    for path in image_paths:
        images.append(load_image(path))
    return images

# Step 2: Preprocess Images (Convert to grayscale, resize, and align)
def preprocess_image(image, size=(500, 300)):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    resized_image = cv2.resize(gray_image, size)
    return resized_image

# Preprocess multiple images
def preprocess_images(images, size=(500, 300)):
    return [preprocess_image(image, size) for image in images]

# Step 3: Align Images (if necessary)
def align_images(imageA, imageB):
    # Implement feature matching and alignment here if necessary
    return imageA, imageB

# Step 4: Compute Similarity (SSIM)
def compute_similarity(original_image, current_image):
    return ssim(original_image, current_image, full=True)

# Step 5: Calculate Tampering Percentage
def calculate_tampering_percentage(similarity):
    tampering_percentage = (1 - similarity) * 100
    return tampering_percentage

# Step 6: Visualize Differences
def visualize_differences(original_image, tampered_image, diff, thresh):
    # Draw bounding boxes around the different regions
    cnts = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = imutils.grab_contours(cnts)
    
    for c in cnts:
        (x, y, w, h) = cv2.boundingRect(c)
        cv2.rectangle(original_image, (x, y), (x + w, y + h), (0, 0, 255), 2)
        cv2.rectangle(tampered_image, (x, y), (x + w, y + h), (0, 0, 255), 2)

    # Display the images
    cv2.imshow("Original", original_image)
    cv2.imshow("Tampered", tampered_image)
    cv2.imshow("Diff", diff)
    cv2.imshow("Thresh", thresh)
    cv2.waitKey(0)

# Main Function to Demonstrate the Process
def check_tampering(original_image_paths, current_image_path):
    try:
        # Load original images and current image
        original_images = load_images(original_image_paths)
        current_image = load_image(current_image_path)

        # Preprocess images
        processed_original_images = preprocess_images(original_images)
        processed_current_image = preprocess_image(current_image)

        # Initialize the highest similarity and corresponding original image
        highest_similarity = -1
        best_original_image = None

        # Compute similarity for each original image
        for processed_original_image in processed_original_images:
            aligned_original, aligned_current = align_images(processed_original_image, processed_current_image)
            similarity, diff = compute_similarity(aligned_original, aligned_current)
            if similarity > highest_similarity:
                highest_similarity = similarity
                best_original_image = processed_original_image
                best_diff = diff

        # Threshold the best difference image
        best_diff = (best_diff * 255).astype("uint8")
        thresh = cv2.threshold(best_diff, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]

        # Calculate tampering percentage
        tampering_percentage = calculate_tampering_percentage(highest_similarity)
        print(f"Tampering Percentage: {tampering_percentage:.2f}%")

        # Visualize differences
        visualize_differences(best_original_image, processed_current_image, best_diff, thresh)
    except FileNotFoundError as e:
        print(e)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# Call the function with image paths
original_image_paths = [
    r'D:\cognizant\website\my-app\public\images\originals\NewPan.jpeg'
]
current_image_path = r'D:\cognizant\website\my-app\public\images\originals\NewPan.jpeg'

check_tampering(original_image_paths, current_image_path)