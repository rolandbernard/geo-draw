
#[derive(Clone)]
struct Node {
    i: usize, x: f64, y: f64,
    next: usize, prev: usize,
}

impl PartialEq for Node {
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x && self.y == other.y
    }
}

pub fn triangulate(vertex: &[f64], holes: &[u32], min: [f64; 2], max: [f64; 2]) -> Vec<u32> {
    let mut triangles = Vec::with_capacity(3 * (vertex.len() / 2 + 2 * holes.len()));
    triangulate_into(&mut triangles, vertex, holes, min, max);
    return triangles;
}

pub fn triangulate_into(triangles: &mut Vec<u32>, vertex: &[f64], holes: &[u32], _min: [f64; 2], _max: [f64; 2]) {
    let node_len = vertex.len() / 2;
    let mut nodes = Vec::with_capacity(node_len + 2 * holes.len());
    for i in 0..node_len {
        nodes.push(Node {
            i, x: vertex[2*i], y: vertex[2*i + 1],
            next: (i + 1) % node_len, prev: (node_len + i - 1) % node_len,
        });
    }
    let outer_len = if holes.len() > 0 { holes[0] as usize } else { node_len as usize };
    create_list(&mut nodes, 0, outer_len, false);
    if holes.len() > 0 {
        eliminate_holes(&mut nodes, holes, 0);
    }
    apply_earcut(&mut nodes, 0, triangles);
}

fn tri_area(a: &Node, b: &Node, c: &Node) -> f64 {
    (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)
}

fn point_in_triangle(a: &Node, b: &Node, c: &Node, p: &Node) -> bool {
    let a0 = tri_area(p, c, a);
    let a1 = tri_area(p, a, b);
    let a2 = tri_area(p, b, c);
    a0 <= 0.0 && a1 <= 0.0 && a2 <= 0.0
}

fn poly_area(nodes: &[Node], head: usize) -> f64 {
    let mut sum = 0.0;
    let mut last = nodes[head].prev;
    let mut cur = head;
    loop {
        sum += (nodes[last].x - nodes[cur].x) * (nodes[cur].y + nodes[last].y);
        last = cur;
        cur = nodes[cur].next;
        if cur == head {
            break;
        }
    }
    return sum;
}

fn lines_intersect(a0: &Node, b0: &Node, a1: &Node, b1: &Node) -> bool {
    let o1 = tri_area(a0, b0, a1).signum();
    let o2 = tri_area(a0, b0, b1).signum();
    let o3 = tri_area(a1, b1, a0).signum();
    let o4 = tri_area(a1, b1, b0).signum();
    o1 != o2 && o3 != o4
        || (o1 == 0.0 && point_on_segment(a0, b0, a1))
        || (o2 == 0.0 && point_on_segment(a0, b0, b1))
        || (o3 == 0.0 && point_on_segment(a1, b1, a0))
        || (o4 == 0.0 && point_on_segment(a1, b1, b0))
}

fn point_on_segment(a: &Node, b: &Node, p: &Node) -> bool {
    p.x <= f64::max(a.x, b.x) && p.x >= f64::min(a.x, b.x)
        && p.y <= f64::max(a.y, b.y) && p.y >= f64::min(a.y, b.y)
}

fn remove_node(nodes: &mut [Node], node: usize) {
    let prev = nodes[node].prev;
    let next = nodes[node].next;
    nodes[prev].next = next;
    nodes[next].prev = prev;
}

fn create_list(nodes: &mut [Node], from: usize, to: usize, rev: bool) {
    nodes[to - 1].next = from;
    nodes[from].prev = to - 1;
    if rev == (poly_area(nodes, from) > 0.0) {
        let mut cur = from;
        loop {
            std::mem::swap(&mut nodes[cur].prev, &mut nodes[cur].next);
            cur = nodes[cur].prev;
            if cur == from {
                break;
            }
        }
    }
}

fn filter_points(nodes: &mut [Node], head: usize) -> usize {
    let mut end = head;
    let mut cur = head;
    while cur != nodes[cur].next {
        let prev = nodes[cur].prev;
        let next = nodes[cur].next;
        if nodes[cur] == nodes[next]
            || tri_area(&nodes[prev], &nodes[cur], &nodes[next]) == 0.0
        {
            remove_node(nodes, cur);
            cur = prev;
            end = cur;
        } else {
            cur = next;
            if cur == end {
                break;
            }
        }
    }
    return cur;
}

