# Multilateration Visualizer
An Electron TypeScript React app with extra horsepower from Rust server that provides a protobuf gRPC API and handles the serial communication with the tags.

# Multilateration Visualizer
![Multilateration Visualizer](/doc/multilateration.png)

# Principal
Multilateration assumes that we already know the positions of the anchors, and we get distances of the various tags from some of the anchors. Not all tags necessarily manage to find all (or any) anchors at all times.

We don't necessarily trust distance measurements from hardware device, so the first step isn't to calculate a specific point estimate to where the tag is located.

Instead, we want to calculate a probability cloud, and display that.

That allows us to expose the inaccuracy of the hardware devices used.

# Algorithm
1. Decide on the maximum world size that this visualization supports
2. Divide the world into voxels
3. For each tag, go through all voxels and mark them with a transparency value to create a cloud of probabilities of the location for that tag.
4. For each voxel, use pythagorian theorem to calculate distances from every relevant anchor.
5. Compare the distances of the voxel from the anchors to the observed distances of the tag from the anchors. Say: the tag gave the distance to 4 anchors- we now have an array of 4 distance differences.
6. Calculate a score for each voxel based on the distance differences. A smaller total difference indicates a higher probability that the tag is located in that voxel. You can use a scoring function that assigns higher scores to smaller differences, such as the inverse of the sum of squared differences or a Gaussian function. Inverse of the sum of squared differences is:
```text
1 / [(x₁ - y₁)² + (x₂ - y₂)² + ... + (xₙ - yₙ)²]
```
we'll take that number (power 2) and put it into a variable P (default P=2) that can be adjusted with a slider.

Giving P a smaller value (such as 0.5) will cause large differences to have little effect.

Giving P a larger value (such as 2) will cause large differences to have greater effect than small differences.

7. Normalize the scores such that the sum of scores for a single tag equals 1.0
8. Give an allowance of brightness L of a specific color to each tag. Disperse the brightness to the voxels based on their relative scores (multiply by the scores).

Therefore, this algorithm has 2 adjustable variables:
1. P for power in the "Inverse of the sum of squared differences" formula.
2. L for the brightness allowance for each tag.
