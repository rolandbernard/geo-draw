
use crate::list::CircularList;

struct Node {
    index: usize,
    z: f64, st: bool,
}

fn signed_area(vertex: &[f64], list: &CircularList<&Node>) -> f64 {
    let mut sum = 0.0;
    let mut last = list.get(-1).index;
    for n in list {
        let this = n.index;
        sum += (vertex[2*last] - vertex[2*this]) * (vertex[2*this + 1] + vertex[2*last + 1]);
        last = this;
    }
    return sum;
}

fn create_list(nodes: &[Node], rev: bool) -> CircularList<&Node> {
    let mut list = CircularList::new();
    for n in nodes {
        list.insert(n);
    }
    if rev {
        list.reverse();
    }
    return list;
}

pub fn triangulate(vertex: &[f64], holes: &[usize], min: [f64; 2], max: [f64; 2]) -> Vec<usize> {
    let mut nodes = Vec::new();
    for i in 0..vertex.len() / 2 {
        nodes.push(Node { index: i, z: f64::NAN, st: false });
    }
    let outer_len = if holes.len() > 0 { holes[0] } else { vertex.len() / 2 };
    let mut outer_nodes = create_list(&nodes[0..outer_len], false);
    let mut triangles = Vec::new();
    if holes.len() > 0 {
        eliminate_holes(vertex, holes, &mut outer_nodes);
    }
    let mut inv_size = f64::max(max[0] - min[0], max[1] - min[0]);
    inv_size = if inv_size != 0.0 { 1.0 / inv_size } else { 0.0 };
    apply_earcut(vertex, &mut outer_nodes, &mut triangles, min, inv_size);
    return triangles;
}

fn eliminate_holes(vertex: &[f64], holes: &[usize], list: &mut CircularList<&Node>) {

}

fn apply_earcut(vertex: &[f64], list: &mut CircularList<&Node>, triangles: &mut Vec<usize>, min: [f64; 2], inv_size: f64) {

}

