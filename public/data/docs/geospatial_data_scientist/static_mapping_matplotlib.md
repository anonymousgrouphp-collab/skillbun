# Static Mapping with Matplotlib & Seaborn

This study guide explores how to leverage Python's powerful visualization libraries, Matplotlib and Seaborn, in conjunction with GeoPandas, to create high-quality static maps. Static maps are essential for conveying spatial information in reports, presentations, and publications, offering a clear and precise representation of geographic data.

## 1. Introduction to Static Mapping in Python

Static mapping involves generating fixed image files (like PNG, JPEG, PDF) that represent spatial data. Unlike interactive maps, static maps are non-dynamic but provide high control over design, annotation, and export quality, making them ideal for analytical reporting. Python's ecosystem, particularly with libraries like Matplotlib, Seaborn, and GeoPandas, offers a robust toolkit for this purpose.

## 2. Matplotlib for Geospatial Basemaps and Customization

Matplotlib is the foundational plotting library in Python, serving as the backend for many other visualization tools, including GeoPandas' plotting capabilities.

### Core Concepts:
-   **Figures and Axes:** A `Figure` is the overall window or page, and `Axes` are the individual plotting areas within that figure. Geospatial plots typically involve a single `Axes` object representing the map.
-   **Plotting Geospatial Data:** GeoPandas `GeoDataFrame.plot()` method directly uses Matplotlib to render geometries.
-   **Customization:** Matplotlib allows extensive customization of colors, line styles, markers, titles, labels, legends, and annotations.

### Key Matplotlib Functions for Mapping:
-   `plt.figure()`: Creates a new figure.
-   `fig.add_subplot()` or `plt.subplots()`: Creates axes within the figure.
-   `ax.set_title()`, `ax.set_xlabel()`, `ax.set_ylabel()`: Set titles and labels.
-   `ax.set_xlim()`, `ax.set_ylim()`: Set map boundaries.
-   `ax.legend()`: Add a legend.
-   `plt.savefig()`: Save the figure to a file.

## 3. GeoPandas: The Bridge to Spatial Data

GeoPandas extends Pandas DataFrames to handle spatial data, making it easy to read, manipulate, and plot geometries. It seamlessly integrates with Matplotlib for visualization.

### Plotting with GeoPandas:
The primary method for plotting a `GeoDataFrame` is `gdf.plot()`. This method returns a Matplotlib `Axes` object, allowing further customization.

```python
import geopandas
import matplotlib.pyplot as plt

# Load a sample GeoDataFrame (e.g., built-in 'naturalearth_lowres')
world = geopandas.read_file(geopandas.datasets.get_path('naturalearth_lowres'))

# Create a figure and axes
fig, ax = plt.subplots(1, 1, figsize=(10, 6))

# Plot the GeoDataFrame
world.plot(ax=ax, color='lightgray', edgecolor='black')

# Add a title
ax.set_title('World Map (GeoPandas + Matplotlib)')
ax.set_axis_off() # Turn off axes for a cleaner map

plt.show()
```

### Choropleth Maps:
GeoPandas simplifies creating choropleth maps, where areas are colored based on a quantitative or categorical variable.

```python
# Plotting a choropleth map
fig, ax = plt.subplots(1, 1, figsize=(12, 8))

# Plotting by 'gdp_md_est' column, using a colormap 'YlGnBu'
world.plot(column='gdp_md_est',
           cmap='YlGnBu',
           linewidth=0.8,
           ax=ax,
           edgecolor='0.8',
           legend=True,
           legend_kwds={'label': "GDP (Millions USD)", 'orientation': "horizontal"})

ax.set_title('Global GDP (Millions USD)')
ax.set_axis_off()
plt.show()
```

## 4. Enhancing Maps with Seaborn

While Matplotlib provides the core plotting functionality, Seaborn can be used to enhance the aesthetic appeal of your plots. Seaborn is built on top of Matplotlib and offers a high-level interface for drawing attractive statistical graphics.

### Seaborn for Styling:
Seaborn's styling capabilities can be applied globally to your Matplotlib plots, affecting fonts, colors, and overall look.

```python
import seaborn as sns
import geopandas
import matplotlib.pyplot as plt

# Set a Seaborn style
sns.set_theme(style="whitegrid", palette="pastel")

world = geopandas.read_file(geopandas.datasets.get_path('naturalearth_lowres'))

fig, ax = plt.subplots(1, 1, figsize=(12, 8))

# Plotting a choropleth map, now with Seaborn's theme applied
world.plot(column='pop_est',
           cmap='viridis',
           linewidth=0.8,
           ax=ax,
           edgecolor='0.8',
           legend=True,
           legend_kwds={'label': "Population Estimate", 'orientation': "horizontal"})

ax.set_title('Global Population Estimate (Seaborn Styled)')
ax.set_axis_off()
plt.show()

# Reset Seaborn style if needed for other plots
sns.reset_defaults()
```

### Overlaying Data (Points on Polygons):
You can plot multiple GeoDataFrames on the same `Axes` object to create layered maps.

```python
# Let's create some dummy city points
from shapely.geometry import Point
cities_data = {
    'city': ['London', 'Paris', 'New York'],
    'latitude': [51.5, 48.8, 40.7],
    'longitude': [-0.1, 2.3, -74.0]
}
cities_gdf = geopandas.GeoDataFrame(
    cities_data,
    geometry=geopandas.points_from_xy(cities_data['longitude'], cities_data['latitude']),
    crs="EPSG:4326"
)

fig, ax = plt.subplots(1, 1, figsize=(12, 8))

world.plot(ax=ax, color='lightgray', edgecolor='black')
cities_gdf.plot(ax=ax, marker='o', color='red', markersize=50, label='Cities')

ax.set_title('World Map with Cities')
ax.set_axis_off()
ax.legend()
plt.show()
```

## 5. Saving Your Maps

After creating your map, you can save it to various file formats with `plt.savefig()`.

```python
# Example of saving the map
fig, ax = plt.subplots(1, 1, figsize=(10, 6))
world.plot(ax=ax, color='lightgray', edgecolor='black')
ax.set_title('World Map to be Saved')
ax.set_axis_off()
plt.savefig('world_map.png', dpi=300, bbox_inches='tight') # High resolution PNG
plt.savefig('world_map.pdf', bbox_inches='tight') # Vector graphics PDF
plt.close(fig) # Close the figure to free memory if not displaying
print("Map saved to world_map.png and world_map.pdf")
```

## Checklist/Exercise:

1.  **Basic Choropleth:** Load the `naturalearth_cities` dataset from GeoPandas. Create a choropleth map where cities are colored based on their `pop_max` attribute. Use an appropriate colormap and add a legend.
2.  **Layered Map:** Using the `naturalearth_lowres` (countries) and `naturalearth_cities` datasets, plot the countries as a base layer and overlay the cities as points on top. Customize point size and color.
3.  **Styled Map:** Recreate one of the maps above, but apply a Seaborn style (e.g., `sns.set_style("darkgrid")`) before plotting to observe the aesthetic changes. Remember to `sns.reset_defaults()` afterwards.