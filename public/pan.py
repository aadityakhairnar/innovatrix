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

# Step 2: Preprocess Images (Convert to grayscale, resize, and align)
def preprocess_image(image, size=(500, 300)):
    gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    resized_image = cv2.resize(gray_image, size)
    return resized_image

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
def check_tampering(original_image_path, current_image_path):
    try:
        # Load original and current images
        original_image = load_image(original_image_path)
        current_image = load_image(current_image_path)

        # Preprocess images
        processed_original_image = preprocess_image(original_image)
        processed_current_image = preprocess_image(current_image)

        # Align images if necessary
        aligned_original, aligned_current = align_images(processed_original_image, processed_current_image)

        # Compute similarity
        (similarity, diff) = compute_similarity(aligned_original, aligned_current)
        diff = (diff * 255).astype("uint8")

        # Threshold the difference image
        thresh = cv2.threshold(diff, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)[1]

        # Calculate tampering percentage
        tampering_percentage = calculate_tampering_percentage(similarity)
        print(f"Tampering Percentage: {tampering_percentage:.2f}%")

        # Visualize differences
        visualize_differences(original_image, current_image, diff, thresh)
    except FileNotFoundError as e:
        print(e)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# Call the function with image paths
original_image_path = r'C:\\Users\\Prasad\\Desktop\\Chinmay_Cognizant\\WhatsApp Image 2024-08-06 at 05.48.12.jpeg'
current_image_path = r'C:\\Users\\Prasad\\Desktop\\Chinmay_Cognizant\\WhatsApp Image 2024-08-06 at 03.36.03.jpeg'

check_tampering(original_image_path, current_image_path)