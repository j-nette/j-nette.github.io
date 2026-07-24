import { getMediaPath } from "../assets/projects";

// eslint-disable-next-line react-refresh/only-export-components
export const isVideoFile = (filename) => /\.(mp4|webm|mov)$/i.test(filename || "");

// Renders a single media item (image or video) resolved from a filename.
export function Media({ filename, resolver = getMediaPath, alt = "", className, controls = false }) {
  const src = resolver(filename);
  if (!src) return null;

  if (isVideoFile(filename)) {
    return (
      <video
        src={src}
        className={className}
        muted
        playsInline
        loop
        preload="metadata"
        controls={controls}
      />
    );
  }

  return <img src={src} alt={alt} className={className} />;
}

export default Media;
