// Media loader for Daydreams blog photos/videos.
const mediaModules = import.meta.glob(
  "./daydreamPhotos/*.(png|jpg|jpeg|JPG|JPEG|gif|svg|webp|mp4|webm|mov)",
  { eager: true }
);

export const getDaydreamMedia = (filename) => {
  if (!filename) return null;
  const match = Object.entries(mediaModules).find(([path]) =>
    path.endsWith(`/${filename}`)
  );
  return match ? match[1].default : null;
};

const daydreams = [
  {
    "id": "hello-clouds",
    "title": "Hello From the Clouds",
    "date": "Jul 2026",
    "tags": [
      "Meta",
      "Beginnings"
    ],
    "excerpt": "A little corner of the internet to keep my thoughts, half-baked ideas, and the occasional beep boop. Here's why I finally made one.",
    "body": [
      {
        "type": "text",
        "value": "Placeholder text. This is the very first daydream — a soft landing spot for the ideas that don't quite fit into a project card or a resume bullet."
      },
      {
        "type": "text",
        "value": "Placeholder text. Expect notes on robots, circuits, sketches, and whatever I happen to be curious about that week."
      },
      {
        "type": "text",
        "value": "Placeholder text. Thanks for floating by. Make yourself at home."
      }
    ]
  }
];

export default daydreams;
