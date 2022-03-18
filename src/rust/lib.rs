
use wasm_bindgen::prelude::*;

mod earcut;

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Point(pub f64, pub f64);

#[wasm_bindgen]
#[derive(Clone)]
pub struct Polygon {
    vertex: Vec<f64>,
    holes: Vec<usize>,
}

#[wasm_bindgen]
impl Polygon {
    #[wasm_bindgen(getter)]
    pub fn raw_vertex(&self) -> Vec<f64> {
        self.vertex.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn projected_vertex(&self) -> Vec<f64> {
        self.vertex.clone()
    }
    
    #[wasm_bindgen(getter)]
    pub fn holes(&self) -> Vec<usize> {
        self.holes.clone()
    }
}

#[wasm_bindgen]
pub struct LocationData {
    name: String,
    polygons: Vec<Polygon>,
    min: Point,
    max: Point,
}

#[wasm_bindgen]
impl LocationData {
    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn min(&self) -> Point {
        self.min
    }

    #[wasm_bindgen(getter)]
    pub fn max(&self) -> Point {
        self.max
    }

    #[wasm_bindgen]
    pub fn count_polygons(&self) -> usize {
        self.polygons.len()
    }

    #[wasm_bindgen]
    pub fn get_polygon(&self, i: usize) -> Polygon {
        self.polygons[i].clone()
    }

    #[wasm_bindgen]
    pub fn parse_location_data(raw: &[u8]) -> LocationData {
        fn read_unsigned(raw: &[u8]) -> u32 {
            (raw[0] as u32) | (raw[1] as u32) << 8
            | (raw[2] as u32) << 16 | (raw[3] as u32) << 24
        }
        fn read_signed(raw: &[u8]) -> i32 {
            (raw[0] as i32) | (raw[1] as i32) << 8
            | (raw[2] as i32) << 16 | (raw[3] as i32) << 24
        }
        let mut len = 0;
        while raw[len] != 0 {
            len += 1;
        }
        let name = std::str::from_utf8(&raw[..len]).unwrap_or("");
        len += 1;
        let mut polygons = Vec::new();
        let num_poly = read_unsigned(&raw[len..len + 4]);
        let mut min = Point (f64::MAX, f64::MAX);
        let mut max = Point (f64::MIN, f64::MIN);
        len += 4;
        for _ in 0..num_poly {
            let mut poly = Polygon {
                vertex: Vec::new(), holes: Vec::new(),
            };
            let num_path = read_unsigned(&raw[len..len + 4]);
            len += 4;
            for t in 0..num_path {
                if t != 0 {
                    poly.holes.push(poly.vertex.len());
                }
                let num_cords = read_unsigned(&raw[len..len + 4]);
                len += 4;
                for _ in 0..num_cords {
                    let lon = read_signed(&raw[len..len + 4]) as f64 * std::f64::consts::PI / 180.0;
                    len += 4;
                    let lat = read_signed(&raw[len..len + 4]) as f64 * std::f64::consts::PI / 180.0;
                    len += 4;
                    poly.vertex.push(lon);
                    poly.vertex.push(lat);
                    min.0 = min.0.min(lon);
                    min.1 = min.1.min(lat);
                    max.0 = max.0.max(lon);
                    max.1 = max.1.max(lat);
                }
            }
            polygons.push(poly);
        }
        return LocationData {
            name: name.to_owned(),
            polygons: polygons,
            min: min,
            max: max,
        };
    }
}

