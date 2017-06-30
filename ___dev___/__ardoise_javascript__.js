let res

res = "Marion, Phil"

res = res.split(/[ ,]/).map(p => p.trim()).filter(p => p != '')


console.log(res)
