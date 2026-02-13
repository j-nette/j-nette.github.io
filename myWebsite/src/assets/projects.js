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
    description1: "UBC Thunderbots is an engineering student design team at the University of British Columbia that designs autonomous soccer playing robots. Over the years, we've placed 1st in 2019 and 2021 as well as 2nd in 2024 in the Small Sized League of the international RoboCup competition! As part of the Electrical Subteam, I've worked on our power board, motor driver board, and tools to help test robot movement.",
    description2: "In 2025, we initiated a complete redesign of our electrical stack, a critical component being the motor driver. The previous generation relied on a single board to drive 5 motors, which ended up being difficult to debug, expensive to replace, and often acted as a single point of failure for our entire robot. As such, we opted for a new modular design, where each mini-motor driver board consists of 3 half bridges that generate the 3-phase drive signals needed to precisely drive our motors. We also refined our power stage design and selected better MOSFETs to minimize switching losses, thermal buildup, and parasitic inductance.",
    tags: ["Circuit Design", "Python"],
    technologies: ["Altium","Oscilloscope", "Power Electronics"],
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
    subtitle: "Physical & simulated model cargo train that navigates through tough terrains",
    description1: "Like in true engineering nature, I had to design a product without knowing all the constraints. The track layout wouldn't be released until competition day, and we had to design a train that was fast, strong, and adaptable enough to handle whatever geometry it would face.",
    description2: "To guide our design decisions, I built a Python simulation tool that evaluated different train geometries and track assumptions, and outputted various predicted performance metrics. The physics model is a combination of ideal equations that were then refined using experiment weights, allowing us to predict performance within ~9% of actual behaviour. The train tself consisted of simple electronics to power the motor, which was connected to a custom 2 speed gearbox, as well as a 3D printed chassis and machined bogie.",
    tags: ["CAD", "Python"],
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
    subtitle: "Non-invasive early melanoma detector (nwHacks 2026 winner)",
    description1: "MelaNone is a limb-scanning system designed to help detect melanoma early on. A patient places their arm or leg into the scan chamber, where cameras capture photos of the limb from multiple angles. Segments of the captured images are streamed to an AI melanoma model classifies skin spots as likely benign or potentially concerning. These images are then stitched together to form a 3D mesh of the limb, then the results are summarized and displayed on our website.",
    description2:"This project started with a bit of a rescue mission. I found an old, scrapped 3D printer and wondered if I could help it become something entirely new. After salvaging the working parts, we pieced together our 3D printed chassis and control board to make our scanning chamber. An ESP32 microcontroller sends pulses to the stepper driver to spin the motor, and communicates with our server-side code via Serial. The website is built using React and Flask then packaged with Vite. The backend is mainly coded in Python.The detection system leverages OpenCV for mesh generation and image detection. Subsections of images are passed to a melanoma detection model trained with PyTorch.",
    tags: ["Computer Vision", "AI", "Web Dev", "Python", "CAD"],
    technologies: ["Solidworks",  "PyTorch", "OpenCV", "React", "Flask", "C", "Rapid Prototyping"],
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
    title: "Bionic Hand",
    subtitle: "Computer vision controlled hand",
    description1: "As a budding artist, I've always struggled with drawing hands. Instead of buying one of those IKEA hand models, I decided to make my own (and really overcomplicate it)! This is a 3D printed, servo-actuated bionic hand that mirrors movements captured through computer vision.",
    description2: "Mechanically, each finger has an elastic that acts like a tendon to keep it straight. Servos then tug on the tension line to bend the finger into the desired position. On the software side, OpenCV and MediaPipe tracks hand landmarks which are then processed and sent to the Arduino via Serial.",
    tags: ["Computer Vision", "Electronics"],
    technologies: ["Python", "OpenCV", "MediaPipe"],
    images: [
      "hand.png",
      "handcv.png"
    ].map(getImagePath).filter(Boolean)
  },
    {
    id: "project-5",
    title: "Mini Fridge",
    subtitle: "Your coolest best friend BMO!",
    description1: "This was one of my very first engineering projects and holds a special place in my heart. I may have taken DIY a little too literally and made almost everything in house - yes, including the PCB!",
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
];


export default projects;