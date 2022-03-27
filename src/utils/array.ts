export default function array(m, n) {
  const arr = new Array(m);
  for (let i = 0; i < m; i++) {
    arr[i] = new Array(n).fill(0);
  }
  return arr;
}
