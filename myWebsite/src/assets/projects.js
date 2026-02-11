const imageModules = import.meta.glob('./projectPhotos/*.(png|jpg|jpeg|JPG|PNG|JPEG)', { eager: true });

const getImagePath = (filename) => {
  const key = `./projectPhotos/${filename}`;
  return imageModules[key]?.default || null;
};

const projects = [
  {
    id: "project-1",
    title: "Thunderbots",
    subtitle: "A fleet of tiny but mighty autonomous soccer playing robots",
    description1: "UBC Thunderbots is an engineering student design team at the University of British Columbia that designs tiny but mighty autonomous soccer playing robots. We compete in the Small Sized League of the international RoboCup competition, and over the years, we've placed 1st in 2019 and 2021 as well as 2nd in 2024. As part of the Electrical Subteam, I've worked on our Power Board, Motor Driver Board, and tools to help test robot movement.",
    description2: "In 2025, we initiated a complete redesign of the motor driver board to address limitations of the previous generation, which was bulky, difficult to debug, and costly to replace as a single large module. Instead of having one complex board to drive 5 motors, we opted for a compact modular design, that being a board that attatches to each motor. This new design emphasized efficient MOSFET selection and gate driving for reduced switiching losses and improved thermal management, as well as current sensing to prevent wrong use.",
    tags: ["Circuit Design", "Python"],
    technologies: ["Altium","Oscilloscope", "Circuit Design", "Power Electronics"],
    links: {
      github: "https://github.com/UBC-Thunderbots",
      linkother: "https://www.ubcthunderbots.ca/"
    },
    images: [
      "tbots.JPG",
      "mdpcb.png",
      "motordriver.jpg"
    ].map(getImagePath).filter(Boolean)
  },
  {
    id: "project-2",
    title: "Rail Speeder",
    subtitle: "Physical & simulated model cargo train that navigates through tough terrains.",
    description1: "I optimized and materialized a model train design based on how much load it could carry and how fast it completed the course through simulation. The challenge was that the actual course layout wouldn't be revealed until competition day, so we had to design a train without knowing the exact constraints.",
    description2: "I developed a Python app to test different train and track configurations to guide our design work. The calculations are based off ideal equations that have been slightly tweaked with lab-found weights, to get a predicted performance of within 9% of real life behaviour. We 3D modelled the train chassis and wheels, and machined a simple bogie to help it get over curves. We used off the shelf gears in our gearbox.",
    tags: ["Rapid Prototyping", "CAD", "Python"],
    technologies: ["Solidworks", "PyQT", "Tolerance Analysis", "Rapid Prototyping"],
    links: {
      github: "https://github.com/j-nette/Rail-Speeder",
    },
    images: [
      "trainramp.png",
      "traingear.png",
      "traincover.png",
      "trainsim.png",
      "traincargo.png"
    ].map(getImagePath).filter(Boolean)
  },
  {
    id: "project-3",
    title: "MelaNone",
    subtitle: "Non-invasive early melanoma detector. nwHacks 2026 winner.",
    description1: "MelaNone is a limb-scanning system designed to help detect melanoma early on. A patient places their arm or leg into the scan chamber, where cameras capture photos of the limb from multiple angles. Segments of the captured images are streamed to an AI melanoma model classifies skin spots as likely benign or potentially concerning. These images are then stitched together to form a 3D mesh of the limb, then the results are summarized and displayed on our website.",
    description2:"This project started with a bit of a rescue mission. I found an old, scrapped 3D printer and wondered if I could help it become something entirely new. After salvaging the working parts, we pieced together our 3D printed chassis and control board to make our scanning chamber. An ESP32 microcontroller sends pulses to the stepper driver to spin the motor, and communicates with our server-side code via Serial. The website is built using React and Flask then packaged with Vite. The backend is mainly coded in Python.The detection system leverages OpenCV for mesh generation and image detection. Subsections of images are passed to a melanoma detection model trained with PyTorch.",
    tags: ["Computer Vision", "AI", "Web Dev", "Python"],
    technologies: ["Solidworks",  "PyTorch", "OpenCV", "React", "Flask"],
    links: {
      github: "https://github.com/jasonkwok475/MelaNone",
      linkother: "https://devpost.com/software/melanone"
    },
    images: [
      "melanonescanner.jpg"
    ].map(getImagePath).filter(Boolean)
  },
  {
    id: "project-4",
    title: "Ceramics",
    subtitle: "Mugs to make my community a little more cozy hehe",
    description1: "I primarily hand sculp my creations.",
    tags: ["Hobbies"],
    technologies: ["Ceramics", "Pottery"],
    images: [
      "bearjar.jpg",
      "bugcatmug.jpg",
      "pumpkin.jpg"
    ].map(getImagePath).filter(Boolean)
  },
    {
    id: "project-5",
    title: "Bionic Hand",
    subtitle: "Computer vision controlled hand",
    description1: "As a budding artist, I've always struggled with drawing hands. Instead of buying one of those IKEA hand models, I decided to make my own (and really overcomplicate it)! This is a 3D printed hand where servos help position fingers, based on the position the computer vision captures.",
    description2: "Mechanically, each finger has an elastic that defaults it to an upright position. Servos then tug on the tension line to bend the finger into the right positions. I used OpenCV and MediaPipe to capture the landmarks of the hand, which are then passed via Serial to the Arduino controlling the electronics. ",
    tags: ["Computer Vision", "Electronics"],
    technologies: ["Python", "OpenCV", "MediaPipe"],
    images: [
      "hand.png",
      "handcv.png"
    ].map(getImagePath).filter(Boolean)
  },
    {
    id: "project-6",
    title: "Mini Fridge",
    subtitle: "BMO's your best friend and your best cooler",
    description1: "This was one of my very first engineering projects and holds a special place in my heart. With true engineering spirit, I also took a very DIY approach and decided to even hand-etch the PCB myself!",
    description2: "The enclosure was designed on AutoCAD, then laser cut out of MDF material and insulated with foam. The cooling system consists of 2 fans, 2 heatsinks, and a Peltier disk, where the cold air pushed into the fridge keeps it nice and cold. The Arduino monitors the internal temperature via a TMP36 sensor, then power on/off the cooling system. To etch my PCB, I toner transfered the silkscreen onto a copper-plated fiberglass board, then etched it in a solution of peroxide and acid.",
    tags: ["Circuit Design", "Computer Vision", "Electronics"],
    technologies: ["Python", "OpenCV", "MediaPipe", "Fritzing", "Painting"],
    images: [
      "bmofridge.png",
      "bmolaser.png",
      "bmocircuit.png",
      "bmocool.png"
    ].map(getImagePath).filter(Boolean)
  },
    {
    id: "project-7",
    title: "Drawing",
    subtitle: "Graphite sketches, Watercolour, Acrylic",
    description1: "A collection of some of my favourite pieces!",
    tags: ["Hobbies"],
    technologies: ["Sketching", "Painting", "Watercolour"],
    images: [
    ].map(getImagePath).filter(Boolean)
  },
  
];


export default projects;