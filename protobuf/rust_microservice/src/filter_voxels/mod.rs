use crate::grpc_api::Voxel;

pub const VOXELS_TO_REPORT_PER_ANCHOR: usize = 512;

pub fn filter_voxels(mut voxels: Vec<Voxel>) -> Vec<Voxel> {
    // Ensure there's more than VOXELS_TO_REPORT_PER_ANCHOR elements
    if voxels.len() > VOXELS_TO_REPORT_PER_ANCHOR {
        // Find the VOXELS_TO_REPORT_PER_ANCHOR-th largest element and rearrange the voxels
        // such that all elements before it are greater based on opacity
        let nth = VOXELS_TO_REPORT_PER_ANCHOR - 1;
        voxels.select_nth_unstable_by(nth, |a, b| b.opacity.partial_cmp(&a.opacity).unwrap());
        
        // Now only sort the top VOXELS_TO_REPORT_PER_ANCHOR elements
        voxels[..VOXELS_TO_REPORT_PER_ANCHOR].sort_by(|a, b| b.opacity.partial_cmp(&a.opacity).unwrap());
    }

    // Truncate the vector to only include the top VOXELS_TO_REPORT_PER_ANCHOR elements
    voxels.truncate(VOXELS_TO_REPORT_PER_ANCHOR);
    voxels
}
