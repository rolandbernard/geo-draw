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

fn generate_fragments(fragments: &mut HashMap<String, Vec<String>>, id: String, name: &str) {
    for fargment in name.split(not_alphabetic) {
        let striped = fargment.to_lowercase();
        if !striped.is_empty() {
            if !fragments.contains_key(&striped) {
                let key = striped.clone();
                fragments.insert(key, Vec::new());
            }
            fragments.get_mut(&striped).unwrap().push(id.clone());
        }
    }
}

fn generate_name(locations: &HashMap<String, String>, parents: str::Split<&str>) -> String {
    let mut ret = "".to_owned();
    for parent in parents {
        ret.push_str(&locations[parent]);
        ret.push_str(", ");
    }
    return ret.trim_matches(|c| c == ' ' || c == ',').to_owned();
}

fn generate_data(
    names: &mut HashMap<String, String>, 
    fragments: &mut HashMap<String, Vec<String>>,
    locations: &HashMap<String, String>, 
    geojson: &json::JsonValue
) {
    if geojson["type"] == "FeatureCollection" {
        for features in geojson["features"].members() {
            let id = Uuid::new_v4();
            let name;
            if features["properties"]["id"].is_null() {
                // Data exported from geoboundaries.org
                let full_name = features["properties"]["shapeName"].as_str().unwrap_or("");
                generate_fragments(fragments, id.to_string(), full_name);
                let data_id = features["properties"]["shapeID"].as_str().unwrap_or("");
                let parents = features["properties"]["ADMHIERACHY"].as_str().unwrap_or(&data_id).split(",");
                name = generate_name(locations, parents);
                names.insert(id.to_string(), name.clone());
            } else {
                // Data exported from OpenStreetMap
                let name_props = ["name", "local_name", "name_en"];
                for &prop in &name_props {
                    let full_name = features["properties"][prop].as_str().unwrap_or("");
                    generate_fragments(fragments, id.to_string(), full_name);
                }
                let data_id = features["properties"]["id"].as_i32().unwrap().to_string();
                let parents = features["properties"]["parents"].as_str().unwrap_or(&data_id).split(",");
                name = generate_name(locations, parents);
                names.insert(id.to_string(), name.clone());
            }
            let coordinates = &features["geometry"]["coordinates"];
            if features["geometry"]["type"] == "Polygon" {
                fs::write(
                    format!("../static/data/{}.json", id),
                    format!("{{\"name\":{},coordinates:[{:?}]}}", name, coordinates)
                ).unwrap();
            } else if features["geometry"]["type"] == "MultiPolygon" {
                fs::write(
                    format!("../static/data/{}.json", id),
                    format!("{{\"name\":{},coordinates:{:?}}}", name, coordinates)
                ).unwrap();
            }
        }
    }
}

fn main() {
    fs::remove_dir_all("../static/data").unwrap();
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
    fs::write("../static/data/index_names.json", format!("{:?}", names)).unwrap();
    fs::write("../static/data/index_fragments.json", format!("{:?}", fragments)).unwrap();
}
