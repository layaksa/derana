# Helper script to generate glottologLanguages.ts
import json
import math

# Formula to generate a smooth polygonal boundary around a center point (lat, lon)
def generate_boundary_polygon(lat, lon, base_radius_km=35.0, vertices=12, seed=0):
    coords = []
    # Earth radius in km
    R = 6371.0
    for i in range(vertices):
        angle = (2 * math.pi * i) / vertices
        # slight pseudo-random variation per angle for organic boundary shape
        var = 0.85 + 0.3 * math.sin(angle * 2 + seed) * math.cos(angle * 3 + seed * 0.5)
        r = base_radius_km * var
        
        # dlat, dlon
        dlat = (r * math.cos(angle)) / R * (180.0 / math.pi)
        dlon = (r * math.sin(angle)) / (R * math.cos(math.radians(lat))) * (180.0 / math.pi)
        
        coords.append([round(lat + dlat, 5), round(lon + dlon, 5)])
    # Close polygon
    coords.append(coords[0])
    return coords

print("Polygon helper ready")