fn find_leftmost(nodes: &[Node], head: usize) -> usize {
    let mut min = head;
    let mut cur = head;
    loop {
        if nodes[cur].x < nodes[min].x || (nodes[cur].x == nodes[min].x && nodes[cur].y < nodes[min].y) {
            min = cur;
        }
        cur = nodes[cur].next;
        if cur == head {
            break;
        }
    }
    return min;
}

fn eliminate_holes(nodes: &mut Vec<Node>, holes: &[u32], outer: usize) {
    let mut queue = Vec::new();
    for i in 0..holes.len() {
        let start = holes[i] as usize;
        let end = if i + 1 == holes.len() { nodes.len() } else { holes[i + 1] as usize };
        create_list(nodes, start, end, true);
        queue.push(find_leftmost(nodes, start));
    }
    queue.sort_by(|a, b| nodes[*a].x.partial_cmp(&nodes[*b].x).unwrap());
    for q in queue {
        eliminate_hole(nodes, q, outer);
    }
}

fn eliminate_hole(nodes: &mut Vec<Node>, hole: usize, outer: usize) {
    let bridge = find_bridge_point(nodes, hole, outer);
    create_bridge(nodes, bridge, hole);
}

fn find_bridge_point(nodes: &[Node], hole: usize, outer: usize) -> usize {
    let mut cand = outer;
    let mut cand_x = f64::NEG_INFINITY;
    let mut cur = outer;
    loop {
        let next = nodes[cur].next;
        if nodes[cur].y >= nodes[hole].y && nodes[next].y <= nodes[hole].y {
            let sec_x = nodes[cur].x + (nodes[hole].y - nodes[cur].y)
                * (nodes[next].x - nodes[cur].x) / (nodes[next].y - nodes[cur].y);
            if sec_x <= nodes[hole].x && sec_x >= cand_x {
                if nodes[cur].x < nodes[next].x {
                    cand = cur;
                } else {
                    cand = next;
                }
                cand_x = sec_x;
            }
        }
        cur = next;
        if cur == outer {
            break;
        }
    }
    loop {
        let fake_node = Node { i: 0, x: nodes[cand].x, y: nodes[hole].y, next: 0, prev: 0 };
        if point_in_triangle(&nodes[hole], &fake_node, &nodes[cand], &nodes[cur]) {
            cand = cur;
        }
        cur = nodes[cur].next;
        if cur == outer {
            break;
        }
    }
    return cand;
}

fn create_bridge(nodes: &mut Vec<Node>, a: usize, b: usize) -> usize {
    let a2 = nodes.len();
    nodes.push(nodes[a].clone());
    let b2 = nodes.len();
    nodes.push(nodes[b].clone());
    let a_next = nodes[a].next;
    let b_prev = nodes[b].prev;
    nodes[a2].next = a_next;
    nodes[a_next].prev = a2;
    nodes[a2].prev = b2;
    nodes[b2].next = a2;
    nodes[b2].prev = b_prev;
    nodes[b_prev].next = b2;
    nodes[a].next = b;
    nodes[b].prev = a;
    return a2;
}

fn resolve_intersections(nodes: &mut [Node], head: usize, triangles: &mut Vec<u32>) -> usize {
    let mut stop = head;
    let mut cur = head;
    while nodes[cur].prev != nodes[cur].next {
        let prev = nodes[cur].prev;
        let next = nodes[cur].next;
        let next2 = nodes[next].next;
        if prev != next2 && lines_intersect(&nodes[prev], &nodes[cur], &nodes[next], &nodes[next2]) {
            triangles.push(nodes[prev].i as u32);
            triangles.push(nodes[cur].i as u32);
            triangles.push(nodes[next2].i as u32);
            remove_node(nodes, cur);
            remove_node(nodes, next);
            cur = next2;
            stop = cur;
        } else {
            cur = next;
            if cur == stop {
                break;
            }
        }
    }
    return cur;
}

