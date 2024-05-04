# Multilateration Visualizer
This project is like indoor GPS.

An Electron TypeScript React app with extra horsepower from Rust server

The Rust CLI executable provides a protobuf gRPC API and handles the communication with the hardware devices, and calculates the position probability clouds.

![Multilateration Visualizer](/electron/assets/icon.png)

# Integrate Visuals and Algorithm
The algorithm chosen is specifically designed to integrate with the visualization while preserving a high throughput of the original data. This is the opposite of some algorithms which only give you a (X, Y, Z) position for each tag.

# Components
1. Electron App- [Electron App Documentation](electron/README.md)
2. Rust gRPC API- [Rust App Documentation](protobuf/rust_microservice/README.md)

# Demo
[https://youtu.be/c2tD1iSxk-I](https://youtu.be/sUaNntm6cG4)

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

# System Requirements
- x86_64 Windows 10 22H2 or x86_64 Windows 11 23H2

- 16 GB RAM

- No strict requirements for storage technology or capacity

- System support for WebGL. Dedicated graphics card recommended

- CPU with 6 CPU cores- 3 cores for Rust app, at least 2 cores for Electron app

- Recommended mouse with mouse wheel for stable zooming gestures in the GUI

# Release Notes
### 1.0.3
https://github.com/BigBIueWhale/multilateration_visualizer/tree/RLS_01_00_03_2024_03_30/release

- Disable auto-update: https://github.com/BigBIueWhale/multilateration_visualizer/issues/1#issue-2215586902. It makes no sense for this app to have an auto-update functionality!

### 1.0.2
https://github.com/BigBIueWhale/multilateration_visualizer/tree/RLS_01_00_02_2024_03_25/release

- Fix some graphics glitches in renderer, and improve graphics in general

- Add app logo

- Good default camera view (instead of being zoomed into the cube by default)

- Fix warning when reloading Electron app 9 times (event emitter leak)

### 1.0.1
https://github.com/BigBIueWhale/multilateration_visualizer/tree/RLS_01_00_01_2024_03_24/release

- Further optimizations (parallelism etc).

- Include in the release folder: the source code required to do performance profiling to the compiled Rust executable.

### 1.0.0
https://github.com/BigBIueWhale/multilateration_visualizer/tree/RLS_01_00_00_2024_03_24/release

- Front-end code contains 3d visualization of any voxels given by Rust server.

- All parameters are hard-coded.

- Rust algorithm code is not fully optimized yet, 2 frame per second at 128x128x128 world.

- Simulator only.
