use rand::{prelude::*, SeedableRng};
use rand_chacha::ChaCha8Rng;
use crate::algorithm::{AlgorithmArgs, AnchorObservation, position_estimate_cloud};
use crate::filter_voxels::filter_voxels;
use crate::grpc_api::Voxel;

pub const WORLD_SIZE: i64 = 128;
pub const WORLD_RANGE: std::ops::Range<f64> = (-(WORLD_SIZE / 2)) as f64..(WORLD_SIZE / 2) as f64;
pub const P: f64 = 2.0;
pub const L: f64 = 12.0;
pub const TAGS: [&str; 3] = ["red", "green", "blue"];
pub const TAG_VELOCITY_FACTOR: f64 = WORLD_SIZE as f64 / 100.0;
pub const ANCHORS: [(i64, i64, i64); 4] = [
    (0, 0, 0),
    (WORLD_SIZE, 0, 0),
    (0, WORLD_SIZE, 0),
    (0, 0, WORLD_SIZE),
];
pub const MEASUREMENT_ERROR_MARGIN: f64 = WORLD_SIZE as f64 / 25.0;

pub struct TagState {
    position: (f64, f64, f64),
    velocity: (f64, f64, f64),
}

pub struct Simulation {
    rng: ChaCha8Rng,
    tag_states: Vec<TagState>,
}

impl Simulation {
    pub fn new() -> Self {
        let seed = [0u8; 32];
        let mut rng = ChaCha8Rng::from_seed(seed);
        let tag_states = TAGS.iter().map(|_| TagState {
            position: (
                rng.gen_range(WORLD_RANGE),
                rng.gen_range(WORLD_RANGE),
                rng.gen_range(WORLD_RANGE),
            ),
            velocity: (
                rng.gen_range(-1.0..1.0),
                rng.gen_range(-1.0..1.0),
                rng.gen_range(-1.0..1.0),
            ),
        }).collect();

        Simulation { rng, tag_states }
    }

    pub fn update(&mut self) {
        for tag_state in &mut self.tag_states {
            tag_state.position.0 += tag_state.velocity.0 * TAG_VELOCITY_FACTOR;
            tag_state.position.1 += tag_state.velocity.1 * TAG_VELOCITY_FACTOR;
            tag_state.position.2 += tag_state.velocity.2 * TAG_VELOCITY_FACTOR;

            if tag_state.position.0 < WORLD_RANGE.start || tag_state.position.0 > WORLD_RANGE.end {
                tag_state.velocity.0 *= -1.0;
            }
            if tag_state.position.1 < WORLD_RANGE.start || tag_state.position.1 > WORLD_RANGE.end as f64 {
                tag_state.velocity.1 *= -1.0;
            }
            if tag_state.position.2 < WORLD_RANGE.start || tag_state.position.2 > WORLD_RANGE.end as f64 {
                tag_state.velocity.2 *= -1.0;
            }
        }
    }

    pub async fn get_frame(&mut self) -> Vec<Voxel> {
        let mut frame = Vec::new();

        for (i, tag_state) in self.tag_states.iter().enumerate() {
            let mut observations = Vec::new();

            for &anchor_pos in &ANCHORS {
                let dx = tag_state.position.0 - anchor_pos.0 as f64;
                let dy = tag_state.position.1 - anchor_pos.1 as f64;
                let dz = tag_state.position.2 - anchor_pos.2 as f64;
                let exact_distance = (dx * dx + dy * dy + dz * dz).sqrt();
                let distance_with_error = exact_distance + self.rng.gen_range(-MEASUREMENT_ERROR_MARGIN..MEASUREMENT_ERROR_MARGIN);

                observations.push(AnchorObservation {
                    distance: distance_with_error,
                    position: anchor_pos,
                    color: TAGS[i].to_string(),
                });
            }

            let args = AlgorithmArgs {
                world_size: WORLD_SIZE,
                p: P,
                l: L,
                tag_id: TAGS[i].to_string(),
            };

            let voxels = position_estimate_cloud(observations, args).await;
            let filtered_voxels = filter_voxels(voxels);
            frame.extend(filtered_voxels);
        }

        frame
    }
}
