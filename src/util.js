
export function map(value, min_in, max_in, min_out, max_out) {
    if(min_in === max_in) {
        return max_out;
    } else if(value < min_in) {
        return min_out;
    } else if(value > max_in) {
        return max_out;
    } else {
        return (value - min_in) / (max_in - min_in) * (max_out - min_out) + min_out;
    }
}