fn line_intersect_poly(nodes: &[Node], poly: usize, a: &Node, b: &Node) -> bool {
    let mut cur = poly;
    loop {
        let next = nodes[cur].next;
        if lines_intersect(&nodes[cur], &nodes[next], a, b) {
            return true;
        }
        cur = next;
        if cur == poly {
            break;
        }
    }
    return false;
}

fn locally_inside(a0: &Node, a: &Node, a1: &Node, b: &Node) -> bool {
    if tri_area(a0, a, a1) < 0.0 {
        tri_area(a, b, a1) >= 0.0 && tri_area(a, a0, b) >= 0.0
    } else {
        tri_area(a, b, a0) < 0.0 || tri_area(a, a1, b) < 0.0
    }
}

fn is_possible_diagonal(nodes: &[Node], poly: usize, a: usize, b: usize) -> bool {
    let a_next = nodes[a].next;
    let a_prev = nodes[a].prev;
    let b_next = nodes[b].next;
    let b_prev = nodes[b].prev;
    nodes[a].i != nodes[b].i && nodes[a_next].i != nodes[b].i && nodes[a_prev].i != nodes[b].i
        && locally_inside(&nodes[a_prev], &nodes[a], &nodes[a_next], &nodes[b])
        && locally_inside(&nodes[b_prev], &nodes[b], &nodes[b_next], &nodes[a])
        && !line_intersect_poly(nodes, poly, &nodes[a], &nodes[b])
}

fn split_earcut(nodes: &mut Vec<Node>, head: usize, triangles: &mut Vec<u32>) {
    let mut cur = head;
    loop {
        let next = nodes[cur].next;
        let mut snd = nodes[next].next;
        while snd != nodes[cur].prev {
            if is_possible_diagonal(nodes, head, cur, snd) {
                let cur2 = create_bridge(nodes, cur, snd);
                apply_earcut(nodes, cur, triangles);
                apply_earcut(nodes, cur2, triangles);
                return;
            }
            snd = nodes[snd].next;
        }
        cur = next;
        if cur == head {
            break;
        }
    }
    while nodes[cur].prev != nodes[cur].next {
        let prev = nodes[cur].prev;
        let next = nodes[cur].next;
        triangles.push(nodes[prev].i as u32);
        triangles.push(nodes[cur].i as u32);
        triangles.push(nodes[next].i as u32);
        remove_node(nodes, cur);
        cur = nodes[next].next;
    }
}

fn apply_earcut(nodes: &mut Vec<Node>, head: usize, triangles: &mut Vec<u32>) {
    let mut pass = 0;
    let mut cur = head;
    while nodes[cur].prev != nodes[cur].next && pass < 3 {
        if pass < 2 {
            cur = filter_points(nodes, cur);
        } else if pass < 3 {
            cur = filter_points(nodes, cur);
            cur = resolve_intersections(nodes, cur, triangles);
            cur = filter_points(nodes, cur);
        }
        let mut stop = cur;
        while nodes[cur].prev != nodes[cur].next {
            let prev = nodes[cur].prev;
            let next = nodes[cur].next;
            if is_ear(nodes, cur) {
                triangles.push(nodes[prev].i as u32);
                triangles.push(nodes[cur].i as u32);
                triangles.push(nodes[next].i as u32);
                remove_node(nodes, cur);
                cur = nodes[next].next;
                stop = cur;
            } else {
                cur = next;
                if cur == stop {
                    break;
                }
            }
        }
        pass += 1;
    }
    if nodes[cur].prev != nodes[cur].next {
        split_earcut(nodes, cur, triangles);
    }
}

fn is_ear(nodes: &[Node], node: usize) -> bool {
    let a = &nodes[nodes[node].prev];
    let b = &nodes[node];
    let c = &nodes[nodes[node].next];
    if tri_area(a, b, c) >= 0.0 {
        return false;
    }
    let mut cur = nodes[nodes[node].next].next;
    loop {
        let prev = nodes[cur].prev;
        let next = nodes[cur].next;
        if point_in_triangle(a, b, c, &nodes[cur]) && tri_area(&nodes[prev], &nodes[cur], &nodes[next]) >= 0.0 {
            return false;
        }
        cur = next;
        if cur == nodes[node].prev {
            break;
        }
    }
    return true;
}

