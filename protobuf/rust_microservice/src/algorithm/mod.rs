use crate::grpc_api::Voxel;

// Struct for algorithm settings including world size, power, and brightness allowance.
pub struct AlgorithmArgs {
    pub world_size: i64, // The size of the world in each dimension (X, Y, Z)
    pub p: f64, // Power for the inverse of the sum of squared differences
    pub l: f64, // Brightness allowance for the tag
}

// Struct to represent the distance from a tag to an anchor and the anchor's position.
pub struct AnchorObservation {
    pub distance: f64,
    pub position: (i64, i64, i64),
}

// Struct for a voxel's position and its calculated score.
pub struct ScoredVoxel {
    x: i64,
    y: i64,
    z: i64,
    score: f64,
}

// Calculate the sum of squared differences between observed and calculated distances.
fn sum_of_squared_differences(observation: &AnchorObservation, x: i64, y: i64, z: i64) -> f64 {
    let (ax, ay, az) = observation.position;
    let calculated_distance = (((x - ax).pow(2) + (y - ay).pow(2) + (z - az).pow(2)) as f64).sqrt();
    (observation.distance - calculated_distance).powi(2)
}

// TODO: Make this implementation faster so it goes closer to 30 FPS instead of
// the current frame every 3 or 4 seconds (with a world size of 128x128x128)

// Function to calculate the voxel representations for a tag based on anchor observations.
pub fn position_estimate_cloud(observations: Vec<AnchorObservation>, args: AlgorithmArgs) -> Vec<Voxel> {
    let mut scored_voxels: Vec<ScoredVoxel> = Vec::new();
    // The (0, 0, 0) voxel has a point that is centered at (-0.5, -0.5, -0.5),
    // by convention agreement with the React code.
    let voxel_range = (-(args.world_size / 2) + 1)..(args.world_size / 2 + 1);

    let iterations_per_dimension = voxel_range.end - voxel_range.start;
    const NUM_DIMENSIONS: u32 = 3;
    let num_voxels = iterations_per_dimension.pow(NUM_DIMENSIONS);
    scored_voxels.reserve(num_voxels as usize);

    // Iterate over each voxel in the world, computing scores based on distance observations.
    for x in voxel_range.clone() {
        for y in voxel_range.clone() {
            for z in voxel_range.clone() {
                let sum_of_squared_diff = observations.iter()
                    .map(|obs| sum_of_squared_differences(obs, x, y, z))
                    .sum::<f64>();

                let score = if sum_of_squared_diff == 0.0 {
                    f64::MAX
                } else {
                    1.0 / sum_of_squared_diff.powf(args.p)
                };

                scored_voxels.push(ScoredVoxel { x, y, z, score });
            }
        }
    }

    // Normalize scores to ensure they sum to 1.0 for the tag.
    let total_score: f64 = scored_voxels.iter().map(|v| v.score).sum();
    for voxel in &mut scored_voxels {
        voxel.score /= total_score;
    }

    // Convert scored voxels into Voxel instances, applying color and opacity based on score.
    scored_voxels.into_iter().map(|sv| Voxel {
        color: String::new(), // Caller will need to fill this in
        opacity: (sv.score * args.l).min(1.0).max(0.0) as f32, // Ensure opacity is within [0, 1].
        x: sv.x,
        y: sv.y,
        z: sv.z,
    }).collect()
}
