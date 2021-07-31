var data1 = [['Sun Jan 15 2017',150000000],
    ['Mon Jan 16 2017',160379978],
    ['Tue Jan 17 2017',170493749],
    ['Wed Jan 18 2017',160785250],
    ['Thu Jan 19 2017',167391904],
    ['Fri Jan 20 2017',161576838],
    ['Sat Jan 21 2017',161413854],
    ['Sun Jan 22 2017',152177211]]

    var data2 = [['Sun Jan 15 2017',150000000],
    ['Mon Jan 16 2017',123456345],
    ['Tue Jan 17 2017',112345678],
    ['Wed Jan 18 2017',165433330],
    ['Thu Jan 19 2017',167899432],
    ['Fri Jan 20 2017',111576838],
    ['Sat Jan 21 2017',131413854],
    ['Sun Jan 22 2017',122177211]]

    var data3 = [['Sun Jan 15 2017',123000000],
    ['Mon Jan 16 2017',100379978],
    ['Tue Jan 17 2017',145493749],
    ['Wed Jan 18 2017',165785250],
    ['Thu Jan 19 2017',123459194],
    ['Fri Jan 20 2017',165476838],
    ['Sat Jan 21 2017',134513854],
    ['Sun Jan 22 2017',123457721]]

        var options = {
            series: [{
                name: 'Cars',
                data: data1
              },
              {
                name: 'People',
                data: data2
              },
              {
                name: 'Bicycles',
                data: data3
              }],
            chart: {
            type: 'area',
            stacked: false,
            height: 280,
            zoom: {
              type: 'x',
              enabled: true,
              autoScaleYaxis: true
            },
            toolbar: {
              autoSelected: 'zoom'
            }
          },
          dataLabels: {
            enabled: false
          },
          markers: {
            size: 0,
          },
          title: {
            text: 'Vehicle Movement',
            align: 'left'
          },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              inverseColors: false,
              opacityFrom: 0.5,
              opacityTo: 0,
              stops: [0, 90, 100]
            },
          },
          yaxis: {
            labels: {
              formatter: function (val) {
                return (val / 1000000).toFixed(0);
              },
            },
            title: {
              text: 'Price'
            },
          },
          xaxis: {
            type: 'datetime',
          },
          tooltip: {
            shared: false,
            y: {
              formatter: function (val) {
                return (val / 1000000).toFixed(0)
              }
            }
          }
          };
  
          var chart = new ApexCharts(document.querySelector("#chart1"), options);
          chart.render();