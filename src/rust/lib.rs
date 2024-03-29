
use std::f32::consts::PI;

use js_sys::{Uint32Array, Float32Array};
use wasm_bindgen::prelude::*;

mod earcut;

type Point = [f32; 2];

pub struct Polygon {
    vertex: Vec<f32>,
    holes: Vec<u32>,
    min: Point,
    max: Point,
}

impl Polygon {
    pub fn triangulate_into(&self, triangles: &mut Vec<u32>) {
        earcut::triangulate_into(triangles, &self.vertex, &self.holes, self.min, self.max);
    }

    fn projected(&self) -> Polygon {
        fn map_projection(lon: f32, lat: f32) -> Point {
            [
                PI + lon,
                PI - f32::ln(f32::tan(
                    PI / 4.0 + if f32::abs(lat) > 85.0 { f32::signum(lat) * 85.0 } else { lat } / 2.0
                ))
            ]
        }
        let mut poly = Polygon {
            vertex: self.vertex.clone(), holes: self.holes.clone(),
            min: [f32::MAX, f32::MAX], max: [f32::MIN, f32::MIN]
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
pub struct PolygonView {
    poly: *const Polygon,
}

impl PolygonView {
    fn new(poly: &Polygon) -> PolygonView {
        PolygonView { poly }
    }
}

#[wasm_bindgen]
impl PolygonView {
    #[wasm_bindgen(getter)]
    pub fn vertex(&self) -> Float32Array {
        unsafe { Float32Array::view(&(*self.poly).vertex) }
    }
    
    #[wasm_bindgen(getter)]
    pub fn holes(&self) -> Uint32Array {
        unsafe { Uint32Array::view(&(*self.poly).holes) }
    }

    #[wasm_bindgen(getter)]
    pub fn min(&self) -> Vec<f32> {
        unsafe { (*self.poly).min.to_vec() }
    }

    #[wasm_bindgen(getter)]
    pub fn max(&self) -> Vec<f32> {
        unsafe { (*self.poly).max.to_vec() }
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
    pub fn min(&self) -> Vec<f32> {
        self.min.to_vec()
    }

    #[wasm_bindgen(getter)]
    pub fn max(&self) -> Vec<f32> {
        self.max.to_vec()
    }

    #[wasm_bindgen]
    pub fn count_polygons(&self) -> usize {
        self.polygons.len()
    }

    #[wasm_bindgen]
    pub fn get_polygon(&self, i: usize) -> PolygonView {
        PolygonView::new(&self.polygons[i])
    }

    #[wasm_bindgen]
    pub fn get_proj_polygon(&mut self, i: usize) -> PolygonView {
        PolygonView::new(&self.proj_polygons[i])
    }

    #[wasm_bindgen(getter)]
    pub fn proj_min(&self) -> Vec<f32> {
        self.proj_min.to_vec()
    }

    #[wasm_bindgen(getter)]
    pub fn proj_max(&self) -> Vec<f32> {
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
        let mut min = [f32::MAX, f32::MAX];
        let mut max = [f32::MIN, f32::MIN];
        let mut proj_min = [f32::MAX, f32::MAX];
        let mut proj_max = [f32::MIN, f32::MIN];
        len += 4;
        for _ in 0..num_poly {
            let mut poly = Polygon {
                vertex: Vec::new(), holes: Vec::new(),
                min: [f32::MAX, f32::MAX], max: [f32::MIN, f32::MIN]
            };
            let num_path = read_unsigned(&raw[len..len + 4]);
            len += 4;
            for t in 0..num_path {
                if t != 0 {
                    poly.holes.push((poly.vertex.len() / 2) as u32);
                }
                let num_cords = read_unsigned(&raw[len..len + 4]);
                len += 4;
                for _ in 0..num_cords {
                    let lon = read_signed(&raw[len..len + 4]) as f32 * PI / 180.0e7;
                    len += 4;
                    let lat = read_signed(&raw[len..len + 4]) as f32 * PI / 180.0e7;
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

#[wasm_bindgen]
pub struct TriangulatedData {
    locs: Vec<*const LocationData>,
    vertex: Vec<f32>,
    color: Vec<f32>,
    triangles: Vec<u32>,
    polygons: Vec<usize>,
    outline_triangles: Vec<f32>,
    outline_normals: Vec<f32>,
    min: Point,
    max: Point,
}

#[wasm_bindgen]
impl TriangulatedData {
    #[wasm_bindgen(getter)]
    pub fn vertex(&self) -> Float32Array {
        unsafe { Float32Array::view(&self.vertex) }
    }

    #[wasm_bindgen(getter)]
    pub fn color(&self) -> Float32Array {
        unsafe { Float32Array::view(&self.color) }
    }

    #[wasm_bindgen(getter)]
    pub fn triangles(&self) -> Uint32Array {
        unsafe { Uint32Array::view(&self.triangles) }
    }

    #[wasm_bindgen(getter)]
    pub fn outline_triangles(&self) -> Float32Array {
        unsafe { Float32Array::view(&self.outline_triangles) }
    }

    #[wasm_bindgen(getter)]
    pub fn outline_normals(&self) -> Float32Array {
        unsafe { Float32Array::view(&self.outline_normals) }
    }

    #[wasm_bindgen(getter)]
    pub fn min(&self) -> Vec<f32> {
        self.min.to_vec()
    }

    #[wasm_bindgen(getter)]
    pub fn max(&self) -> Vec<f32> {
        self.max.to_vec()
    }

    #[wasm_bindgen]
    pub fn new() -> TriangulatedData {
        TriangulatedData {
            locs: Vec::new(), vertex: Vec::new(), color: Vec::new(),
            triangles: Vec::new(), polygons: Vec::new(),
            outline_triangles: Vec::new(), outline_normals: Vec::new(),
            min: [f32::MAX, f32::MAX], max: [f32::MIN, f32::MIN],
        }
    }
    
    #[wasm_bindgen]
    pub fn add_location(&mut self, loc: &LocationData) {
        self.locs.push(loc);
    }

    #[wasm_bindgen]
    pub fn triangulate(&mut self, proj: bool) {
        for (i, &loc) in self.locs.iter().enumerate() {
            let polys = unsafe {
                if proj { &(*loc).proj_polygons } else { &(*loc).polygons }
            };
            for poly in polys {
                let old = self.triangles.len();
                poly.triangulate_into(&mut self.triangles);
                for j in old..self.triangles.len() {
                    self.triangles[j] += (self.vertex.len() / 2) as u32;
                }
                self.vertex.extend(&poly.vertex);
                self.polygons.push(old);
                for _ in 0..poly.vertex.len() / 2 {
                    self.color.push((i as f32 + 0.5) / self.locs.len() as f32);
                }
                self.min[0] = self.min[0].min(poly.min[0]);
                self.min[1] = self.min[1].min(poly.min[1]);
                self.max[0] = self.max[0].max(poly.max[0]);
                self.max[1] = self.max[1].max(poly.max[1]);
            }
        }
    }

    pub fn generate_outlines(&mut self, proj: bool) {
        for &loc in &self.locs {
            let polys = unsafe {
                if proj { &(*loc).proj_polygons } else { &(*loc).polygons }
            };
            for poly in polys {
                for j in 0..poly.holes.len() + 1 {
                    let start = if j == 0 { 0 } else { poly.holes[j - 1] as usize };
                    let end = if j == poly.holes.len() { poly.vertex.len() / 2 } else { poly.holes[j] as usize };
                    let part_len = end - start;
                    for i in 0..part_len {
                        let curr = (poly.vertex[2 * (start + i)], poly.vertex[2 * (start + i) + 1]);
                        let last = (
                            poly.vertex[2 * (start + (part_len + i - 1) % part_len)],
                            poly.vertex[2 * (start + (part_len + i - 1) % part_len) + 1],
                        );
                        let next = (
                            poly.vertex[2 * (start + (i + 1) % part_len)],
                            poly.vertex[2 * (start + (i + 1) % part_len) + 1],
                        );
                        let from_last = (curr.0 - last.0, curr.1 - last.1);
                        let to_next = (next.0 - curr.0, next.1 - curr.1);
                        self.outline_triangles.extend([
                            curr.0, curr.1,   curr.0, curr.1,   next.0, next.1, // Line
                            curr.0, curr.1,   next.0, next.1,   next.0, next.1,

                            curr.0, curr.1,   curr.0, curr.1,   curr.0, curr.1, // Corner
                            curr.0, curr.1,   curr.0, curr.1,   curr.0, curr.1,
                        ]);
                        self.outline_normals.extend([
                            to_next.1, -to_next.0,   -to_next.1, to_next.0,   to_next.1, -to_next.0,
                            -to_next.1, to_next.0,   -to_next.1, to_next.0,   to_next.1, -to_next.0,

                            -from_last.1, from_last.0, from_last.1, -from_last.0, -to_next.1, to_next.0,
                            -from_last.1, from_last.0, from_last.1, -from_last.0, to_next.1, -to_next.0,
                        ])
                    }
                }
            }
        }
    }

    #[wasm_bindgen]
    pub fn get_intersection(&self, pos: Vec<f32>, proj: bool) -> Option<Vec<usize>> {
        let mut poly_i = 0;
        for (l, &loc) in self.locs.iter().enumerate() {
            let (min, max, polys) = unsafe {
                if proj {
                    (&(*loc).proj_min, &(*loc).proj_max, &(*loc).proj_polygons)
                } else {
                    (&(*loc).min, &(*loc).max, &(*loc).polygons)
                }
            };
            if pos[0] >= min[0] && pos[1] >= min[1] && pos[0] <= max[0] && pos[1] <= max[1] {
                for (p, poly) in polys.iter().enumerate() {
                    let min = poly.min;
                    let max = poly.max;
                    if pos[0] >= min[0] && pos[1] >= min[1] && pos[0] <= max[0] && pos[1] <= max[1] {
                        let start = self.polygons[poly_i];
                        let end = if poly_i + 1 < self.polygons.len() { self.polygons[poly_i + 1] } else { self.triangles.len() };
                        for j in (start..end).step_by(3) {
                            let v1 = [
                                self.vertex[2 * self.triangles[j] as usize],
                                self.vertex[2 * self.triangles[j] as usize + 1]
                            ];
                            let v2 = [
                                self.vertex[2 * self.triangles[j + 1] as usize],
                                self.vertex[2 * self.triangles[j + 1] as usize + 1]
                            ];
                            let v3 = [
                                self.vertex[2 * self.triangles[j + 2] as usize],
                                self.vertex[2 * self.triangles[j + 2] as usize + 1]
                            ];
                            fn sign(p1: &Vec<f32>, p2: &Point, p3: &Point) -> f32 {
                                return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
                            }
                            let d1 = sign(&pos, &v1, &v2);
                            let d2 = sign(&pos, &v2, &v3);
                            let d3 = sign(&pos, &v3, &v1);
                            let has_neg = (d1 < 0.0) || (d2 < 0.0) || (d3 < 0.0);
                            let has_pos = (d1 > 0.0) || (d2 > 0.0) || (d3 > 0.0);
                            if !(has_neg && has_pos) {
                                return Some(vec![l, p]);
                            }
                        }
                    }
                    poly_i += 1;
                }
            } else {
                poly_i += polys.len();
            }
        }
        return None;
    }
}

