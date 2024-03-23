use crate::grpc_api::Voxel;

pub const VOXELS_TO_REPORT_PER_ANCHOR: usize = 512;

pub fn filter_voxels(voxels: Vec<Voxel>) -> Vec<Voxel> {
    let mut sorted_voxels = voxels;
    sorted_voxels.sort_by(|a, b| b.opacity.partial_cmp(&a.opacity).unwrap());
    sorted_voxels.truncate(VOXELS_TO_REPORT_PER_ANCHOR);
    sorted_voxels
}
