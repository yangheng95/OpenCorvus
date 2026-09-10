const weightsGrams = [125, 250, 425]
const totalGrams = weightsGrams.reduce((total, weight) => total + weight, 0)

console.log(`${totalGrams} g`)
