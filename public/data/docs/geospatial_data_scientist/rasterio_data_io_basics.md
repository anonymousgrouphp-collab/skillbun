# Rasterio: Data I/O & Metadata

Rasterio is a fundamental Python library for Geospatial Data Scientists, providing an efficient and Pythonic interface for reading and writing raster datasets. Built on top of GDAL, it supports a wide array of formats like GeoTIFF, NetCDF, HDF5, and many others, making it indispensable for tasks involving imagery, elevation models, and other gridded data. This guide will cover the essentials of data input/output (I/O) and metadata management with Rasterio.

## 1. Understanding Rasterio Dataset Objects

When you open a raster file using `rasterio.open()`, it returns a `DatasetReader` object. This object acts as a context manager, ensuring that resources are properly closed after use, and provides access to the raster's properties, individual bands, and associated metadata.

```python
import rasterio
import numpy as np
from rasterio.transform import from_origin

# --- Creating a dummy GeoTIFF for demonstration if you don't have one ---
dummy_raster_path = "./dummy_raster.tif"

# Define parameters for the dummy raster
dummy_height, dummy_width = 100, 100
dummy_crs = 'EPSG:4326'
dummy_transform = from_origin(-100, 40, 0.1, 0.1) # Top-left x, y; pixel width, height

with rasterio.open(
    dummy_raster_path, 'w', driver='GTiff',
    height=dummy_height, width=dummy_width, count=1,
    dtype=rasterio.uint8, crs=dummy_crs, transform=dummy_transform
) as dst:
    dummy_data = np.random.randint(0, 255, size=(dummy_height, dummy_width), dtype=rasterio.uint8)
    dst.write(dummy_data, 1)

print(f"Dummy raster created at {dummy_raster_path}\n")
# ------------------------------------------------------------------------
```

## 2. Reading Raster Data

The primary method for reading raster data is `rasterio.open()`. Always use it within a `with` statement for robust file handling.

### Opening a Raster File and Accessing Basic Properties

```python
import rasterio

raster_path = "./dummy_raster.tif" # Use the dummy raster or your own GeoTIFF

with rasterio.open(raster_path) as src:
    print(f"Driver: {src.driver}") # e.g., 'GTiff'
    print(f"Width: {src.width}, Height: {src.height}")
    print(f"Number of bands: {src.count}")
    print(f"Coordinate Reference System (CRS): {src.crs}")
    print(f"Georeferencing Transform: {src.transform}")
    print(f"Bounding Box: {src.bounds}") # Bounding box (left, bottom, right, top)
    print(f"Data types of bands: {src.dtypes}") # A tuple of data types for each band
    print(f"NoData value: {src.nodata}")
```

### Reading Specific Bands

Rasterio loads band data into NumPy arrays. Band indexing starts from 1.

```python
import rasterio
import numpy as np

raster_path = "./dummy_raster.tif" # Assume this is a single-band raster for simplicity

with rasterio.open(raster_path) as src:
    # Read the first band (returns a 2D NumPy array)
    band1_data = src.read(1)
    print(f"\nShape of band 1: {band1_data.shape}")
    print(f"Data type of band 1 array: {band1_data.dtype}")
    print(f"First 5x5 pixels of band 1:\n{band1_data[:5, :5]}")

    # If it's a multi-band raster (e.g., RGB imagery, src.count >= 3):
    # You can read specific bands into a 3D array (bands, height, width)
    # For example, to read bands 1, 2, and 3:
    # if src.count >= 3:
    #     bands_rgb = src.read([1, 2, 3])
    #     print(f"Shape of bands 1,2,3: {bands_rgb.shape}")

    # Read all bands (returns a 3D array: (count, height, width))
    # all_bands_data = src.read()
    # print(f"Shape of all bands: {all_bands_data.shape}")

    # Access pixel value at a specific row, column (e.g., row 10, col 20 of band 1)
    row, col = 10, 20
    pixel_value = src.read(1)[row, col]
    print(f"Pixel value at ({row}, {col}) in band 1: {pixel_value}")
```

## 3. Accessing Metadata

Rasterio provides detailed metadata through the `profile` and `meta` attributes, and general tags via `tags()`.

### Dataset Profile and Metadata Dictionaries

-   `src.profile`: A dictionary containing a comprehensive set of dataset creation options and core metadata (driver, height, width, count, dtype, crs, transform, nodata, etc.). This is often used to define parameters for writing new rasters.
-   `src.meta`: A more concise dictionary containing essential metadata, often a subset of `profile`.

