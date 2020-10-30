// This is used to extract geojson files in ../data/ and write the data in required format to ../static/data/
// This program also performs simplification to the polygons.

use std::fs;
use std::fs::File;
use std::str;
use std::string::String;
use std::char;
use std::collections::HashMap;
use std::io::prelude::*;

fn not_alphabetic(c: char) -> bool {
    return !c.is_alphabetic();
}

fn extract_ids(locations: &mut HashMap<String, (String, String)>, geojson: &json::JsonValue) {
    if geojson["type"] == "FeatureCollection" {
        for features in geojson["features"].members() {
            if features["properties"]["id"].is_null() {
                // Data exported from geoboundaries.org
                let id = features["properties"]["shapeID"].as_str().unwrap_or("");
                let name = features["properties"]["shapeName"].as_str().unwrap_or("");
                locations.insert(id.to_string(), (name.to_string(), name.to_string()));
            } else {
                // Data exported from OpenStreetMap
                let id = features["properties"]["id"].as_i32().unwrap();
                let mut frag_name = "".to_owned();
                let name_props = ["name", "local_name", "name_en"];
                for &prop in &name_props {
                    let full_name = features["properties"][prop].as_str().unwrap_or("");
                    if !full_name.is_empty() {
                        frag_name.push_str(full_name);
                        frag_name.push_str(" ");
                    }
                }
                let name = features["properties"]["name"].as_str().unwrap_or("");
                locations.insert(id.to_string(), (name.to_string(), frag_name));
            }
        }
    }
}

fn generate_fragments(fragments: &mut HashMap<String, HashMap<String, i32>>, id: String, name: &str) {
    for fargment in name.split(not_alphabetic) {
        let striped = fargment.to_lowercase();
        if !striped.is_empty() {
            if !fragments.contains_key(&striped) {
                let key = striped.clone();
                fragments.insert(key, HashMap::new());
            }
            fragments.get_mut(&striped).unwrap().insert(id.clone(), 1);
        }
    }
}

fn generate_name(locations: &HashMap<String, (String, String)>, parents: str::Split<&str>, frag: bool) -> String {
    let mut ret = "".to_owned();
    for parent in parents {
        if locations.contains_key(parent) {
            let parent_name = &locations[parent];
            if frag {
                ret.push_str(&parent_name.1);
                ret.push_str(" ");
            } else {
                ret.push_str(&parent_name.0);
                ret.push_str(", ");
            }
        }
    }
    return ret.trim_matches(|c| c == ' ' || c == ',').to_owned();
}

fn write_i32(file: &mut File, value: i32) {
    file.write_all(&[
        (value & 0xff) as u8,
        ((value >> 8) & 0xff) as u8,
        ((value >> 16) & 0xff) as u8,
        ((value >> 24) & 0xff) as u8,
    ]).unwrap();
}

const MAX_POINTS_PER_PATH: i32 = 1024;
const MAX_POLY_PARTS: i32 = 64;
const MAX_POLYGONS: i32 = 256;

fn cross_product(x: &(f64, f64), y: &(f64, f64)) -> f64 {
    return (x.0 * y.0) - (x.1 * y.0);
}

fn polygon_outer_size(poly: &json::JsonValue) -> i64 {
    let mut ret = 0.0;
    let mut last_coords = (0.0, 0.0);
    for coords in poly.members() {
        let coord = (coords[0].as_f64().unwrap_or(0.0), coords[1].as_f64().unwrap_or(0.0));
        if last_coords != (0.0, 0.0) {
            ret += cross_product(&coord, &last_coords);
        }
        last_coords = coord;
    }
    return (f64::abs(ret) * 1_000_000_000.0) as i64;
}

fn write_poly_part(file: &mut File, part: &json::JsonValue) {
    if part.len() as i32 <= MAX_POINTS_PER_PATH {
        write_i32(file, part.len() as i32); // number of coordinates
        for coords in part.members() {
            // write coordinates as fixed point values
            let lon = coords[0].as_f64().unwrap_or(0.0);
            let lon_fixed = (lon * 1e7) as i32;
            write_i32(file, lon_fixed);
            let lat = coords[1].as_f64().unwrap_or(0.0);
            let lat_fixed = (lat * 1e7) as i32;
            write_i32(file, lat_fixed);
        }
    } else {
        let mut left = MAX_POINTS_PER_PATH;
        let mut skip: f64 = 0.0;
        let filtered_coords: Vec<&json::JsonValue> = part.members().filter(
            |&_| {
                skip += MAX_POINTS_PER_PATH as f64 / (part.len() as i32) as f64;
                if skip >= 1.0 {
                    skip -= 1.0;
                    left -= 1;
                    return left >= 0;
                } else {
                    return false;
                }
            }
        ).collect();
        write_i32(file, filtered_coords.len() as i32); // number of coordinates
        for coords in filtered_coords {
            // write coordinates as fixed point values
            let lon = coords[0].as_f64().unwrap_or(0.0);
            let lon_fixed = (lon * 1e7) as i32;
            write_i32(file, lon_fixed);
            let lat = coords[1].as_f64().unwrap_or(0.0);
            let lat_fixed = (lat * 1e7) as i32;
            write_i32(file, lat_fixed);
        }
    }
}

