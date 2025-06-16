// script.js (Modified to use Firebase instead of localStorage)

// ====== Firebase Setup ======
const dbRef = firebase.database().ref("marks");

let xData = [];
let yData = [];

// ====== Load Data from Firebase ======
dbRef.once("value", (snapshot) => {
  const data = snapshot.val() || {};
  xData = Object.keys(data);
  yData = Object.values(data);
  updateChart();
});

// ====== Get CSS Variables ======
const styles = getComputedStyle(document.documentElement);
const colorPrimary = styles.getPropertyValue("--color-primary").trim();
const colorLabel = styles.getPropertyValue("--color-label").trim();
const colorText = styles.getPropertyValue("--color-text").trim();
const fontFamily = styles.getPropertyValue("--font-family").trim();
const lightTextColor = colorText;
const darkTextColor = "#ffffff22";

// ====== Chart Configuration ======
const chartOptions = {
  chart: {
    type: "bar",
    toolbar: { show: false },
    height: 500,
    background: "transparent",
  },
  plotOptions: {
    bar: {
      borderRadius: 5,
      columnWidth: "60%",
      borderRadiusApplication: "end",
      colors: {
        ranges: [
          { from: 75, to: 100, color: "#5CB338" },
          { from: 65, to: 74.99, color: "#074799" },
          { from: 55, to: 64.99, color: "#7BD3EA" },
          { from: 35, to: 54.99, color: "#FFE31A" },
          { from: 0, to: 34.99, color: "#CC2B52" },
        ],
      },
      dataLabels: { position: "top" },
    },
  },
  dataLabels: {
    enabled: true,
    position: 'top',
    offsetY: -15,
    formatter: function (val) {
      if (val === 0) return "AB";
      if (val === 100) return "";
      return val;
    },
    style: {
      fontSize: '10px',
      fontFamily: fontFamily,
      colors: [colorText],
    },
  },
  series: [{ name: "", data: yData }],
  xaxis: {
    categories: xData,
    labels: {
      rotate: -90,
      show: true,
      style: { colors: colorText, fontFamily },
    },
    axisTicks: { show: false },
    axisBorder: { show: false },
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: {
      show: true,
      style: { colors: colorText, fontFamily },
    },
    axisBorder: { show: false },
  },
  colors: [colorPrimary],
  grid: { show: true, borderColor: colorText },
  tooltip: {
    enabled: false,
    followCursor: false,
    custom: ({ series, seriesIndex, dataPointIndex }) =>
      `<div style="padding: 1px 5px; color: #333; background: #eee; border-radius: 4px;"><strong>${series[seriesIndex][dataPointIndex]}%</strong></div>`
  }
};

if (window.innerWidth < 900) {
  chartOptions.xaxis.labels.style.fontSize = "6px";
  chartOptions.yaxis.labels.style.fontSize = "8px";
  chartOptions.dataLabels.style.fontSize = "0px";
}

const chart = new ApexCharts(document.querySelector(".area-chart"), chartOptions);
chart.render();

// ====== Dark/Light Theme Toggle ======
let darkmode = localStorage.getItem('darkmode');
const themeSwitch = document.getElementById('theme-switch');

const enableDarkmode = () => {
  document.body.classList.add('darkmode');
  localStorage.setItem('darkmode', 'active');
};

const disableDarkmode = () => {
  document.body.classList.remove('darkmode');
  localStorage.setItem('darkmode', null);
};

if(darkmode === "active") enableDarkmode();

themeSwitch.addEventListener("click", () => {
  darkmode = localStorage.getItem('darkmode');
  const isActivatingDark = darkmode !== "active";
  isActivatingDark ? enableDarkmode() : disableDarkmode();
});

document.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    document.getElementById("myButton").click();
  }
});

// ====== Save to Firebase ======
function saveDataToFirebase() {
  const data = {};
  xData.forEach((x, i) => {
    data[x] = yData[i];
  });
  dbRef.set(data);
}

// ====== Chart Update ======
function updateChart() {
  chart.updateOptions({
    series: [{ data: yData }],
    xaxis: { categories: xData },
  });
  renderList();
}

// ====== Add Data ======
function addData() {
  const xInput = document.getElementById("xValue");
  const yInput = document.getElementById("yValue");
  const xVal = xInput.value.trim();
  const yVal = parseFloat(yInput.value);

  if (xVal && !isNaN(yVal) && yVal >= 0 && yVal <= 100) {
    xData.push(xVal);
    yData.push(yVal);
    updateChart();
    saveDataToFirebase();
    xInput.value = "";
    yInput.value = "";
  } else {
    alert("Please enter valid X and Y values (Y should be 0–100).");
  }
}

// ====== Render List ======
function renderList() {
  const list = document.getElementById("dataList");
  list.innerHTML = "";
  xData.forEach((x, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div class="renderlist">
        <div><b>P${x}</b></div>
        <div>${yData[i]}</div>          
        <div><button class="edit" onclick="editData(${i})"><i class='bx bx-edit'></i></button></div> 
        <div><button class="del" onclick="deleteData(${i})"><i class='bx bx-trash'></i></button></div> 
      </div>`;
    list.appendChild(li);
  });
}

// ====== Edit Data ======
function editData(index) {
  const newX = prompt("Enter new X value:", xData[index]);
  const newY = prompt("Enter new Y value:", yData[index]);

  if (newX !== null && newY !== null && !isNaN(parseFloat(newY))) {
    xData[index] = newX;
    yData[index] = parseFloat(newY);
    updateChart();
    saveDataToFirebase();
  }
}

// ====== Delete Data ======
function deleteData(index) {
  xData.splice(index, 1);
  yData.splice(index, 1);
  updateChart();
  saveDataToFirebase();
}

renderList();
