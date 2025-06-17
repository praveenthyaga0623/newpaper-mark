// ==================== Firebase Setup ====================
const dbRef = firebase.database().ref("marks");

let xData = [];
let yData = [];

// Load data from Firebase and update chart
dbRef.once("value", (snapshot) => {
  const data = snapshot.val() || {};
  xData = Object.keys(data);
  yData = Object.values(data);
  updateChart();
});

// ==================== Chart Styling from CSS ====================
const styles = getComputedStyle(document.documentElement);
const colorText = styles.getPropertyValue("--color-text").trim();
const fontFamily = styles.getPropertyValue("--font-family").trim();

// ==================== Chart Configuration ====================
const chartOptions = {
  chart: {
    type: "bar",
    height: 500,
    background: "transparent",
    toolbar: { show: false },
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
    offsetY: -15,
    position: "top",
    formatter: (val) => (val === 0 ? "AB" : val === 100 ? "" : val),
    style: {
      fontSize: "10px",
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
      style: {
        colors: colorText,
        fontFamily: fontFamily,
      },
    },
    axisTicks: { show: false },
    axisBorder: { show: false },
  },
  yaxis: {
    min: 0,
    max: 100,
    labels: {
      show: true,
      style: {
        colors: colorText,
        fontFamily: fontFamily,
      },
    },
    axisBorder: { show: false },
  },
  grid: {
    show: true,
    borderColor: colorText,
  },
  tooltip: {
    enabled: true,
    followCursor: false,
    custom: ({ series, seriesIndex, dataPointIndex }) =>
      `<div style="padding: 1px 5px; color: #333; background: #eee; border-radius: 4px;"><strong>${series[seriesIndex][dataPointIndex]}%</strong></div>`,
  },
};

// Mobile font size adjustments
if (window.innerWidth < 900) {
  chartOptions.xaxis.labels.style.fontSize = "6px";
  chartOptions.yaxis.labels.style.fontSize = "8px";
  chartOptions.dataLabels.style.fontSize = "0px";
}

// Initialize chart
const chart = new ApexCharts(document.querySelector(".area-chart"), chartOptions);
chart.render();

// ==================== Theme Toggle ====================
let darkmode = localStorage.getItem("darkmode");
const themeSwitch = document.getElementById("theme-switch");

const enableDarkmode = () => {
  document.body.classList.add("darkmode");
  localStorage.setItem("darkmode", "active");
};

const disableDarkmode = () => {
  document.body.classList.remove("darkmode");
  localStorage.setItem("darkmode", null);
};

if (darkmode === "active") enableDarkmode();

themeSwitch.addEventListener("click", () => {
  darkmode = localStorage.getItem("darkmode");
  darkmode !== "active" ? enableDarkmode() : disableDarkmode();
});

// Keyboard Enter to Add
document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    document.getElementById("myButton").click();
  }
});

// ==================== Data Handling ====================
function saveDataToFirebase() {
  const data = {};
  xData.forEach((x, i) => (data[x] = yData[i]));
  dbRef.set(data);
}

function updateChart() {
  chart.updateOptions({
    series: [{ data: yData }],
    xaxis: { categories: xData },
  });
  renderList();
}

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

function editData(index) {
  const newX = prompt("Enter new X value:", xData[index]);
  const newY = prompt("Enter new Y value:", yData[index]);

  if (newX !== null && newY !== null && !isNaN(parseFloat(newY))) {
    xData[index] = newX.trim();
    yData[index] = parseFloat(newY);
    updateChart();
    saveDataToFirebase();
  }
}

function deleteData(index) {
  xData.splice(index, 1);
  yData.splice(index, 1);
  updateChart();
  saveDataToFirebase();
}

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

// Initial rendering of list
renderList();
