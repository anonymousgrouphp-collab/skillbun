# Raster Manipulation & Reprojection

Raster data, such as satellite imagery, digital elevation models (DEMs), or climate grids, represents geographical phenomena as a grid of pixels. Effective manipulation and reprojection of these datasets are fundamental skills for any Geospatial Data Scientist, enabling data preparation, integration, and analysis. This guide focuses on core raster operations using Python, primarily with the `rasterio` library.

## 1. Core Concepts

### a. Clipping (Masking)

**Concept:** Clipping, also known as masking, involves extracting a specific subset of a raster dataset based on a defined vector boundary (e.g., a polygon representing an administrative area or a watershed). This operation is crucial for focusing analyses on a particular Area of Interest (AOI), reducing data volume, and improving processing efficiency.

**Why it's important:**
*   Isolate regions of interest.
*   Reduce computational load by working with smaller datasets.
*   Prepare data for subsequent, localized analyses.

**Example using `rasterio` and `geopandas`:**
```python
import rasterio
from rasterio.mask import mask
import geopandas
from shapely.geometry import mapping
import numpy as np

# --- Configuration --- #
input_raster_path = "path/to/your/input_raster.tif"
boundary_vector_path = "path/to/your/boundary.shp" # e.g., a shapefile
output_clipped_path = "path/to/your/clipped_raster.tif"

try:
    with rasterio.open(input_raster_path) as src:
        # Read the vector boundary
        gdf = geopandas.read_file(boundary_vector_path)
        # Ensure the CRS of the boundary matches the raster's CRS if necessary
        if gdf.crs != src.crs:
            gdf = gdf.to_crs(src.crs)

        # Extract geometries from the GeoDataFrame
        geoms = [mapping(geom) for geom in gdf.geometry]

        # Clip the raster
        out_image, out_transform = mask(src, geoms, crop=True, nodata=src.nodata)

        # Update metadata for the output raster
        out_meta = src.meta.copy()
        out_meta.update({
            "driver": "GTiff",
            "height": out_image.shape[1],
            "width": out_image.shape[2],
            "transform": out_transform,
            "nodata": src.nodata # Ensure nodata value is preserved
        })

        # Write the clipped raster to a new file
        with rasterio.open(output_clipped_path, "w", **out_meta) as dest:
            dest.write(out_image)
    print(f"Raster successfully clipped to {output_clipped_path}")
except Exception as e:
    print(f"Error during clipping: {e}")
```

### b. Mosaicking

**Concept:** Mosaicking is the process of combining multiple overlapping or adjacent raster datasets into a single, seamless raster. This is commonly performed when working with tiled imagery (e.g., satellite scenes) or when merging datasets from different acquisition times or sensors that cover the same area.

**Why it's important:**
*   Create a continuous surface from fragmented data.
*   Simplify data management by reducing the number of files.
*   Enable regional analysis without tile boundaries.

**Example using `rasterio.merge`:**
```python
from rasterio.merge import merge
import rasterio
import numpy as np

# --- Configuration --- #
input_raster_paths = [
    "path/to/your/tile1.tif",
    "path/to/your/tile2.tif",
    "path/to/your/tile3.tif" # Add more as needed
]
output_mosaic_path = "path/to/your/mosaic_raster.tif"

try:
    # Open all datasets for merging
    src_files_to_mosaic = []
    for fp in input_raster_paths:
        src_files_to_mosaic.append(rasterio.open(fp))

    if not src_files_to_mosaic:
        raise ValueError("No input raster files provided for mosaicking.")

    # Merge function - it automatically handles overlaps
    mosaic, out_transform = merge(src_files_to_mosaic)

    # Update metadata for the new mosaic
    out_meta = src_files_to_mosaic[0].meta.copy()
    out_meta.update({
        "driver": "GTiff",
        "height": mosaic.shape[1],
        "width": mosaic.shape[2],
        "transform": out_transform,
        "crs": src_files_to_mosaic[0].crs,
        "nodata": out_meta.get('nodata', None) # Preserve nodata if exists
    })

    # Write the mosaic raster to a new file
    with rasterio.open(output_mosaic_path, "w", **out_meta) as dest:
        dest.write(mosaic)
    print(f"Rasters successfully mosaicked to {output_mosaic_path}")

finally:
    # Close all opened datasets
    for s in src_files_to_mosaic:
        s.close()
```

### c. Resampling

**Concept:** Resampling involves changing the spatial resolution (pixel size) of a raster dataset. This operation is necessary when you need to match the resolution of multiple datasets for analysis, reduce data volume (downsampling), or enhance detail (upsampling).

**Why it's important:**
*   Standardize resolutions for integrated analysis.
*   Optimize data size for storage or processing performance.
*   Improve visual representation or analytical accuracy.

