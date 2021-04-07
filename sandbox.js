
let A = [];
A.push('...items', '1',23, {value:'qwe', name:"Ro"})
console.log(A.length, A);
console.log({A});

let D = {};
D.a = 'a'
D.b = 1

delete D.a

console.log({D})
console.log(D.a)

line = {}
line.area = 'area'
line.row = 'row'

line.columns = {}

line.columns.id1 = 'val1'

console.log(line)

console.log(require.main === module);

