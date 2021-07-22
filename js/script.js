const chart1 = document.querySelector(".chart-bar");

var ctx = chart1.getContext("2d");
var myChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: ["Cars", "People", "Truck", "Bicycle"],
    datasets: [
      {
        label: "# Count",
        data: [125, 50, 20, 15],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

const chart2 = document.querySelector(".chart-pie");

var ctx = chart2.getContext("2d");
var myChart = new Chart(ctx, {
  type: "pie",
  data: {
    labels: ["Cars", "People", "Truck", "Bicycle"],
    datasets: [
      {
        label: "# Count",
        data: [125, 50, 20, 15],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
});

$(document).ready(function () {
  $(".data-table").each(function (_, table) {
    $(table).DataTable();
  });
});