```python
import rasterio

raster_path = "./dummy_raster.tif"

with rasterio.open(raster_path) as src:
    print("\n--- src.profile (Detailed Metadata) ---")
    for key, value in src.profile.items():
        print(f"  {key}: {value}")

    print("\n--- src.meta (Concise Metadata) ---")
    for key, value in src.meta.items():
        print(f"  {key}: {value}")

    # Accessing format-specific tags (e.g., from a GeoTIFF header)
    # These tags can vary widely depending on the raster source.
    try:
        all_tags = src.tags()
        if all_tags:
            print("\n--- General Tags ---")
            for key, value in all_tags.items():
                print(f"  {key}: {value}")
        else:
            print("\nNo specific tags found for this raster.")
    except Exception as e:
        print(f"\nCould not read tags: {e}")
```

## 4. Writing Raster Data

To write data to a new raster file, you use `rasterio.open()` in write mode (`'w'`). You must provide a `profile` dictionary that defines the output raster's characteristics.

### Creating a New Raster File from a NumPy Array

```python
import rasterio
import numpy as np
from rasterio.transform import from_origin

output_raster_path = "./output_new_raster.tif"

# 1. Prepare your data (e.g., a simple 2D NumPy array)
new_height, new_width = 75, 120
new_data = np.random.randint(0, 200, size=(new_height, new_width), dtype=rasterio.uint16)

# 2. Define the output raster's profile (metadata)
output_profile = {
    'driver': 'GTiff',
    'height': new_height,
    'width': new_width,
    'count': 1,               # Number of bands
    'dtype': new_data.dtype,  # Data type of the array
    'crs': 'EPSG:32617',      # Coordinate Reference System (e.g., UTM zone 17N)
    'transform': from_origin(300000, 4000000, 10, 10), # Top-left x, y; pixel width, height
    'nodata': 0               # Optional: value representing no data
}

# 3. Write the raster data to the new file
with rasterio.open(output_raster_path, 'w', **output_profile) as dst:
    dst.write(new_data, 1) # Write the data to band 1

print(f"\nNew raster successfully written to {output_raster_path}")

# Verify by reading back
with rasterio.open(output_raster_path) as src_written:
    print(f"Written raster properties: {src_written.profile}")
    read_data_back = src_written.read(1)
    print(f"Read data shape: {read_data_back.shape}")
    assert np.array_equal(new_data, read_data_back) # Check if data matches
    print("Data verification successful!")
```

### Modifying and Writing (Read, Process, Write Workflow)

A common pattern is to read an existing raster, apply some processing (e.g., scaling, filtering), and then write the result to a new file, often inheriting most of the metadata from the original source.

```python
import rasterio
import numpy as np

input_source_path = "./dummy_raster.tif" # Original raster
output_modified_path = "./modified_raster.tif" # Output modified raster

with rasterio.open(input_source_path) as src:
    # Read the data (e.g., first band)
    original_data = src.read(1)

    # Perform a simple modification (e.g., normalize values to 0-1, then scale to 0-255)
    # Ensure output dtype matches the original or is appropriate for the new data range.
    modified_data = (original_data / np.max(original_data)) * 255
    modified_data = modified_data.astype(src.dtype) # Convert back to original dtype

    # Get the profile of the source raster and update it for the output
    out_profile = src.profile
    out_profile.update(
        dtype=modified_data.dtype, # Update dtype if processing changed it
        count=1, # Ensure count is correct if only one band is output
        # You can add or modify other profile items here if needed, e.g., 'compress': 'LZW'
    )

    # Write the modified data to a new file
    with rasterio.open(output_modified_path, 'w', **out_profile) as dst:
        dst.write(modified_data, 1) # Write to the first band

print(f"\nModified raster written to {output_modified_path}")
```

---

## Exercise Checklist:

1.  **Read and Inspect**: Open the `dummy_raster.tif` you created (or any GeoTIFF). Print its `CRS`, `transform` matrix, and the `nodata` value. If `nodata` is `None`, print "No Nodata value defined."
2.  **Band Statistics**: Read the first band of `dummy_raster.tif`. Calculate and print its minimum, maximum, and mean pixel values using NumPy. Explain why a `np.nanmax` might be preferred over `np.max` for rasters with `nodata`.
3.  **Create and Verify**: Create a new single-band GeoTIFF with dimensions 75x75, `CRS='EPSG:3857'`, and populate it with random float data (`dtype=rasterio.float32`) between 0.0 and 1.0. Set its `nodata` value to `-9999.0`. Write it to disk and then open it again to verify its `CRS`, `width`, and `nodata` value.
