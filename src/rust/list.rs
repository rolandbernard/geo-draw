
pub struct CircularList {
    next: Vec<usize>,
    prev: Vec<usize>,
    first: usize,
    free: usize,
}

impl CircularList {
    pub fn new(from: usize, to: usize) -> CircularList {
        let mut list = CircularList {
            next: (from + 1..to + 1).collect(),
            prev: (from - 1..to - 1).collect(),
            first: 0, free: to - from,
        };
        return list;
    }

    pub fn reverse(&mut self) {
        (self.next, self.prev) = (self.prev, self.next);
    }

    pub fn last(&self) -> usize {
        self.prev[self.first]
    }

    pub fn insert(&mut self) -> usize {
        let id = self.free;
        if self.free < self.next.len() {
            self.free = self.next[self.free];
        }
        if id == 0 {
            self.next.push(0);
            self.prev.push(0);
            self.first = 0;
        } else {
            self.next.push(self.first);
            self.prev.push(self.last());
            self.next[self.last()] = id;
            self.prev[self.first] = id;
        }
        return id;
    }

    pub fn remove(&mut self, id: usize) {
        self.prev[self.next[id]] = self.prev[id];
        self.next[self.prev[id]] = self.next[id];
        if self.first == id {
            self.first = self.next[id];
        }
        self.next[id] = self.free;
        self.free = id;
    }

    pub fn next(&self, id: usize) -> usize {
        self.next[id]
    }

    pub fn prev(&self, id: usize) -> usize {
        self.prev[id]
    }
}

