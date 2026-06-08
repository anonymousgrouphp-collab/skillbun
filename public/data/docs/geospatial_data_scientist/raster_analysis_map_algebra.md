# Raster Analysis & Map Algebra

Raster data, composed of a grid of cells (pixels), is fundamental in geospatial analysis, representing continuous phenomena like elevation, temperature, or satellite imagery. Raster analysis involves processing and interpreting these grids to derive meaningful information. Map Algebra provides a powerful framework for performing these operations by treating rasters as mathematical operands.

## Core Concepts in Raster Analysis

### 1. Zonal Statistics

Zonal statistics summarize raster cell values within the defined boundaries of another layer (the "zone" layer), which can be a vector polygon or another raster. This allows for aggregating information over specific areas of interest.

*   **Concept:** Calculate statistics (e.g., mean, median, sum, minimum, maximum, standard deviation) of a raster's values for each distinct zone in an overlying zone layer.
*   **Applications:**
    *   Calculating the average elevation within different watershed boundaries.
    *   Determining the total rainfall over various agricultural fields.
    *   Summarizing land cover types within administrative regions.

### 2. Vegetation Indices (e.g., NDVI)

Vegetation indices are specialized raster analysis techniques used to quantify vegetation health, density, and growth patterns using spectral information captured by satellite or aerial sensors. The Normalized Difference Vegetation Index (NDVI) is one of the most widely used.

*   **NDVI Formula:** `NDVI = (NIR - Red) / (NIR + Red)`
    *   **NIR (Near-Infrared):** Wavelengths strongly reflected by healthy vegetation.
    *   **Red:** Wavelengths strongly absorbed by healthy vegetation.
*   **Interpretation:** NDVI values range from -1 to +1.
    *   Values close to +1 indicate dense, healthy vegetation.
    *   Values near 0 indicate sparse vegetation or bare soil.
    *   Negative values often correspond to water bodies or clouds.
*   **Applications:** Agricultural monitoring, drought assessment, forest management, environmental change detection.

### 3. Terrain Analysis

Terrain analysis involves extracting various surface characteristics and geomorphological features from Digital Elevation Models (DEMs). DEMs are raster representations of elevation.

*   **Key Operations:**
    *   **Slope:** Measures the steepness or gradient of the terrain. Expressed in degrees or percentage.
    *   **Aspect:** Identifies the downslope direction of the maximum rate of change in elevation. Expressed in degrees (0-360), indicating compass direction.
    *   **Hillshade:** Simulates the illumination of a surface from a specific light source angle and altitude, enhancing visualization of terrain features.
    *   **Viewshed:** Determines which areas on a surface are visible from one or more observation points.

### 4. Map Algebra Operations

Map Algebra is a comprehensive framework for performing cell-by-cell operations on one or more raster datasets. It treats rasters as variables in mathematical expressions.

*   **Local Operations:** Operate on a single cell from one or more input rasters to produce an output value for that same cell location.
    *   **Examples:** Addition, subtraction, multiplication, division, reclassification, boolean operations (e.g., `(raster1 > 10) AND (raster2 < 5)`).
    *   **Use Cases:** Calculating differences between two rasters (e.g., change detection), creating binary masks.

*   **Focal (Neighborhood) Operations:** Calculate an output value for a cell based on the values of cells within a specified neighborhood (e.g., 3x3 window) around the input cell.
    *   **Examples:** Focal mean (smoothing), focal maximum (edge detection), convolution filters.
    *   **Use Cases:** Noise reduction, feature extraction, calculating local variance.

*   **Global Operations:** Calculate an output value for each cell based on the values of all cells in the input raster.
    *   **Examples:** Euclidean distance, cost distance.
    *   **Use Cases:** Finding distances from features, modeling movement paths.

## Code Example: Calculating NDVI with Python

This example demonstrates how to calculate NDVI using `rasterio` for reading/writing rasters and `numpy` for array computations.

```python
import rasterio
import numpy as np

# Define paths to your Red and NIR band images
red_band_path = "path/to/your/red_band.tif"
nir_band_path = "path/to/your/nir_band.tif"
output_ndvi_path = "path/to/your/output_ndvi.tif"

try:
    # Open the Red and NIR band rasters
    with rasterio.open(red_band_path) as red_src, \
         rasterio.open(nir_band_path) as nir_src:

        # Ensure both rasters have the same dimensions and projection
        if red_src.shape != nir_src.shape or red_src.crs != nir_src.crs:
            raise ValueError("Red and NIR bands must have same dimensions and CRS.")

        # Read the raster data as NumPy arrays
        red_band = red_src.read(1).astype(float)
        nir_band = nir_src.read(1).astype(float)

        # Handle potential zero in denominator for NDVI calculation
        # Replace 0s with a small epsilon to avoid division by zero errors
        denominator = nir_band + red_band
        denominator[denominator == 0] = np.finfo(float).eps # Smallest positive float

        # Calculate NDVI
        ndvi = (nir_band - red_band) / denominator

        # Prepare metadata for the output NDVI raster
        out_meta = red_src.meta.copy()
        out_meta.update({
            "driver": "GTiff",
            "dtype": "float32",
            "count": 1,
            "nodata": None # NDVI typically doesn't have NoData from input bands if calculated properly
        })

        # Write the NDVI array to a new GeoTIFF file
        with rasterio.open(output_ndvi_path, "w", **out_meta) as dest:
            dest.write(ndvi.astype(rasterio.float32), 1)

    print(f"NDVI calculated and saved to {output_ndvi_path}")

except Exception as e:
    print(f"An error occurred: {e}")
```

## Quick Check for Understanding

1.  **Distinguish:** Explain the primary difference between a "local" and a "focal" map algebra operation. Provide an example for each.
2.  **Calculate:** Given an NIR band value of 0.6 and a Red band value of 0.1 for a pixel, what is the NDVI value for that pixel, and what does it likely represent?
3.  **Apply:** You have a DEM and a shapefile of forest fire perimeters. Describe how you would use zonal statistics to find the average slope within each burned area.
