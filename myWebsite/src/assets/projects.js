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
    description1: "UBC Thunderbots is an engineering student design team at the University of British Columbia that designs tiny but mighty autonomous soccer playing robots. We compete in the Small Sized League of the international RoboCup competition and over the years, we've placed 1st in 2019 and 2021 as well as 2nd in 2024.",
    description2: "In 2025, we initiated a complete dedesign of the motor driver board to address limitations of the previous generation, which was bulky, difficult to debug, and costly to replace as a single large module. Instead of having one complex board to drive 5 motors, we opted for a compact modular design, being a board that attatches to each motor. This new design emphasized efficient MOSGET selection and gate driving for reduced switiching losses and improved thermal management, as well as current sensing to prevent wrong use.",
    tags: ["Electrical","Software", "Circuit Design"],
    technologies: ["Altium","Oscilloscope"],
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
    subtitle: "Model train that can pull heavy loads while navigating tough terrains.",
    description1: "Model trains are cool but they often lack the power and functionality of real locomotives. To make a true model train, my classmates and I developped a vehicle capable of hauling heavy cargo loads whilst also navigating a variety of track topographies.",
    description2: "Model trains are cool but they often lack the power and functionality of real locomotives. To make a true model train, my classmates and I developped a vehicle capable of hauling heavy cargo loads whilst also navigating a variety of track topographies.",
    tags: ["Mechanical", "Software", "Electrical"],
    technologies: ["Python", "Solidworks"],
    links: {
      github: "#https://github.com/j-nette/Rail-Speeder",
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
    subtitle: "Non-invasive early melanoma detector.",
    description1: "Non-invasive early melanoma detector.",
    tags: ["Electrical", "Circuit Design"],
    technologies: ["UART", "CV", "Python", "PyTorch", "OpenCV"],
    links: {
      github: "#",
    }
  },
];


export default projects;