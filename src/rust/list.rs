
pub struct CircularList<T> {
    data: Vec<T>,
    next: Vec<usize>,
    prev: Vec<usize>,
    first: usize,
    count: usize,
    free: usize,
}

impl<T> CircularList<T> {
    pub fn new() -> CircularList<T> {
        CircularList {
            data: Vec::new(), next: Vec::new(), prev: Vec::new(),
            first: 0, count: 0, free: 0,
        }
    }

    pub fn reverse(&mut self) {
        std::mem::swap(&mut self.next, &mut self.prev);
    }

    pub fn rotate(&mut self, off: isize) {
        if self.count > 0 {
            for _ in 0..off.abs() {
                if off >= 0 {
                    self.first = self.next[self.first];
                } else {
                    self.first = self.prev[self.first];
                }
            }
        }
    }

    fn get_index(&self, off: isize) -> usize {
        assert!(self.count > 0);
        let mut idx = self.first;
        for _ in 0..off.abs() {
            if off >= 0 {
                idx = self.next[idx];
            } else {
                idx = self.prev[idx];
            }
        }
        idx
    }

    pub fn get(&self, off: isize) -> &T {
        let idx = self.get_index(off);
        &self.data[idx]
    }

    pub fn get_mut(&mut self, off: isize) -> &mut T {
        let idx = self.get_index(off);
        &mut self.data[idx]
    }

    pub fn insert(&mut self, val: T) {
        let id = self.free;
        if id == self.data.len() {
            self.data.push(val);
            self.next.push(0);
            self.prev.push(0);
            self.free = self.data.len();
        } else {
            self.free = self.next[self.free];
        }
        if self.count == 0 {
            self.next[id] = id;
            self.prev[id] = id;
        } else {
            self.next[id] = self.next[self.first];
            self.prev[id] = self.first;
            self.prev[self.next[self.first]] = id;
            self.next[self.first] = id;
        }
        self.first = id;
        self.count += 1;
    }

    pub fn remove(&mut self) {
        assert!(self.count > 0);
        let id = self.first;
        self.prev[self.next[id]] = self.prev[id];
        self.next[self.prev[id]] = self.next[id];
        self.first = self.next[id];
        self.next[id] = self.free;
        self.free = id;
        self.count -= 1;
    }

    pub fn len(&self) -> usize {
        self.count
    }

    pub fn get_view<'a>(&'a self) -> CircularListView<'a, T> {
        CircularListView { list: self, at: self.first }
    }
}

impl<'a, T> IntoIterator for &'a CircularList<T> {
    type Item = &'a T;
    type IntoIter = CircularListIterator<'a, T>;

    fn into_iter(self) -> Self::IntoIter {
        CircularListIterator { list: self, at: self.first, seen: 0 }
    }
}

pub struct CircularListIterator<'a, T> {
    list: &'a CircularList<T>,
    at: usize,
    seen: usize,
}

impl<'a, T> Iterator for CircularListIterator<'a, T> {
    type Item = &'a T;

    fn next(&mut self) -> Option<Self::Item> {
        if self.seen == self.list.len() {
            None
        } else {
            self.seen += 1;
            let res = &self.list.data[self.at];
            self.at = self.list.next[self.at];
            Some(res)
        }
    }
}

pub struct CircularListView<'a, T> {
    list: &'a CircularList<T>,
    at: usize,
}

impl<'a, T> CircularListView<'a, T> {
    pub fn rotate(&mut self, off: isize) {
        if self.list.count > 0 {
            for _ in 0..off.abs() {
                if off >= 0 {
                    self.at = self.list.next[self.at];
                } else {
                    self.at = self.list.prev[self.at];
                }
            }
        }
    }

    fn get_index(&self, off: isize) -> usize {
        assert!(self.list.count > 0);
        let mut idx = self.at;
        for _ in 0..off.abs() {
            if off >= 0 {
                idx = self.list.next[idx];
            } else {
                idx = self.list.prev[idx];
            }
        }
        idx
    }

    pub fn get(&self, off: isize) -> &T {
        let idx = self.get_index(off);
        &self.list.data[idx]
    }

    pub fn len(&self) -> usize {
        self.list.count
    }
}