fn write_polygon(file: &mut File, poly: &json::JsonValue) {
    if poly.len() as i32 <= MAX_POLY_PARTS {
        write_i32(file, poly.len() as i32); // number of paths
        for part in poly.members() {
            write_poly_part(file, part);
        }
    } else {
        write_i32(file, MAX_POLY_PARTS); // number of polygons
        write_poly_part(file, &poly[0]); // write the first part (i.e. the outline)
        // write the biggest holes
        let mut parts: Vec<&json::JsonValue> = poly.members().skip(1).collect();
        parts.sort_by_key(|&x| -polygon_outer_size(&x));
        for part in parts.iter().take((MAX_POLY_PARTS - 1) as usize) {
            write_poly_part(file, part);
        }
    }
}

fn write_to_file(id: &str, name: &str, geom: &json::JsonValue) {
    let coordinates = &geom["coordinates"];
    if geom["type"] == "Polygon" {
        let mut file = File::create(format!("../static/data/{}.bin", id)).unwrap();
        file.write_all(name.as_bytes()).unwrap();
        file.write_all(&[0]).unwrap();
        write_i32(&mut file, 1); // number of polygons
        write_polygon(&mut file, coordinates);
    } else if geom["type"] == "MultiPolygon" {
        let mut file = File::create(format!("../static/data/{}.bin", id)).unwrap();
        file.write_all(name.as_bytes()).unwrap();
        file.write_all(&[0]).unwrap();
        if coordinates.len() as i32 <= MAX_POLYGONS {
            write_i32(&mut file, coordinates.len() as i32); // number of polygons
            for poly in coordinates.members() {
                write_polygon(&mut file, poly);
            }
        } else {
            // write the polygons with the biggest outline
            let mut polys: Vec<&json::JsonValue> = coordinates.members().collect();
            polys.sort_by_key(|&x| -polygon_outer_size(&x[0]));
            write_i32(&mut file, MAX_POLYGONS); // number of polygons
            for poly in polys.iter().take(MAX_POLYGONS as usize) {
                write_polygon(&mut file, poly);
            }
        }
    }
}

fn generate_data(
    names: &mut HashMap<String, String>, 
    fragments: &mut HashMap<String, HashMap<String, i32>>,
    locations: &HashMap<String, (String, String)>, 
    geojson: &json::JsonValue
) {
    if geojson["type"] == "FeatureCollection" {
        for features in geojson["features"].members() {
            let id;
            let name;
            if !features["properties"]["shapeID"].is_null() {
                // Data exported from geoboundaries.org
                id = features["properties"]["shapeID"].as_str().unwrap_or("").to_string();
                let parents = features["properties"]["ADMHIERACHY"].as_str().unwrap_or(&id).split(",");
                name = generate_name(locations, parents.clone(), false);
                let frag_name = generate_name(locations, parents, true);
                generate_fragments(fragments, id.to_string(), &frag_name);
                names.insert(id.to_string(), name.clone());
                write_to_file(&id, &name, &features["geomerty"]);
            } else if !features["properties"]["id"].is_null() {
                id = features["properties"]["id"].as_i32().unwrap().to_string();
                // Data exported from OpenStreetMap
                let parents = format!("{},{}", id, features["properties"]["parents"].as_str().unwrap_or(""));
                let split_parents = parents.split(",");
                name = generate_name(locations, split_parents.clone(), false);
                let frag_name = generate_name(locations, split_parents, true);
                generate_fragments(fragments, id.to_string(), &frag_name);
                names.insert(id.to_string(), name.clone());
                write_to_file(&id, &name, &features["geometry"]);
            }
        }
    }
}

fn main() {
    fs::remove_dir_all("../static/data").unwrap_or(());
    fs::create_dir("../static/data").unwrap();
    let mut data = Vec::new();
    let mut locations = HashMap::new();
    for entry in fs::read_dir("../data/").unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() {
            let raw_data = fs::read(path).unwrap();
            let string_data = str::from_utf8(&raw_data).unwrap();
            let json = json::parse(&string_data).unwrap();
            data.push(json);
        }
    }
    for json in &data {
        extract_ids(&mut locations, &json);
    }
    let mut names = HashMap::new();
    let mut fragments = HashMap::new();
    for json in data {
        generate_data(&mut names, &mut fragments, &locations, &json);
    }
    fs::write("../static/data/index_names.json", format!("{}", json::stringify(names))).unwrap();
    fs::write("../static/data/index_fragments.json", format!("{}", json::stringify(fragments))).unwrap();
}
