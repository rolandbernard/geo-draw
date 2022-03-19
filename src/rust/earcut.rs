
use crate::list::CircularList;

use wasm_bindgen::JsValue;
use web_sys::console;

struct Node {
    x: f64, y: f64,
    z: f64, st: bool,
}

impl PartialEq for Node {
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x && self.y == other.y
    }
}

pub fn triangulate(vertex: &[f64], holes: &[usize], min: [f64; 2], max: [f64; 2]) -> Vec<usize> {
    console::log_1(&JsValue::from("test1"));
    let mut nodes = Vec::new();
    for i in 0..vertex.len() / 2 {
        nodes.push(Node { x: vertex[2*i], y: vertex[2*i + 1], z: f64::NAN, st: false });
    }
    console::log_1(&JsValue::from("test2"));
    let outer_len = if holes.len() > 0 { holes[0] } else { vertex.len() / 2 };
    let mut outer_nodes = create_list(&nodes, 0, outer_len, false);
    let mut triangles = Vec::new();
    console::log_1(&JsValue::from("test3"));
    if holes.len() > 0 {
        eliminate_holes(&mut nodes, holes, &mut outer_nodes);
    }
    console::log_1(&JsValue::from("test4"));
    let mut inv_size = f64::max(max[0] - min[0], max[1] - min[0]);
    inv_size = if inv_size != 0.0 { 1.0 / inv_size } else { 0.0 };
    apply_earcut(&mut nodes, &mut outer_nodes, &mut triangles);
    console::log_1(&JsValue::from("test5"));
    return triangles;
}

fn tri_area(a: &Node, b: &Node, c: &Node) -> f64 {
    (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)
}

fn point_in_triangle(a: &Node, b: &Node, c: &Node, p: &Node) -> bool {
    tri_area(p, c, a) >= 0.0 && tri_area(p, a, b) >= 0.0 && tri_area(p, b, c) >= 0.0
}

fn poly_area(nodes: &[Node], list: &CircularList<usize>) -> f64 {
    let mut sum = 0.0;
    let mut last = list.get(-1);
    for n in list {
        sum += (nodes[*last].x - nodes[*n].x) * (nodes[*n].y + nodes[*last].y);
        last = n;
    }
    return sum;
}

fn create_list(nodes: &[Node], from: usize, to: usize, rev: bool) -> CircularList<usize> {
    let mut list = CircularList::new();
    for i in from..to {
        list.insert(i);
    }
    if rev == (poly_area(nodes, &list) > 0.0) {
        list.reverse();
    }
    return list;
}

fn filter_points(nodes: &[Node], list: &mut CircularList<usize>) {
    let mut again = true;
    let mut left = list.len();
    while again || left > 0 {
        again = false;
        if !nodes[*list.get(0)].st && (
            nodes[*list.get(0)] == nodes[*list.get(1)]
            || tri_area(&nodes[*list.get(-1)], &nodes[*list.get(0)], &nodes[*list.get(1)]) == 0.0
        ) {
            list.remove();
            left = list.len();
            if left == 0 {
                break;
            }
            again = true;
        } else {
            list.rotate(1);
            left -= 1;
        }
    }
}

fn rotate_to_leftmost(nodes: &[Node], list: &mut CircularList<usize>) {
    let mut max = *list.get(0);
    let mut max_idx = 0;
    for i in 0..list.len() {
        let cur = *list.get(0);
        if nodes[cur].x < nodes[max].x || (nodes[cur].x == nodes[max].x && nodes[cur].y < nodes[max].y) {
            max = cur;
            max_idx = i;
        }
        list.rotate(1);
    }
    list.rotate(max_idx as isize);
}

fn eliminate_holes(nodes: &mut [Node], holes: &[usize], list: &mut CircularList<usize>) {
    let mut queue = Vec::new();
    for i in 0..holes.len() {
        let start = holes[i];
        let end = if i == holes.len() { nodes.len() } else { holes[i + 1] };
        let mut list = create_list(&nodes, start, end, true);
        if list.len() == 0 {
            nodes[*list.get(0)].st = true;
        }
        rotate_to_leftmost(nodes, &mut list);
        queue.push(list);
    }
    queue.sort_by(|a, b| nodes[*a.get(0)].x.partial_cmp(&nodes[*b.get(0)].x).unwrap());
    for q in queue {
        eliminate_hole(nodes, q, list);
        filter_points(nodes, list);
    }
}

fn eliminate_hole(nodes: &[Node], hole: CircularList<usize>, list: &mut CircularList<usize>) {
    // TODO: implement
}

fn apply_earcut(nodes: &mut [Node], list: &mut CircularList<usize>, triangles: &mut Vec<usize>) {
    let mut stop = *list.get(0);
    while list.len() > 0 {
        let cur = *list.get(0);
        let prev = *list.get(-1);
        let next = *list.get(1);
        if is_ear(nodes, list) {
            triangles.push(prev);
            triangles.push(cur);
            triangles.push(next);
            list.remove();
            list.rotate(2);
            stop = *list.get(0);
        } else if *list.get(0) == stop {
            break;
        }
    }
}

fn is_ear(nodes: &mut [Node], list: &mut CircularList<usize>) -> bool {
    let a = &nodes[*list.get(-1)];
    let b = &nodes[*list.get(0)];
    let c = &nodes[*list.get(1)];
    if tri_area(a, b, c) >= 0.0 {
        return false;
    }
    let mut view = list.get_view();
    view.rotate(2);
    for _ in 0..view.len() - 3 {
        let p_prev = &nodes[*view.get(-1)];
        let p = &nodes[*view.get(0)];
        let p_next = &nodes[*view.get(1)];
        if point_in_triangle(a, b, c, p) && tri_area(p_prev, p, p_next) >= 0.0 {
            return false;
        }
        view.rotate(1);
    }
    return true;
}

