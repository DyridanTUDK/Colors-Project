// global selections and variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const slider = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustBtn = document.querySelectorAll(".adjust");
const lockBtn = document.querySelectorAll(".lock");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;

// Local Storage
// array of objects
let savedPalettes = [];

// Add our event listener
slider.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});
currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});
adjustBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});
closeAdjustments.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});
lockBtn.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    colorDivs[index].classList.toggle("locked");
    if (colorDivs[index].classList.contains("locked")) {
      let icon = button;
      let lockicon = document.createElement("i");
      let unlockicon = button.querySelector("svg");
      lockicon.classList = "fas fa-lock";
      icon.appendChild(lockicon);
      icon.removeChild(unlockicon);
    } else {
      let icon = button;
      let unlockicon = document.createElement("i");
      let lockicon = button.querySelector("svg");
      unlockicon.classList = "fas fa-lock-open";
      icon.appendChild(unlockicon);
      icon.removeChild(lockicon);
    }
  });
});
generateBtn.addEventListener("click", randomColors);
//Functions
// color generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}
// function check contrast in the text
function checkTextConstrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

// slider colorize
function colorizeSliders(color, hue, brightness, saturation) {
  // scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  // Scale Brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);
  //Scale Hue

  // input update
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75), rgb(75,204,204),rgb(75,75,204), rgb(204,75,204),rgb(204,75,75))`;
}
// Hsl controls
function hslControls(e) {
  const index =
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");
  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  let bgColor = initialColors[index];
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;
  // colorize inputs/slider/slider
  colorizeSliders(color, hue, brightness, saturation);
}

// set random color
function randomColors() {
  //
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    // Add to array
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }
    // console.log(randomColor.hex());
    // Add the color to the bg
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    checkTextConstrast(randomColor, hexText);
    // Initial Colorize sliders
    const color = chroma(randomColor);
    const slider = div.querySelectorAll(".sliders input");
    const hue = slider[0];
    const brightness = slider[1];
    const saturation = slider[2];
    colorizeSliders(color, hue, brightness, saturation);
  });
  // reset inputs
  resetInputs();
  // check for btn contrast
  adjustBtn.forEach((button, index) => {
    checkTextConstrast(initialColors[index], button);
    checkTextConstrast(initialColors[index], lockBtn[index]);
  });
}
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();
  // check contrast
  checkTextConstrast(color, textHex);
  for (icon of icons) {
    checkTextConstrast(color, icon);
  }
}
function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColr = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColr).hsl()[0];
      slider.value = Math.floor(hueValue);
    }

    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }

    if (slider.name === "saturation") {
      const saturationColur = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(saturationColur).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}
function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  // Pop up animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}
function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

// Implement Save to palette and Local Storage
const saveBtn = document.querySelector(".save");
const submitBtm = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const LibraryContainer = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");
const closeLibraryBtn = document.querySelector(".close-library");

// Event Listerners
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePanel);
submitBtm.addEventListener("click", savePalettes);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}
function closePanel(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.add("remove");
}
function savePalettes(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  // generate Object
  let paletteNr = savedPalettes.length;
  const paletteObj = { name, colors, nr: paletteNr };
  savedPalettes.push(paletteObj);
  // saved to local storage
  savedToLocal(paletteObj);
  saveInput.value = "";
  // Generate the Palette for the Library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallC) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.background = smallC;
    preview.appendChild(smallDiv);
  });
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "Select";
  // Attach event to the btn
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1];
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextConstrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  // Append to Library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  LibraryContainer.children[0].appendChild(palette);
}
function savedToLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}
function openLibrary() {
  const popup = LibraryContainer.children[0];
  LibraryContainer.classList.add("active");
  popup.classList.add("active");
}
function closeLibrary() {
  const popup = LibraryContainer.children[0];
  LibraryContainer.classList.remove("active");
  popup.classList.remove("active");
}
function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    const palettesObjects = JSON.parse(localStorage.getItem("palettes"));
    palettesObjects.forEach((paletteObj) => {
      // Generate the Palette for the Library
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((smallC) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.background = smallC;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.nr);
      paletteBtn.innerText = "Select";
      // Attach event to the btn
      paletteBtn.addEventListener("click", (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[1];
        initialColors = [];
        palettesObjects[paletteIndex].colors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextConstrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });
      // Append to Library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      LibraryContainer.children[0].appendChild(palette);
    });
  }
}
getLocal();
randomColors();