**Common Resampling Methods:**
*   **Nearest Neighbor (`Resampling.nearest`):** Assigns the value of the nearest input pixel to the output pixel. Fastest, preserves original pixel values, ideal for categorical data (e.g., land cover). Not suitable for continuous data as it can introduce blockiness.
*   **Bilinear Interpolation (`Resampling.bilinear`):** Calculates an output pixel value based on a weighted average of the four nearest input pixel values. Produces a smoother output, suitable for continuous data (e.g., elevation, temperature). Modifies original pixel values.
*   **Cubic Convolution (`Resampling.cubic`):** Calculates an output pixel value based on a weighted average of the 16 nearest input pixel values. Produces the smoothest output but is computationally more intensive. Best for continuous data but can create values outside the original range.

**Example using `rasterio`:**
```python
import rasterio
from rasterio.enums import Resampling
import numpy as np

# --- Configuration --- #
input_raster_path = "path/to/your/input_raster.tif"
output_resampled_path = "path/to/your/resampled_raster.tif"
scale_factor = 2 # e.g., 2 for doubling pixel size (half resolution), 0.5 for halving (double resolution)

try:
    with rasterio.open(input_raster_path) as src:
        # Calculate new dimensions
        new_height = int(src.height / scale_factor)
        new_width = int(src.width / scale_factor)

        if new_height == 0 or new_width == 0:
            raise ValueError("Calculated new dimensions are zero. Adjust scale_factor.")

        # Resample the data
        # Note: 'read' can perform resampling directly
        resampled_data = src.read(
            out_shape=(src.count, new_height, new_width),
            resampling=Resampling.bilinear # Choose your preferred method
        )

        # Calculate new transform for the resampled data
        out_transform = src.transform * src.transform.scale(
            (src.width / new_width),
            (src.height / new_height)
        )

        # Update metadata
        out_meta = src.meta.copy()
        out_meta.update({
            "height": new_height,
            "width": new_width,
            "transform": out_transform,
            "nodata": src.nodata # Ensure nodata value is preserved
        })

        # Write the resampled raster to a new file
        with rasterio.open(output_resampled_path, "w", **out_meta) as dest:
            dest.write(resampled_data)
    print(f"Raster successfully resampled to {output_resampled_path}")
except Exception as e:
    print(f"Error during resampling: {e}")
```

### d. Reprojection

**Concept:** Reprojection is the process of transforming a raster dataset from one Coordinate Reference System (CRS) to another. This is a critical step when integrating geospatial data from different sources that may use varying CRS definitions, ensuring that all data aligns spatially and accurately.

**Why it's important:**
*   Achieve spatial alignment and consistency across diverse datasets.
*   Ensure accurate measurements and analyses.
*   Comply with project or organizational CRS standards.

**Example using `rasterio.warp`:**
```python
import rasterio
from rasterio.warp import calculate_default_transform, reproject, Resampling
import numpy as np

# --- Configuration --- #
input_raster_path = "path/to/your/input_raster.tif"
output_reprojected_path = "path/to/your/reprojected_raster.tif"
dst_crs = 'EPSG:4326' # Example: WGS 84 Geographic CRS
# Other common CRSs: 'EPSG:3857' (Web Mercator), 'EPSG:26915' (NAD83 / UTM zone 15N)

try:
    with rasterio.open(input_raster_path) as src:
        # Check if reprojecting is actually needed
        if src.crs == dst_crs:
            print(f"Raster is already in target CRS {dst_crs}. Skipping reprojection.")
            return # Or copy the file if desired

        # Calculate transformation parameters for the new CRS
        transform, width, height = calculate_default_transform(
            src.crs, dst_crs, src.width, src.height, *src.bounds
        )

        out_meta = src.meta.copy()
        out_meta.update({
            "crs": dst_crs,
            "transform": transform,
            "width": width,
            "height": height,
            "nodata": src.nodata # Preserve nodata value
        })

        # Reproject and write to new file
        with rasterio.open(output_reprojected_path, "w", **out_meta) as dest:
            for i in range(1, src.count + 1):
                reproject(
                    source=rasterio.band(src, i),
                    destination=rasterio.band(dest, i),
                    src_transform=src.transform,
                    src_crs=src.crs,
                    dst_transform=transform,
                    dst_crs=dst_crs,
                    resampling=Resampling.nearest, # Choose resampling method (e.g., bilinear for continuous data)
                    num_threads=2 # Optional: for performance
                )
    print(f"Raster successfully reprojected to {output_reprojected_path}")
except Exception as e:
    print(f"Error during reprojection: {e}")
```

## 2. Quick Checklist/Exercise

1.  **Scenario:** You have a large global elevation model (`elevation.tif`) and need to analyze the topography specifically within the boundaries of a given country, provided as a GeoJSON file (`country_boundary.geojson`). Which raster manipulation operation would you use, and why is it beneficial in this context?
2.  **Resolution Mismatch:** You have two raster datasets: a land use map at 10m resolution and a population density map at 100m resolution. To perform a combined analysis where both datasets have a consistent 50m resolution, what operation(s) would you apply to each, and which resampling method would be most appropriate for the land use map?
3.  **CRS Importance:** Explain why accurately reprojecting raster data is a critical first step when integrating datasets from different sources (e.g., a satellite image from NASA and a local government's soil map). What spatial analysis issues could arise if reprojection is skipped or done incorrectly?
