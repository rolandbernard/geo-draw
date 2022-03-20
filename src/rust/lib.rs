
use std::f64::consts::PI;

use wasm_bindgen::prelude::*;

mod earcut;

type Point = [f64; 2];

#[wasm_bindgen]
#[derive(Clone)]
pub struct Polygon {
    vertex: Vec<f64>,
    holes: Vec<usize>,
    min: Point,
    max: Point,
}

#[wasm_bindgen]
impl Polygon {
    #[wasm_bindgen(getter)]
    pub fn vertex(&self) -> Vec<f64> {
        self.vertex.clone()
    }
    
    #[wasm_bindgen(getter)]
    pub fn holes(&self) -> Vec<usize> {
        self.holes.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn min(&self) -> Vec<f64> {
        self.min.to_vec()
    }

    #[wasm_bindgen(getter)]
    pub fn max(&self) -> Vec<f64> {
        self.min.to_vec()
    }

    #[wasm_bindgen]
    pub fn triangulate(&self) -> Vec<usize> {
        earcut::triangulate(&self.vertex, &self.holes, self.min, self.max)
    }

    fn projected(&self) -> Polygon {
        fn map_projection(lon: f64, lat: f64) -> Point {
            [
                PI + lon,
                PI - f64::ln(f64::tan(
                    PI / 4.0 + if f64::abs(lat) > 85.0 { f64::signum(lat) * 85.0 } else { lat } / 2.0
                ))
            ]
        }
        let mut poly = Polygon {
            vertex: self.vertex.clone(), holes: self.holes.clone(),
            min: [f64::MAX, f64::MAX], max: [f64::MIN, f64::MIN]
        };
        for i in (0..self.vertex.len()).step_by(2) {
            let proj = map_projection(self.vertex[i], self.vertex[i + 1]);
            poly.vertex[i] = proj[0];
            poly.vertex[i + 1] = proj[1];
            poly.min[0] = poly.min[0].min(proj[0]);
            poly.min[1] = poly.min[1].min(proj[1]);
            poly.max[0] = poly.max[0].max(proj[0]);
            poly.max[1] = poly.max[1].max(proj[1]);
        }
        return poly;
    }
}

#[wasm_bindgen]
pub struct LocationData {
    name: String,
    polygons: Vec<Polygon>,
    min: Point,
    max: Point,
    proj_polygons: Vec<Polygon>,
    proj_min: Point,
    proj_max: Point,
}

#[wasm_bindgen]
impl LocationData {
    #[wasm_bindgen(getter)]
    pub fn name(&self) -> String {
        self.name.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn min(&self) -> Vec<f64> {
        self.min.to_vec()
    }

    #[wasm_bindgen(getter)]
    pub fn max(&self) -> Vec<f64> {
        self.max.to_vec()
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
    pub fn get_proj_polygon(&mut self, i: usize) -> Polygon {
        self.proj_polygons[i].clone()
    }

    #[wasm_bindgen(getter)]
    pub fn proj_min(&self) -> Vec<f64> {
        self.proj_min.to_vec()
    }

    #[wasm_bindgen(getter)]
    pub fn proj_max(&self) -> Vec<f64> {
        self.proj_max.to_vec()
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
        let mut proj_polygons = Vec::new();
        let num_poly = read_unsigned(&raw[len..len + 4]);
        let mut min = [f64::MAX, f64::MAX];
        let mut max = [f64::MIN, f64::MIN];
        let mut proj_min = [f64::MAX, f64::MAX];
        let mut proj_max = [f64::MIN, f64::MIN];
        len += 4;
        for _ in 0..num_poly {
            let mut poly = Polygon {
                vertex: Vec::new(), holes: Vec::new(),
                min: [f64::MAX, f64::MAX], max: [f64::MIN, f64::MIN]
            };
            let num_path = read_unsigned(&raw[len..len + 4]);
            len += 4;
            for t in 0..num_path {
                if t != 0 {
                    poly.holes.push(poly.vertex.len() / 2);
                }
                let num_cords = read_unsigned(&raw[len..len + 4]);
                len += 4;
                for _ in 0..num_cords {
                    let lon = read_signed(&raw[len..len + 4]) as f64 * PI / 180.0e7;
                    len += 4;
                    let lat = read_signed(&raw[len..len + 4]) as f64 * PI / 180.0e7;
                    len += 4;
                    poly.min[0] = poly.min[0].min(lon);
                    poly.min[1] = poly.min[1].min(lat);
                    poly.max[0] = poly.max[0].max(lon);
                    poly.max[1] = poly.max[1].max(lat);
                    poly.vertex.push(lon);
                    poly.vertex.push(lat);
                }
            }
            min[0] = min[0].min(poly.min[0]);
            min[1] = min[1].min(poly.min[1]);
            max[0] = max[0].max(poly.max[0]);
            max[1] = max[1].max(poly.max[1]);
            let proj = poly.projected();
            proj_min[0] = proj_min[0].min(proj.min[0]);
            proj_min[1] = proj_min[1].min(proj.min[1]);
            proj_max[0] = proj_max[0].max(proj.max[0]);
            proj_max[1] = proj_max[1].max(proj.max[1]);
            polygons.push(poly);
            proj_polygons.push(proj);
        }
        return LocationData {
            name: name.to_owned(),
            polygons: polygons,
            proj_polygons: proj_polygons,
            min: min, max: max,
            proj_min: proj_min, proj_max: proj_max,
        };
    }
}

