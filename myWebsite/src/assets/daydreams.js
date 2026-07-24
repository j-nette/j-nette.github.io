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
  },
  {
    "id": "tiny-but-mighty",
    "title": "On Building Tiny but Mighty Things",
    "date": "Jun 2026",
    "tags": [
      "Robotics",
      "Reflections"
    ],
    "excerpt": "There's a special kind of joy in making something small do something big. A few thoughts on the little machines I keep coming back to.",
    "body": [
      {
        "type": "text",
        "value": "Placeholder text. Some reflections on why the smallest projects often teach the biggest lessons."
      },
      {
        "type": "text",
        "value": "Placeholder text. A story about a stubborn motor driver and the afternoon it finally spun the right way."
      },
      {
        "type": "text",
        "value": "Placeholder text. More to come once I stop soldering long enough to write it down."
      }
    ]
  },
  {
    "id": "2am-solder",
    "title": "Things I Learned Soldering at 2AM",
    "date": "May 2026",
    "tags": [
      "Electronics",
      "Lessons"
    ],
    "excerpt": "A very unscientific list of lessons collected under a desk lamp, one slightly-too-hot iron at a time.",
    "body": [
      {
        "type": "text",
        "value": "Placeholder text. Lesson one: flux is your friend, and so is stepping away for five minutes."
      },
      {
        "type": "text",
        "value": "Placeholder text. Lesson two: label everything, past-you is not as clever as you remember."
      },
      {
        "type": "text",
        "value": "Placeholder text. Lesson three: the bug is almost always the thing you were sure it wasn't."
      }
    ]
  }
];

export default daydreams;
