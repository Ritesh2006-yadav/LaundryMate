import { supabase, isSupabaseConfigured } from "./client";

/**
 * Upload image evidence to Supabase Storage bucket 'complaint-evidence'
 * Falls back to local Data URL if offline or Supabase bucket is pending.
 */
export async function uploadComplaintEvidence(file) {
  if (!file) return null;

  try {
    if (isSupabaseConfigured()) {
      const fileExt = file.name ? file.name.split(".").pop() : "jpg";
      const fileName = `evidence_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `student-uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from("complaint-evidence")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from("complaint-evidence")
          .getPublicUrl(filePath);

        if (publicData?.publicUrl) {
          return publicData.publicUrl;
        }
      }
    }
  } catch (err) {
    console.warn("Supabase storage upload failed or unconfigured, using local dataURL fallback", err);
  }

  // Robust Client-side base64 fallback
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = () => {
      resolve("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&q=80");
    };
    reader.readAsDataURL(file);
  });
}

