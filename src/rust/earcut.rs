
#[derive(Clone)]
struct Node {
    i: usize, x: f32, y: f32, 
    next: usize, prev: usize,
    z: u32, znext: usize, zprev: usize,
}

impl Node {
    fn new(i: usize, x: f32, y: f32, next: usize, prev: usize) -> Node {
        Node { i, x, y, next, prev, z: 0, znext: 0, zprev: 0 }
    }

    fn dummy(x: f32, y: f32) -> Node {
        Self::new(0, x, y, 0, 0)
    }
}

impl PartialEq for Node {
    fn eq(&self, other: &Self) -> bool {
        self.x == other.x && self.y == other.y
    }
}

pub fn triangulate_into(triangles: &mut Vec<u32>, vertex: &[f32], holes: &[u32], min: [f32; 2], max: [f32; 2]) {
    let node_len = vertex.len() / 2;
    let mut nodes = Vec::with_capacity(node_len + 2 * holes.len());
    for i in 0..node_len {
        nodes.push(Node::new(
            i, vertex[2*i], vertex[2*i + 1],
            (i + 1) % node_len, (node_len + i - 1) % node_len
        ));
    }
    let outer_len = if holes.len() > 0 { holes[0] as usize } else { node_len as usize };
    create_list(&mut nodes, 0, outer_len, false);
    if holes.len() > 0 {
        eliminate_holes(&mut nodes, holes, 0);
    }
    if node_len > 80 {
        let mut inv_size = f32::max(max[0] - min[0], max[1] - min[0]);
        inv_size = if inv_size != 0.0 { 1.0 / inv_size } else { 0.0 };
        generate_z_index(&mut nodes, 0, min, inv_size);
        apply_earcut(&mut nodes, 0, triangles, min, inv_size);
    } else {
        apply_earcut(&mut nodes, 0, triangles, min, f32::NAN);
    }
}

fn tri_area(a: &Node, b: &Node, c: &Node) -> f32 {
    (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y)
}

fn point_in_triangle(a: &Node, b: &Node, c: &Node, p: &Node) -> bool {
    let a0 = tri_area(p, c, a);
    let a1 = tri_area(p, a, b);
    let a2 = tri_area(p, b, c);
    a0 <= 0.0 && a1 <= 0.0 && a2 <= 0.0
}

fn poly_area(nodes: &[Node], head: usize) -> f32 {
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
    p.x <= f32::max(a.x, b.x) && p.x >= f32::min(a.x, b.x)
        && p.y <= f32::max(a.y, b.y) && p.y >= f32::min(a.y, b.y)
}

fn remove_node(nodes: &mut [Node], node: usize) {
    let prev = nodes[node].prev;
    let next = nodes[node].next;
    nodes[prev].next = next;
    nodes[next].prev = prev;
    let zprev = nodes[node].zprev;
    let znext = nodes[node].znext;
    nodes[zprev].znext = znext;
    nodes[znext].zprev = zprev;
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
    let mut cand_x = f32::NEG_INFINITY;
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
        let fake_node = Node::dummy(nodes[cand].x, nodes[hole].y);
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

fn split_earcut(nodes: &mut Vec<Node>, head: usize, triangles: &mut Vec<u32>, min: [f32; 2], inv_size: f32) {
    let mut cur = head;
    loop {
        let next = nodes[cur].next;
        let mut snd = nodes[next].next;
        while snd != nodes[cur].prev {
            if is_possible_diagonal(nodes, head, cur, snd) {
                let cur2 = create_bridge(nodes, cur, snd);
                apply_earcut(nodes, cur, triangles, min, inv_size);
                apply_earcut(nodes, cur2, triangles, min, inv_size);
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

fn apply_earcut(nodes: &mut Vec<Node>, head: usize, triangles: &mut Vec<u32>, min: [f32; 2], inv_size: f32) {
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
            if if inv_size.is_nan() { is_ear(nodes, cur) } else { is_ear_z_index(nodes, cur, min, inv_size) } {
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
        split_earcut(nodes, cur, triangles, min, inv_size);
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

fn generate_z_index(nodes: &mut [Node], outer: usize, min: [f32; 2], inv_size: f32) {
    let mut ordered = Vec::with_capacity(nodes.len());
    let mut cur = outer;
    loop {
        nodes[cur].z = z_order([nodes[cur].x, nodes[cur].y], min, inv_size);
        ordered.push(cur);
        cur = nodes[cur].next;
        if cur == outer {
            break;
        }
    }
    ordered.sort_by_key(|&i| nodes[i].z);
    for i in 0..ordered.len() {
        nodes[ordered[i]].next = ordered[(i + 1) % ordered.len()]; 
        nodes[ordered[i]].prev = ordered[(ordered.len() + i - 1) % ordered.len()]; 
    }
}

fn z_order(pos: [f32; 2], min: [f32; 2], inv_size: f32) -> u32 {
    let mut x = (32767.0 * (pos[0] - min[0]) * inv_size) as u32;
    let mut y = (32767.0 * (pos[1] - min[1]) * inv_size) as u32;
    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;
    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;
    return x | (y << 1);
}

fn is_ear_z_index(nodes: &[Node], node: usize, min: [f32; 2], inv_size: f32) -> bool {
    let prev = nodes[node].prev;
    let next = nodes[node].next;
    let a = &nodes[prev];
    let b = &nodes[node];
    let c = &nodes[next];
    if tri_area(a, b, c) >= 0.0 {
        return false;
    }
    let min_t = [a.x.min(b.x).min(c.x), a.y.min(b.y).min(c.y)];
    let max_t = [a.x.max(b.x).max(c.x), a.y.max(b.y).max(c.y)];
    let min_z = z_order(min_t, min, inv_size);
    let max_z = z_order(max_t, min, inv_size);
    let mut p = nodes[node].zprev;
    let mut n = nodes[node].znext;
    while p != n && (nodes[p].z >= min_z || nodes[n].z <= max_z) {
        if nodes[p].z >= min_z {
            if p != prev && p != next && point_in_triangle(a, b, c, &nodes[p]) {
                let pprev = nodes[p].prev;
                let pnext = nodes[p].next;
                if tri_area(&nodes[pprev], &nodes[p], &nodes[pnext]) >= 0.0 {
                    return false;
                }
            }
            p = nodes[p].zprev;
        }
        if p != n && nodes[n].z <= max_z {
            if n != prev && n != next && point_in_triangle(a, b, c, &nodes[n]) {
                let nprev = nodes[n].prev;
                let nnext = nodes[n].next;
                if tri_area(&nodes[nprev], &nodes[n], &nodes[nnext]) >= 0.0 {
                    return false;
                }
            }
            n = nodes[n].znext;
        }
    }
    return true;
}

