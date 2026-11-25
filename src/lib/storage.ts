import { supabase } from "./supabase";

/**
 * Sube una imagen a Supabase Storage (bucket techoyhecho-media) si el usuario
 * está autenticado en modo real. En modo Demo devuelve DataURL local para previsualización inmediata.
 */
export async function subirImagenSeguro(
  file: File,
  carpeta: "viviendas" | "averias" | "fianza",
  esDemo: boolean
): Promise<string> {
  if (!esDemo && supabase) {
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filePath = `${carpeta}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("techoyhecho-media")
        .upload(filePath, file, { upsert: false });

      if (!error) {
        const { data } = supabase.storage
          .from("techoyhecho-media")
          .getPublicUrl(filePath);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch {
      // Fallback seguro a DataURL si falla la red
    }
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}
