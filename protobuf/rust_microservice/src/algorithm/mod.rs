pub mod grpc_api {
    tonic::include_proto!("workhorse"); // The string specified here must match the proto package name
}

use grpc_api::Voxel;

// Struct for algorithm settings including world size, power, and brightness allowance.
pub struct AlgorithmArgs {
    world_size: i64, // The size of the world in each dimension (X, Y, Z)
    p: f64, // Power for the inverse of the sum of squared differences
    l: f64, // Brightness allowance for the tag
    tag_id: String, // Unique identifier for the tag
}

// Struct to represent the distance from a tag to an anchor and the anchor's position.
pub struct AnchorObservation {
    distance: f64,
    position: (i64, i64, i64),
    color: String, // Color associated with the tag
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

// Function to calculate the voxel representations for a tag based on anchor observations.
pub fn calculate_voxel_representation(observations: Vec<AnchorObservation>, args: AlgorithmArgs) -> Vec<Voxel> {
    let mut scored_voxels: Vec<ScoredVoxel> = Vec::new();

    // Iterate over each voxel in the world, computing scores based on distance observations.
    for x in 0..args.world_size {
        for y in 0..args.world_size {
            for z in 0..args.world_size {
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
        color: observations.first().unwrap().color.clone(), // Use the color from the first observation.
        opacity: (sv.score * args.l).min(1.0).max(0.0) as f32, // Ensure opacity is within [0, 1].
        x: sv.x,
        y: sv.y,
        z: sv.z,
    }).collect()
}
