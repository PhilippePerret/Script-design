let res

let arr = [1,2,3]

arr2 = new Array(...arr)

arr[0] = 111

res = arr2

console.log(arr)
console.log(res)
