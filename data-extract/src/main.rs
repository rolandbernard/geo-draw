// This is used to extract geojson files in ../data/ and write the data in required format to ../static/data/

use std::fs;
use std::str;
use std::string::String;
use std::char;
use uuid::Uuid;
use std::collections::HashMap;

fn not_alphabetic(c: char) -> bool {
    return !c.is_alphabetic();
}

fn extract_ids(locations: &mut HashMap<String, String>, geojson: &json::JsonValue) {
    if geojson["type"] == "FeatureCollection" {
        for features in geojson["features"].members() {
            if features["properties"]["id"].is_null() {
                // Data exported from geoboundaries.org
                let id = features["properties"]["shapeID"].as_str().unwrap_or("");
                let name = features["properties"]["shapeName"].as_str().unwrap_or("");
                locations.insert(id.to_string(), name.to_string());
            } else {
                // Data exported from OpenStreetMap
                let id = features["properties"]["id"].as_i32().unwrap();
                let name = features["properties"]["name"].as_str().unwrap_or("");
                locations.insert(id.to_string(), name.to_string());
            }
        }
    }
}

fn main() {
    let mut locations = HashMap::new();
    for entry in fs::read_dir("../data/").unwrap() {
        let entry = entry.unwrap();
        let path = entry.path();
        if path.is_file() {
            let raw_data = fs::read(path).unwrap();
            let string_data = str::from_utf8(&raw_data).unwrap();
            let json = json::parse(&string_data).unwrap();
            extract_ids(&mut locations, &json);
                // let mut searchable = false;
                // let name_props = ["name", "local_name", "name_en"];
                // for &prop in &name_props {
                //     let full_name = features["properties"][prop].as_str().unwrap_or("");
                //     for fargment in full_name.split(not_alphabetic) {
                //         let striped = fargment.to_lowercase();
                //         if !striped.is_empty() {
                //             if !name_fragments.contains_key(&striped) {
                //                 let key = striped.clone();
                //                 name_fragments.insert(key, Vec::new());
                //             }
                //             name_fragments.get_mut(&striped).unwrap().push(id.to_string());
                //             searchable = true;
                //         }
                //     }
                // }
            // let coordinates = &features["geometry"]["coordinates"];
            // if features["geometry"]["type"] == "Polygon" {
                
            // } else if features["geometry"]["type"] == "MultiPolygon" {
            // }
        }
    }
    println!("Locations:");
    for (id, name) in locations {
        println!("{:?}:{:?}", id, name);
    }
    // let mut name_fragments = HashMap::new();
    // println!("Fragments:");
    // for (name, ids) in name_fragments {
    //     println!("{:?}:{:?}", name, ids);
    // }
}
