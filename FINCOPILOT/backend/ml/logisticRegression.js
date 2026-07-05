/**
 * Minimal logistic regression trained with batch gradient descent.
 * No external ML dependency - small enough to read top to bottom,
 * which matters for a demo/teaching codebase like this one.
 */

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

class LogisticRegression {
  constructor({ learningRate = 0.1, epochs = 1500, l2 = 0.001 } = {}) {
    this.learningRate = learningRate;
    this.epochs = epochs;
    this.l2 = l2;
    this.weights = null;
    this.bias = 0;
    this.featureMeans = null;
    this.featureStdDevs = null;
  }

  _standardize(X) {
    const n = X.length;
    const d = X[0].length;
    if (!this.featureMeans) {
      this.featureMeans = new Array(d).fill(0);
      this.featureStdDevs = new Array(d).fill(1);
      for (let j = 0; j < d; j++) {
        let sum = 0;
        for (let i = 0; i < n; i++) sum += X[i][j];
        const mean = sum / n;
        let variance = 0;
        for (let i = 0; i < n; i++) variance += (X[i][j] - mean) ** 2;
        const std = Math.sqrt(variance / n) || 1;
        this.featureMeans[j] = mean;
        this.featureStdDevs[j] = std;
      }
    }
    return X.map((row) =>
      row.map((v, j) => (v - this.featureMeans[j]) / this.featureStdDevs[j])
    );
  }

  fit(XRaw, y) {
    const X = this._standardize(XRaw);
    const n = X.length;
    const d = X[0].length;
    this.weights = new Array(d).fill(0);
    this.bias = 0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      const gradW = new Array(d).fill(0);
      let gradB = 0;

      for (let i = 0; i < n; i++) {
        const z = X[i].reduce((s, v, j) => s + v * this.weights[j], this.bias);
        const pred = sigmoid(z);
        const error = pred - y[i];
        for (let j = 0; j < d; j++) gradW[j] += error * X[i][j];
        gradB += error;
      }

      for (let j = 0; j < d; j++) {
        const reg = this.l2 * this.weights[j];
        this.weights[j] -= this.learningRate * (gradW[j] / n + reg);
      }
      this.bias -= this.learningRate * (gradB / n);
    }
    return this;
  }

  predictProba(xRaw) {
    const x = xRaw.map(
      (v, j) => (v - this.featureMeans[j]) / this.featureStdDevs[j]
    );
    const z = x.reduce((s, v, j) => s + v * this.weights[j], this.bias);
    return sigmoid(z);
  }

  /** Per-feature contribution to the logit, useful for explainability. */
  featureContributions(xRaw) {
    const x = xRaw.map(
      (v, j) => (v - this.featureMeans[j]) / this.featureStdDevs[j]
    );
    return x.map((v, j) => v * this.weights[j]);
  }
}

module.exports = { LogisticRegression, sigmoid };
