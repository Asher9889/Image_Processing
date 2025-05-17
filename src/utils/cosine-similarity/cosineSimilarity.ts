function cosineSimilarity(vecA: number[], vecB: number[]): number {


    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must be of same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        const a = vecA[i];
        const b = vecB[i];

        dotProduct += a * b;
        normA += a * a;
        normB += b * b;
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0; // Handle zero-vector case safely

    return dotProduct / denominator;
}

export default cosineSimilarity;


