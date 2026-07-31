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
    "tags": [],
    "excerpt": "First post & live website!",
    "body": [
      {
        "type": "text",
        "value": "Hello, and welcome to my corner of the internet!\n\nI just completed my PEY term, which is a year of internships. On the side, I've been working on some personal projects - one of which being my long overdue personal website! I'm excited to finally launch this site (though it definitely is anything but perfect). \n\n"
      },
      {
        "type": "image",
        "filename": "marmot.jpg"
      }
    ]
  }
];

export default daydreams;
