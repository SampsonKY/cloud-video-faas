import array from './array';

const math = require('mathjs');

export default function matrixToArray(matrix) {
  const size = math.size(matrix); // m行 n列
  const m = size.subset(math.index(0));
  const n = size.subset(math.index(1));

  const arr = array(m, n);
  matrix.forEach((value, index) => {
    arr[index[0]][index[1]] = value;
  });
  return arr;
}
