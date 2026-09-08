const weightsGrams = [125, 250, 375]
const totalGrams = weightsGrams.reduce((total, weight) => total + weight, 0)

console.log(`${totalGrams} g`)
